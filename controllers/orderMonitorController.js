const Order = require("../models/Order");

// 1️⃣ Get ALL orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2️⃣ Get latest UNSEEN orders
exports.getUnseenOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { seen: false },
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3️⃣ Mark order as SEEN
exports.markOrderAsSeen = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.seen = true;
    order.seenAt = new Date();
    await order.save();

    res.json({
      success: true,
      message: "Order marked as seen",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4️⃣ Admin order statistics
exports.getOrderStatistics = async (req, res) => {
  try {
    const totalOrders = await Order.count();
    const paidOrders = await Order.count({ where: { status: "paid" } });
    const failedOrders = await Order.count({ where: { status: "failed" } });
    const unseenOrders = await Order.count({ where: { seen: false } });

    const totalRevenue = await Order.sum("totalAmount", {
      where: { status: "paid" },
    });

    res.json({
      success: true,
      stats: {
        totalOrders,
        paidOrders,
        failedOrders,
        unseenOrders,
        totalRevenue: totalRevenue || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
