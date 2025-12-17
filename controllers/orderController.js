const axios = require("axios");
const Order = require("../models/Order");
const Invoice = require("../models/Invoice");

exports.initializePayment = async (req, res) => {
  try {
    const { userName, email, phone, address, cartItems, totalAmount } = req.body;

    // CREATE order record BEFORE sending to paystack
    const order = await Order.create({
      userName,
      email,
      phone,
      address,
      totalAmount,
      cartItems,
      status: "pending",
    });

    // Initialize paystack payment
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: totalAmount * 100, // convert to kobo
        callback_url: `${process.env.BASE_URL}/orders/verify-payment`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Save the reference
    order.reference = response.data.data.reference;
    await order.save();

    res.json({
      authorization_url: response.data.data.authorization_url,
      reference: response.data.data.reference,
    });

  } catch (error) {
    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
};

// VERIFY PAYMENT
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.query;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const status = response.data.data.status;

    const order = await Order.findOne({ where: { reference } });

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (status === "success") {
      order.status = "paid";
      await order.save();

      // CREATE INVOICE AFTER SUCCESSFUL PAYMENT
      await Invoice.create({
        reference: order.reference,
        customerName: order.userName,
        email: order.email,
        phone: order.phone,
        address: order.address,
        totalAmount: order.totalAmount,
        status: "paid",
        items: order.cartItems
      });

      return res.redirect(`${process.env.FRONTEND_URL}/payment-success.html`);
    } else {
      order.status = "failed";
      await order.save();

      // CREATE FAILED INVOICE RECORD
      await Invoice.create({
        reference: order.reference,
        customerName: order.userName,
        email: order.email,
        phone: order.phone,
        address: order.address,
        totalAmount: order.totalAmount,
        status: "failed",
        items: order.cartItems
      });

      return res.redirect(`${process.env.FRONTEND_URL}/payment-failed.html`);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PAYSTACK WEBHOOK
exports.paystackWebhook = async (req, res) => {
  try {
    const event = req.body;

    if (event.event === "charge.success") {
      const reference = event.data.reference;

      await Order.update(
        { status: "paid" },
        { where: { reference } }
      );

      // ALSO UPDATE INVOICE STATUS VIA WEBHOOK
      await Invoice.update(
        { status: "paid" },
        { where: { reference } }
      );
    }

    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(400);
  }
};