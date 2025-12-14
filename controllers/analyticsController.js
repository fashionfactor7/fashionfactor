const { Op } = require("sequelize");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Newsletter = require("../models/Newsletter");
const Invoice = require("../models/Invoice");
const Admin = require("../models/Admin");
/* =====================================================
   DASHBOARD SUMMARY
===================================================== */
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );

    const totalOrders = await Order.count();
    const paidOrders = await Order.count({ where: { status: "paid" } });
    const pendingOrders = await Order.count({ where: { status: "pending" } });
    const failedOrders = await Order.count({ where: { status: "failed" } });
    const unseenOrders = await Order.count({ where: { seen: false } });

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

    const totalProducts = await Product.count();
    const activeProducts = await Product.count({ where: { isActive: true } });
    const featuredProducts = await Product.count({ where: { featured: true } });
    const outOfStockProducts = await Product.count({
      where: { stock: { [Op.lte]: 0 } },
    });

    const totalSubscribers = await Newsletter.count();

    res.json({
      success: true,
      data: {
        orders: {
          totalOrders,
          paidOrders,
          pendingOrders,
          failedOrders,
          unseenOrders,
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
        },
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =====================================================
   🔥 BEST SELLING PRODUCTS
===================================================== */
exports.getBestSellingProducts = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { status: "paid" },
      attributes: ["cartItems"],
    });

    const productMap = {};

    orders.forEach(order => {
      order.cartItems.forEach(item => {
        if (!productMap[item.productId]) {
          productMap[item.productId] = {
            productId: item.productId,
            name: item.name,
            quantitySold: 0,
            revenue: 0,
          };
        }

        productMap[item.productId].quantitySold += item.quantity;
        productMap[item.productId].revenue += item.price * item.quantity;
      });
    });

    const bestSellers = Object.values(productMap)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 10);

    res.json({ success: true, data: bestSellers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =====================================================
   📈 MONTHLY REVENUE CHART
===================================================== */
exports.getMonthlyRevenue = async (req, res) => {
  try {
    const revenue = await Order.findAll({
      where: { status: "paid" },
      attributes: [
        [
          Order.sequelize.fn(
            "DATE_TRUNC",
            "month",
            Order.sequelize.col("createdAt")
          ),
          "month",
        ],
        [
          Order.sequelize.fn("SUM", Order.sequelize.col("totalAmount")),
          "total",
        ],
      ],
      group: ["month"],
      order: [[Order.sequelize.literal("month"), "ASC"]],
    });

    res.json({ success: true, data: revenue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =====================================================
   🧾 ORDER → INVOICE ANALYTICS
===================================================== */
exports.getOrderInvoiceAnalytics = async (req, res) => {
  try {
    const totalOrders = await Order.count();
    const totalInvoices = await Invoice.count();

    const orderRevenue = await Order.sum("totalAmount", {
      where: { status: "paid" },
    });

    const invoiceRevenue = await Invoice.sum("totalAmount", {
      where: { status: "paid" },
    });

    const conversionRate =
      totalOrders > 0
        ? ((totalInvoices / totalOrders) * 100).toFixed(2)
        : 0;

    res.json({
      success: true,
      data: {
        totalOrders,
        totalInvoices,
        conversionRate: `${conversionRate}%`,
        orderRevenue: orderRevenue || 0,
        invoiceRevenue: invoiceRevenue || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
