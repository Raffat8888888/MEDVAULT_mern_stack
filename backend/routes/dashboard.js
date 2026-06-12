const express = require("express");
const router = express.Router();
const User = require("../models/User");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const axios = require("axios");

// Get Departments
router.get("/", async (req, res) => {
  try {
    const { adminId } = req.query;
    const admin = await User.findById(adminId);
    if (!admin) return res.status(403).json({ error: "User not found" });

    res.json({ departments: admin.departments || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Department
router.post("/add-department", async (req, res) => {
  try {
    const { adminId, departmentName } = req.body;
    const admin = await User.findById(adminId);
    if (!admin) return res.status(403).json({ error: "User not found" });
    if (!admin.departments) admin.departments = [];

    admin.departments.push({ name: departmentName, professionals: [] });
    await admin.save();

    res.json({ success: true, departments: admin.departments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Department
router.delete("/delete-department", async (req, res) => {
  try {
    const { adminId, departmentName } = req.body;
    const admin = await User.findById(adminId);
    if (!admin) return res.status(403).json({ error: "User not found" });

    admin.departments = admin.departments.filter(
      (d) => d.name !== departmentName
    );
    await admin.save();

    res.json({ success: true, departments: admin.departments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Professional
router.post("/add-professional", async (req, res) => {
  try {
    const { adminId, departmentName, name, email, role } = req.body;
    const admin = await User.findById(adminId);
    if (!admin) return res.status(403).json({ error: "User not found" });

    const dept = admin.departments.find((d) => d.name === departmentName);
    if (!dept) return res.status(404).json({ error: "Department not found" });

    let generatedPassword = null;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      const randomPassword = crypto.randomBytes(4).toString("hex");
      const hash = await bcrypt.hash(randomPassword, 10);
      const newUser = new User({
        name,
        email,
        password: hash,
        role,
        createdBy: adminId
      });
      await newUser.save();
      generatedPassword = randomPassword;

      // --- Add this try/catch block here ---
      try {
        await axios.post(`http://localhost:5000/api/auditlogs/${adminId}`, {
          action: `Created professional (${role}) with email ${email}`
        });
        console.log("Audit log added for admin:", adminId);
      } catch (err) {
        console.error("Error adding audit log:", err.response ? err.response.data : err.message);
      }
      // --- End try/catch block ---
    }

    dept.professionals.push({ name, email, role });
    await admin.save();

    res.json({ success: true, department: dept, generatedPassword });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit Professional (name + email)
router.put("/edit-professional", async (req, res) => {
  try {
    const { adminId, departmentName, oldEmail, newName, newEmail } = req.body;
    const admin = await User.findById(adminId);
    if (!admin) return res.status(403).json({ error: "User not found" });

    const dept = admin.departments.find((d) => d.name === departmentName);
    if (!dept) return res.status(404).json({ error: "Department not found" });

    const professional = dept.professionals.find((p) => p.email === oldEmail);
    if (!professional)
      return res.status(404).json({ error: "Professional not found" });

    professional.name = newName;
    professional.email = newEmail;
    await admin.save();

    // Update in User collection
    await User.findOneAndUpdate(
      { email: oldEmail },
      { name: newName, email: newEmail }
    );

    res.json({ success: true, department: dept });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Professional
router.delete("/delete-professional", async (req, res) => {
  try {
    const { adminId, departmentName, email } = req.body;
    const admin = await User.findById(adminId);
    if (!admin) return res.status(403).json({ error: "User not found" });

    const dept = admin.departments.find((d) => d.name === departmentName);
    if (!dept) return res.status(404).json({ error: "Department not found" });

    dept.professionals = dept.professionals.filter((p) => p.email !== email);
    await admin.save();

    await User.deleteOne({ email });

    res.json({ success: true, department: dept });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
