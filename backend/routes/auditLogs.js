const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Get all audit logs with query parameters for filtering
router.get("/", async (req, res) => {
  try {
    const { 
      action, 
      role, 
      userId, 
      startDate, 
      endDate, 
      limit = 1000,
      page = 1 
    } = req.query;

    // Build query conditions
    const matchConditions = {};
    
    if (userId) {
      matchConditions._id = userId;
    }

    if (role) {
      matchConditions.role = { $regex: role, $options: 'i' };
    }

    // Find users with optional filtering
    const users = await User.find(matchConditions, { 
      name: 1, 
      role: 1, 
      email: 1,
      auditLogs: 1 
    });

    const allLogs = [];

    users.forEach(user => {
      if (user.auditLogs && user.auditLogs.length > 0) {
        user.auditLogs.forEach(log => {
          // Apply date filtering
          let includeLog = true;
          
          if (startDate) {
            const start = new Date(startDate);
            if (new Date(log.time) < start) includeLog = false;
          }
          
          if (endDate && includeLog) {
            const end = new Date(endDate);
            if (new Date(log.time) > end) includeLog = false;
          }

          // Apply action filtering
          if (action && includeLog) {
            if (!log.action?.toLowerCase().includes(action.toLowerCase())) {
              includeLog = false;
            }
          }

          if (includeLog) {
            allLogs.push({
              _id: log._id,
              action: log.action || 'Unknown Action',
              time: log.time,
              performedBy: { 
                _id: user._id,
                name: user.name || 'Unknown User', 
                role: user.role || 'Unknown Role',
                email: user.email
              }
            });
          }
        });
      }
    });

    // Sort by latest first
    allLogs.sort((a, b) => new Date(b.time) - new Date(a.time));

    // Apply pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedLogs = allLogs.slice(startIndex, endIndex);

    // Return response with metadata
    res.json({
      logs: paginatedLogs,
      totalCount: allLogs.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(allLogs.length / parseInt(limit))
    });

  } catch (err) {
    console.error("Error fetching audit logs:", err);
    res.status(500).json({ 
      message: "Error fetching audit logs", 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// Get simplified logs (for backward compatibility)
router.get("/simple", async (req, res) => {
  try {
    const users = await User.find({}, { name: 1, role: 1, auditLogs: 1 });
    const allLogs = [];

    users.forEach(user => {
      if (user.auditLogs && user.auditLogs.length > 0) {
        user.auditLogs.forEach(log => {
          allLogs.push({
            action: log.action || 'Unknown Action',
            time: log.time,
            performedBy: { name: user.name, role: user.role }
          });
        });
      }
    });

    // Sort by latest first
    allLogs.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json(allLogs);
  } catch (err) {
    console.error("Error fetching audit logs:", err);
    res.status(500).json({ message: "Error fetching audit logs" });
  }
});

// Get audit logs for a specific user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId, { name: 1, role: 1, auditLogs: 1 });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const logs = user.auditLogs.map(log => ({
      ...log.toObject(),
      performedBy: { 
        _id: user._id,
        name: user.name, 
        role: user.role 
      }
    }));

    // Sort by latest first
    logs.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json(logs);
  } catch (err) {
    console.error("Error fetching user audit logs:", err);
    if (err.name === 'CastError') {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    res.status(500).json({ message: "Error fetching user audit logs" });
  }
});

// Add an audit log to a specific user
router.post("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body;
    
    if (!action) {
      return res.status(400).json({ message: "Action is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add audit log
    user.auditLogs.push({ 
      action, 
      performedBy: user.role,
      time: new Date()
    });
    
    await user.save();

    res.json({ 
      message: "Audit log added successfully", 
      log: {
        action,
        time: new Date(),
        performedBy: { name: user.name, role: user.role }
      }
    });
  } catch (err) {
    console.error("Error adding audit log:", err);
    if (err.name === 'CastError') {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    res.status(500).json({ message: "Error adding audit log" });
  }
});

// Bulk add audit log (for system-wide actions)
router.post("/bulk", async (req, res) => {
  try {
    const { action, userIds } = req.body;
    
    if (!action) {
      return res.status(400).json({ message: "Action is required" });
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "UserIds array is required" });
    }

    const results = [];
    
    for (const userId of userIds) {
      try {
        const user = await User.findById(userId);
        if (user) {
          user.auditLogs.push({ 
            action, 
            performedBy: user.role,
            time: new Date()
          });
          await user.save();
          results.push({ userId, success: true });
        } else {
          results.push({ userId, success: false, error: "User not found" });
        }
      } catch (err) {
        results.push({ userId, success: false, error: err.message });
      }
    }

    res.json({ 
      message: "Bulk audit log operation completed",
      results 
    });
  } catch (err) {
    console.error("Error in bulk audit log:", err);
    res.status(500).json({ message: "Error in bulk audit log operation" });
  }
});

// Get audit log statistics
router.get("/stats", async (req, res) => {
  try {
    const users = await User.find({}, { name: 1, role: 1, auditLogs: 1 });
    
    const stats = {
      totalLogs: 0,
      totalUsers: users.length,
      activeUsers: 0,
      actionBreakdown: {},
      roleBreakdown: {},
      recentActivity: []
    };

    const allLogs = [];

    users.forEach(user => {
      if (user.auditLogs && user.auditLogs.length > 0) {
        stats.activeUsers++;
        
        user.auditLogs.forEach(log => {
          stats.totalLogs++;
          
          // Action breakdown
          const action = log.action || 'Unknown';
          stats.actionBreakdown[action] = (stats.actionBreakdown[action] || 0) + 1;
          
          // Role breakdown
          const role = user.role || 'Unknown';
          stats.roleBreakdown[role] = (stats.roleBreakdown[role] || 0) + 1;
          
          allLogs.push({
            action: log.action,
            time: log.time,
            performedBy: { name: user.name, role: user.role }
          });
        });
      }
    });

    // Get recent activity (last 10 logs)
    allLogs.sort((a, b) => new Date(b.time) - new Date(a.time));
    stats.recentActivity = allLogs.slice(0, 10);

    res.json(stats);
  } catch (err) {
    console.error("Error fetching audit log stats:", err);
    res.status(500).json({ message: "Error fetching audit log statistics" });
  }
});

module.exports = router;