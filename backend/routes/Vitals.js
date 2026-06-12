const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Save vitals
router.post("/", async (req, res) => {
  const { userId, height, weight, bmi, bloodPressure, bloodSugar } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID missing" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.vitals = {
      height,
      weight,
      bmi,
      bloodPressure,
      bloodSugar
    };


    await user.save();
    res.status(200).json({ message: "Vitals saved successfully", vitals: user.vitals });
  } catch (err) {
    console.error("Error saving vitals:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
