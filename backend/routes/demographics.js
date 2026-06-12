const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { demographics: req.body } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "Demographics saved", user: updatedUser });
  } catch (err) {
    console.error("Error updating demographics:", err);
    res.status(500).json({ error: "Failed to save demographics" });
  }
});

module.exports = router;
