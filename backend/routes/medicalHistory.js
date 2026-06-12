const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId, ...medicalHistory } = req.body;

    if (!userId) return res.status(400).json({ message: "User ID required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.medicalHistory = medicalHistory;
    await user.save();

    res.status(201).json({ message: "Medical history saved successfully" });
  } catch (error) {
    console.error("Save error:", error);
    res.status(500).json({ message: "Error saving medical history" });
  }
});

module.exports = router;
