// routes/ambulance.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/ambulanceAuthMiddleware");
const Ambulance = require("../model/ambulanceModel");

// PATCH /api/ambulance/status
router.patch("/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["AVAILABLE", "BUSY", "OFFLINE"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const ambulance = await Ambulance.findByIdAndUpdate(
      req.user._id,
      { status },
      { new: true }
    );

    res.json({ ambulance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
