const Newsletter = require("../models/Newsletter");

// SUBSCRIBE USER
exports.subscribe = async (req, res) => {
  try {
    const { name, email } = req.body;

    const exists = await Newsletter.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ message: "Email already subscribed" });
    }

    const subscriber = await Newsletter.create({ name, email });

    res.status(201).json({
      message: "Subscribed successfully",
      subscriber,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL SUBSCRIBERS
exports.getSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE SUBSCRIBER
exports.deleteSubscriber = async (req, res) => {
  try {
    const subscriber = await Newsletter.findByPk(req.params.id);

    if (!subscriber)
      return res.status(404).json({ message: "Subscriber not found" });

    await subscriber.destroy();

    res.json({ message: "Subscriber removed" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
