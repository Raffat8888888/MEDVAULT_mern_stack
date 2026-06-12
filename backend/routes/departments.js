const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Get available departments (static for now, but can later fetch dynamically)
router.get("/", (req, res) => {
  const departments = [
    { name: "Cardiology", modules: ["Vitals", "Medical History"] },
    { name: "Radiology", modules: ["Documents"] },
  ];
  res.json(departments);
});

// Assign permissions to a user for a department
router.post("/assign", async (req, res) => {
  try {
    const { userId, department, modules, permissions } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Grant permissions for each module
    modules.forEach(mod => {
      user.permissions.set(mod, {
        read: permissions.read || false,
        write: permissions.write || false
      });
    });

    // Add audit log
    user.auditLogs.push({
      action: `Assigned ${JSON.stringify(permissions)} for ${department}`,
    });

    await user.save();
    res.json({ message: "Permissions updated", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a user’s permissions
router.get("/:userId/permissions", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ permissions: user.permissions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
