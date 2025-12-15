const { Op } = require("sequelize");
const Order = require("../models/Order");
const Newsletter = require("../models/Newsletter");
const ScheduledPost = require("../models/ScheduledPost");

exports.getRecentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    /* ================= ORDERS ================= */
    const orders = await Order.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
    });

    const orderActivities = orders.map(order => ({
      type: "order",
      title: "New Order",
      message: `Order #${order.reference || order.id} placed by ${order.userName}`,
      data: {
        orderId: order.id,
        amount: order.totalAmount,
        status: order.status,
      },
      createdAt: order.createdAt,
    }));

    /* ================= SUBSCRIBERS ================= */
    const subscribers = await Newsletter.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
    });

    const subscriberActivities = subscribers.map(sub => ({
      type: "subscriber",
      title: "New Subscriber",
      message: `${sub.email} subscribed to newsletter`,
      data: {
        subscriberId: sub.id,
      },
      createdAt: sub.createdAt,
    }));

    /* ================= SCHEDULED POSTS ================= */
    const posts = await ScheduledPost.findAll({
      where: {
        isActive: true,
        scheduledAt: { [Op.lte]: new Date() },
      },
      limit: 5,
      order: [["scheduledAt", "DESC"]],
    });

    const postActivities = posts.map(post => ({
      type: "scheduled_post",
      title: "Post Went Live",
      message: `Scheduled post for product #${post.productId} is now live`,
      data: {
        postId: post.id,
        productId: post.productId,
      },
      createdAt: post.scheduledAt,
    }));

    /* ================= MERGE & SORT ================= */
    const activities = [
      ...orderActivities,
      ...subscriberActivities,
      ...postActivities,
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);

    res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
