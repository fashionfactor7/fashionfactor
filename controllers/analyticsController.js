const { Op } = require("sequelize");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Newsletter = require("../models/Newsletter");
const Admin = require("../models/Admin"); // optional

exports.getDashboardAnalytics = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );

    /* ---------------- ORDERS ---------------- */
    const totalOrders = await Order.count();
    const paidOrders = await Order.count({ where: { status: "paid" } });
    const pendingOrders = await Order.count({ where: { status: "pending" } });
    const failedOrders = await Order.count({ where: { status: "failed" } });
    const unseenOrders = await Order.count({ where: { seen: false } });

    const ordersToday = await Order.count({
      where: { createdAt: { [Op.gte]: todayStart } },
    });

    /* ---------------- REVENUE ---------------- */
    const totalRevenue = await Order.sum("totalAmount", {
      where: { status: "paid" },
    });

    const revenueToday = await Order.sum("totalAmount", {
      where: {
        status: "paid",
        createdAt: { [Op.gte]: todayStart },
      },
    });

    const revenueThisMonth = await Order.sum("totalAmount", {
      where: {
        status: "paid",
        createdAt: { [Op.gte]: monthStart },
      },
    });

    const avgOrderValue =
      paidOrders > 0 ? (totalRevenue / paidOrders).toFixed(2) : 0;

    /* ---------------- PRODUCTS ---------------- */
    const totalProducts = await Product.count();
    const activeProducts = await Product.count({ where: { isActive: true } });
    const featuredProducts = await Product.count({ where: { featured: true } });
    const outOfStockProducts = await Product.count({
      where: { stock: { [Op.lte]: 0 } },
    });

    /* ---------------- USERS / SUBSCRIBERS ---------------- */
    const totalSubscribers = await Newsletter.count();

    const subscribersToday = await Newsletter.count({
      where: { createdAt: { [Op.gte]: todayStart } },
    });

    /* ---------------- RESPONSE ---------------- */
    res.json({
      success: true,
      data: {
        orders: {
          totalOrders,
          paidOrders,
          pendingOrders,
          failedOrders,
          unseenOrders,
          ordersToday,
        },
        revenue: {
          totalRevenue: totalRevenue || 0,
          revenueToday: revenueToday || 0,
          revenueThisMonth: revenueThisMonth || 0,
          avgOrderValue,
        },
        products: {
          totalProducts,
          activeProducts,
          featuredProducts,
          outOfStockProducts,
        },
        subscribers: {
          totalSubscribers,
          subscribersToday,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
