const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Get login history for staff users only (exclude patients)
router.get("/", async (req, res) => {
  try {
    const staffUsers = await User.find(
      { role: { $ne: "patient" } }, // exclude patients
      "email role loginHistory"
    ).sort({ "loginHistory.timestamp": -1 });

    res.json(staffUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/created-by/:adminId", async (req, res) => {
  try {
    const { adminId } = req.params;
    const users = await User.find(
      { createdBy: adminId, role: { $ne: "patient" } },
      "email role loginHistory"
    ).sort({ "loginHistory.timestamp": -1 });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
