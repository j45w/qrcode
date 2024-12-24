const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Create a new user and generate QR code data
router.post("/create", async (req, res) => {
  const { name } = req.body;

  if (!name) return res.status(400).json({ error: "Name is required" });

  try {
    // Find the highest uniqueId and increment it
    const lastUser = await User.findOne().sort({ uniqueId: -1 });
    const uniqueId = lastUser ? lastUser.uniqueId + 1 : 1;

    const qrCodeData = JSON.stringify({ name, uniqueId });

    // Create new user
    const user = new User({ name, uniqueId, qrCodeData });
    await user.save();

    res.status(201).json({ uniqueId, qrCodeData });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Retrieve QR code data by unique ID
router.post("/retrieve", async (req, res) => {
  const { uniqueId } = req.body;

  if (!uniqueId) return res.status(400).json({ error: "Unique ID is required" });

  try {
    const user = await User.findOne({ uniqueId });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ qrCodeData: user.qrCodeData });
  } catch (err) {
    console.error("Error retrieving user:", err);
    res.status(500).json({ error: "Failed to retrieve user" });
  }
});

// Validate and delete user
router.post("/validate-and-delete", async (req, res) => {
  const { uniqueId } = req.body;

  if (!uniqueId) return res.status(400).json({ error: "Unique ID is required" });

  try {
    // Find and delete the user by unique ID
    const user = await User.findOneAndDelete({ uniqueId });

    if (!user) return res.status(404).json({ error: "User not found or already scanned" });

    res.status(200).json({ message: `Welcome ${user.name}, you are allowed to enter.` });
  } catch (err) {
    console.error("Error validating user:", err);
    res.status(500).json({ error: "Failed to validate user" });
  }
});

module.exports = router;
