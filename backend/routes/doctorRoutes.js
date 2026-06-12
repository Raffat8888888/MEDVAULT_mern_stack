const express = require("express");
const router = express.Router();
const User = require("../models/User");

// -------------------------
// Add existing patient
// -------------------------
router.post("/add-existing-patient", async (req, res) => {
  try {
    const { doctorId, patientEmail } = req.body;
    const doctor = await User.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const patient = await User.findOne({ email: patientEmail });
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    const doctorIdStr = doctor._id.toString();

    if (!patient.permissions) patient.permissions = new Map();
    if (!patient.permissions.has(doctorIdStr)) {
      patient.permissions.set(doctorIdStr, {
        read: false, write: false, edit: false, delete: false,
        upload: false, export: false, share: false, approve: false
      });
      await patient.save();
    }

    if (!doctor.patients.includes(patient._id)) {
      doctor.patients.push(patient._id);
      await doctor.save();
    }

    res.json({ message: "Existing patient linked successfully", patient });
  } catch (err) {
    console.error("Add existing patient error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------
// Add new patient
// -------------------------
router.post("/add-new-patient", async (req, res) => {
  try {
    const { doctorId, name, email } = req.body;
    const doctor = await User.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    let patient = await User.findOne({ email });
    if (patient) return res.status(400).json({ error: "Patient with this email already exists" });

    patient = new User({
      name,
      email,
      role: "patient",
      permissions: new Map()
    });

    const doctorIdStr = doctor._id.toString();
    patient.permissions.set(doctorIdStr, {
      read: false, write: false, edit: false, delete: false,
      upload: false, export: false, share: false, approve: false
    });

    await patient.save();

    doctor.patients.push(patient._id);
    await doctor.save();

    res.json({ message: "New patient created and linked successfully", patient });
  } catch (err) {
    console.error("Add new patient error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------
// Get patients for a doctor
// -------------------------
router.get("/patients", async (req, res) => {
  try {
    const { doctorId } = req.query;
    if (!doctorId) return res.status(400).json({ error: "DoctorId is required" });

    const doctor = await User.findById(doctorId).populate("patients", "name email");
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    res.json({ patients: doctor.patients || [] });
  } catch (err) {
    console.error("Get patients error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------
// Request access to patient sections
// -------------------------
router.post("/request-access", async (req, res) => {
  try {
    const { doctorId, patientId, sections } = req.body;
    const patient = await User.findById(patientId);
    const doctor = await User.findById(doctorId);

    if (!patient) return res.status(404).json({ error: "Patient not found" });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const doctorIdStr = doctorId.toString();
    if (!patient.permissions) patient.permissions = new Map();

    // Update permissions
    sections.forEach(section => {
      patient.permissions.set(doctorIdStr, {
        ...patient.permissions.get(doctorIdStr),
        [section]: "pending"
      });
    });

    // Create notification message
    const message = `Dr. ${doctor.name} has requested access to: ${sections.join(", ")}`;

    // Add notification to patient
    if (!patient.notifications) patient.notifications = [];
    patient.notifications.push({ message, date: new Date(), read: false });

    await patient.save();

    res.json({ message: "Access request sent successfully" });
  } catch (err) {
    console.error("Request access error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/grant-access', async (req, res) => {
  const { doctorId, patientId, section } = req.body;
  try {
    const patient = await User.findById(patientId);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    // Example: permissions is an object like { doctorId: { Demographics: true, Vitals: false, ... } }
    if (!patient.permissions) patient.permissions = {};
    if (!patient.permissions[doctorId]) patient.permissions[doctorId] = {};
    patient.permissions[doctorId][section] = true;

    await patient.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
