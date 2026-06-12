const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Upload document
router.post("/", async (req, res) => {
  const { userId, title, type, fileData } = req.body;

  if (!userId || !title || !type || !fileData) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!Array.isArray(user.documents)) {
      user.documents = [];
    }

    const newDoc = {
      title,
      type,
      fileData,
      uploadedAt: new Date(),
    };

    user.documents.push(newDoc);
    await user.save();

    res.status(200).json({ message: "Document uploaded", document: newDoc });
  } catch (err) {
    console.error("Error saving document:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch documents for a user
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ documents: user.documents || [] });
  } catch (err) {
    console.error("Error fetching documents:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a specific document
router.put("/:userId/:docIndex", async (req, res) => {
  const { userId, docIndex } = req.params;
  const { title, type, fileData } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!Array.isArray(user.documents) || !user.documents[docIndex]) {
      return res.status(404).json({ error: "Document not found" });
    }

    const doc = user.documents[docIndex];
    if (title) doc.title = title;
    if (type) doc.type = type;
    if (fileData) doc.fileData = fileData;

    await user.save();
    res.status(200).json({ message: "Document updated", document: doc });
  } catch (err) {
    console.error("Error updating document:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
