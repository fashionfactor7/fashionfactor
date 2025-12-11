const Broadcast = require("../models/Broadcast");

// CREATE BROADCAST
exports.createBroadcast = async (req, res) => {
  try {
    const { title, message, scheduledAt } = req.body;

    const broadcast = await Broadcast.create({ title, message, scheduledAt });

    res.status(201).json({
      message: "Broadcast created successfully",
      broadcast
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL BROADCASTS
exports.getBroadcasts = async (req, res) => {
  try {
    const broadcasts = await Broadcast.findAll({
      order: [["createdAt", "DESC"]]
    });

    res.json(broadcasts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE BROADCAST
exports.deleteBroadcast = async (req, res) => {
  try {
    const broadcast = await Broadcast.findByPk(req.params.id);

    if (!broadcast) return res.status(404).json({ message: "Broadcast not found" });

    await broadcast.destroy();

    res.json({ message: "Broadcast deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
