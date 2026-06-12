const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

router.post("/register/:role", async (req, res) => {
  const { name, email, password } = req.body;
  const { role } = req.params;

  if (!["patient", "doctor", "admin"].includes(role)) {
  return res.status(400).json({ msg: "Invalid role" });
}

  const hash = await bcrypt.hash(password, 10);
  try {
    await User.create({ name, email, password: hash, role });
    res.json({ msg: `${role} registered` });
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await User.findOne({ email });
  if (!user) {
    // For security, don't reveal if user exists
    return res.json({ message: "If this email exists, a reset link has been sent." });
  }

  // Here you would generate a token and send an email.
  // For now, just respond with a message.
  res.json({ message: "If this email exists, a reset link has been sent." });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

  // Add login history entry here
  user.loginHistory.push({
    timestamp: new Date(),
    duration: null // or set as needed
  });
  await user.save();

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
  res.json({ token, role: user.role, id: user._id });
});

module.exports = router;
