const axios = require("axios");
const Order = require("../models/Order");
const Invoice = require("../models/Invoice");

// =============================================
// INITIALIZE PAYMENT
// =============================================
exports.initializePayment = async (req, res) => {
  try {
    const { userName, email, phone, address, addressData, cartItems, totalAmount, sessionId } = req.body;

    // --- Validate required fields ---
    if (!userName || !email || !phone || !address) {
      return res.status(400).json({ error: "Missing required fields: userName, email, phone, address" });
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty or invalid" });
    }

    if (!totalAmount || isNaN(Number(totalAmount)) || Number(totalAmount) <= 0) {
      return res.status(400).json({ error: "Invalid totalAmount" });
    }

    // --- Sanitize cartItems: strip large image data, keep only what's needed ---
    const sanitizedCartItems = cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      size: item.size || "M",
      price: item.price,
      name: item.name,
      category: item.category || null,
    }));

    // --- CREATE order record BEFORE sending to Paystack ---
    const order = await Order.create({
      userName: String(userName).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      address: String(address).trim(),
      addressData: addressData || null,
      totalAmount: Number(totalAmount),
      cartItems: sanitizedCartItems,
      sessionId: sessionId || null,
      status: "pending",
    });

    // --- Initialize Paystack payment ---
    const paystackResponse = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: order.email,
        amount: Math.round(Number(totalAmount) * 100), // convert to kobo, ensure integer
        callback_url: `${process.env.BASE_URL}/orders/verify-payment`,
        metadata: {
          orderId: order.id,
          sessionId: sessionId || null,
          custom_fields: [
            { display_name: "Customer Name", variable_name: "customer_name", value: userName },
            { display_name: "Phone", variable_name: "phone", value: phone },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 15000, // 15 second timeout
      }
    );

    if (!paystackResponse.data || !paystackResponse.data.data) {
      throw new Error("Invalid response from Paystack");
    }

    // --- Save the reference to the order ---
    order.reference = paystackResponse.data.data.reference;
    await order.save();

    return res.status(200).json({
      authorization_url: paystackResponse.data.data.authorization_url,
      reference: paystackResponse.data.data.reference,
      orderId: order.id,
    });

  } catch (error) {
    console.error("initializePayment error:", {
      message: error.message,
      paystackError: error.response?.data,
      stack: error.stack,
    });

    return res.status(500).json({
      error: error.response?.data?.message || error.message || "Payment initialization failed",
    });
  }
};


// =============================================
// VERIFY PAYMENT
// FIX: Returns JSON instead of redirect so the
// frontend fetch() can handle it on all browsers
// including iOS Safari. Frontend handles redirect.
// =============================================
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.query;

    if (!reference) {
      return res.status(400).json({ success: false, message: "Missing payment reference" });
    }

    // --- Verify with Paystack ---
    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
        timeout: 15000,
      }
    );

    if (!paystackResponse.data || !paystackResponse.data.data) {
      throw new Error("Invalid response from Paystack during verification");
    }

    const paystackStatus = paystackResponse.data.data.status;

    // --- Find the order ---
    const order = await Order.findOne({ where: { reference } });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // --- Avoid processing already-handled payments (idempotency) ---
    if (order.status === "paid") {
      return res.status(200).json({
        success: true,
        status: "paid",
        message: "Payment already confirmed",
        redirectUrl: `${process.env.FRONTEND_URL}/payment-success.html`,
      });
    }

    if (paystackStatus === "success") {
      // Update order
      order.status = "paid";
      await order.save();

      // Create invoice only if one doesn't already exist
      const existingInvoice = await Invoice.findOne({ where: { reference } });
      if (!existingInvoice) {
        await Invoice.create({
          reference: order.reference,
          customerName: order.userName,
          email: order.email,
          phone: order.phone,
          address: order.address,
          totalAmount: order.totalAmount,
          status: "paid",
          items: order.cartItems,
        });
      }

      // Return JSON — the frontend handles the redirect
      return res.status(200).json({
        success: true,
        status: "paid",
        message: "Payment confirmed successfully",
        redirectUrl: `${process.env.FRONTEND_URL}/payment-success.html`,
      });

    } else {
      // Payment failed
      order.status = "failed";
      await order.save();

      const existingInvoice = await Invoice.findOne({ where: { reference } });
      if (!existingInvoice) {
        await Invoice.create({
          reference: order.reference,
          customerName: order.userName,
          email: order.email,
          phone: order.phone,
          address: order.address,
          totalAmount: order.totalAmount,
          status: "failed",
          items: order.cartItems,
        });
      }

      return res.status(200).json({
        success: false,
        status: paystackStatus,
        message: "Payment was not successful",
        redirectUrl: `${process.env.FRONTEND_URL}/payment-failed.html`,
      });
    }

  } catch (error) {
    console.error("verifyPayment error:", {
      message: error.message,
      paystackError: error.response?.data,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message: error.message || "Payment verification failed",
    });
  }
};


// =============================================
// PAYSTACK WEBHOOK
// =============================================
exports.paystackWebhook = async (req, res) => {
  try {
    // Paystack webhook signature verification
    const crypto = require("crypto");
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      console.warn("Webhook signature mismatch — ignoring");
      return res.sendStatus(401);
    }

    const event = req.body;

    if (event.event === "charge.success") {
      const reference = event.data.reference;

      // Update order if not already paid (idempotent)
      const order = await Order.findOne({ where: { reference } });
      if (order && order.status !== "paid") {
        await Order.update(
          { status: "paid" },
          { where: { reference } }
        );

        // Update or create invoice
        const existingInvoice = await Invoice.findOne({ where: { reference } });
        if (existingInvoice) {
          await Invoice.update(
            { status: "paid" },
            { where: { reference } }
          );
        } else if (order) {
          await Invoice.create({
            reference: order.reference,
            customerName: order.userName,
            email: order.email,
            phone: order.phone,
            address: order.address,
            totalAmount: order.totalAmount,
            status: "paid",
            items: order.cartItems,
          });
        }
      }
    }

    return res.sendStatus(200);

  } catch (err) {
    console.error("paystackWebhook error:", err.message);
    return res.sendStatus(400);
  }
};