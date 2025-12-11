const cron = require("node-cron");
const { Op } = require("sequelize");
const ScheduledPost = require("../models/ScheduledPost");
const Product = require("../models/Product");

const activateScheduledPosts = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const postsToActivate = await ScheduledPost.findAll({
        where: {
          isActive: false,
          scheduledAt: { [Op.lte]: now }
        },
        include: [Product]
      });

      for (const post of postsToActivate) {
        // Activate product
        await post.Product.update({ isActive: true });

        // Mark scheduled post as activated
        await post.update({ isActive: true });

        console.log(
          `✅ Scheduled product activated: Product #${post.productId}`
        );
      }
    } catch (err) {
      console.error("Cron job error:", err.message);
    }
  });

  console.log("⏳ Scheduled Product Cron started!");
};

module.exports = activateScheduledPosts;
