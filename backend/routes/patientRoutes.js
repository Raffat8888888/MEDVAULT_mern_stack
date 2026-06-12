// routes/patientRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Get a single patient by ID
router.get("/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await User.findById(patientId);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    res.json({ patient });
  } catch (err) {
    console.error("Fetch patient error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get notifications for a patient
router.get("/:patientId/notifications", async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await User.findById(patientId);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    res.json({ notifications: patient.notifications || [] });
  } catch (err) {
    console.error("Fetch notifications error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Delete a notification by ID for a patient
router.delete('/notification/:notificationId', async (req, res) => {
  const { notificationId } = req.params;
  // You may want to get patientId from auth/session or req.body for extra security
  try {
    // Find the patient who has this notification
    const patient = await User.findOne({ "notifications._id": notificationId });
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    // Remove the notification
    patient.notifications = patient.notifications.filter(
      n => n._id.toString() !== notificationId
    );
    await patient.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
