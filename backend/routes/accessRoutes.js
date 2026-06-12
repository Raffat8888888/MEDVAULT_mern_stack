const express = require("express");
const router = express.Router();
const User = require("../models/User");

// --- Mapping Functions ---
// DB → Frontend
const dbToFrontend = (permissions) => {
  const obj = {};
  if (permissions instanceof Map) {
    for (let [module, actions] of permissions.entries()) {
      obj[module] = {
        view: actions.read || false,
        edit: actions.edit || false,
        delete: actions.delete || false,
        export: actions.export || false,
      };
    }
  } else if (typeof permissions === 'object' && permissions !== null) {
    // Handle case where permissions is already an object
    for (let module in permissions) {
      const actions = permissions[module];
      obj[module] = {
        view: actions.read || false,
        edit: actions.edit || false,
        delete: actions.delete || false,
        export: actions.export || false,
      };
    }
  }
  return obj;
};

// Frontend → DB
const frontendToDb = (permissions) => {
  const map = new Map();
  for (let module in permissions) {
    const actions = permissions[module];
    map.set(module, {
      read: actions.view || false,
      write: false, // not exposed in UI
      edit: actions.edit || false,
      delete: actions.delete || false,
      upload: false,
      export: actions.export || false,
      share: false,
      approve: false,
    });
  }
  return map;
};

// --- Routes ---
// GET departments
router.get("/departments", async (req, res) => {
  try {
    const users = await User.find({}, "departments");
    const deptMap = new Map();

    users.forEach(user => {
      if (user.departments && user.departments.length > 0) {
        user.departments.forEach(d => {
          if (!deptMap.has(d.name)) {
            deptMap.set(d.name, { 
              _id: d._id || d.name, 
              name: d.name, 
              professionals: d.professionals || [] 
            });
          } else {
            // Merge professionals, avoiding duplicates
            const existing = deptMap.get(d.name);
            const newProfessionals = d.professionals || [];
            const existingEmails = new Set(existing.professionals.map(p => p.email));
            
            newProfessionals.forEach(pro => {
              if (!existingEmails.has(pro.email)) {
                existing.professionals.push(pro);
                existingEmails.add(pro.email);
              }
            });
          }
        });
      }
    });

    res.json(Array.from(deptMap.values()));
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET permissions by email (since professionals might not have user docs)
router.get("/permissions/email/:email", async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email || email === 'undefined') {
      return res.status(400).json({ error: "Valid email is required" });
    }

    const user = await User.findOne({ email }, { permissions: 1, name: 1, role: 1 });
    if (!user) {
      // Return default empty permissions instead of 404
      const defaultModules = [
        "Demographics", "Vitals", "Medical History", "Documents", 
        "Prescriptions", "Lab Results", "Allergies", "Audit Logs"
      ];
      const defaultPerms = {};
      defaultModules.forEach(module => {
        defaultPerms[module] = {
          view: false,
          edit: false,
          delete: false,
          export: false
        };
      });
      return res.json(defaultPerms);
    }

    const formatted = dbToFrontend(user.permissions || new Map());
    res.json(formatted);
  } catch (err) {
    console.error("Error fetching permissions:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET permissions by ID (keep for backward compatibility)
router.get("/permissions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId || userId === 'undefined') {
      return res.status(400).json({ error: "Valid userId is required" });
    }

    const user = await User.findById(userId, { permissions: 1 });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const formatted = dbToFrontend(user.permissions || new Map());
    res.json(formatted);
  } catch (err) {
    console.error("Error fetching permissions:", err);
    if (err.name === 'CastError') {
      return res.status(400).json({ error: "Invalid user ID format" });
    }
    res.status(500).json({ error: err.message });
  }
});

// POST update permissions - support both email and ID
router.post("/update-permissions", async (req, res) => {
  try {
    const { userId, email, permissions } = req.body;
    
    if (!userId && !email) {
      return res.status(400).json({ error: "Either userId or email is required" });
    }
    
    if (!permissions || typeof permissions !== 'object') {
      return res.status(400).json({ error: "Valid permissions object is required" });
    }

    let user;
    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      user = await User.findOne({ email });
    }

    if (!user) {
      // If user doesn't exist but we have email, create a new user
      if (email && !userId) {
        user = new User({
          email,
          name: email.split('@')[0], // Use email prefix as name
          role: 'doctor', // Default role, you might want to pass this in the request
          password: 'defaultPassword123' // You should implement proper password setup
        });
        await user.save();
        console.log(`Created new user for ${email}`);
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    }

    const newPerms = frontendToDb(permissions);

    // Add to permission logs
    user.permissionLogs.push({
      changedBy: req.user?.id || "admin",
      role: user.role,
      module: "access-control",
      oldPermissions: user.permissions,
      newPermissions: newPerms,
    });

    user.permissions = newPerms;
    await user.save();

    res.json({ message: "Permissions updated successfully" });
  } catch (err) {
    console.error("Error updating permissions:", err);
    if (err.name === 'CastError') {
      return res.status(400).json({ error: "Invalid user ID format" });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;