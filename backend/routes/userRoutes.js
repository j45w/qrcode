const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Helper function to generate unique IDs
function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}

// Create a new user and generate QR code data
router.post("/create", async (req, res) => {
  const { name } = req.body;

  if (!name) return res.status(400).json({ error: "Name is required" });

  const uniqueId = generateUniqueId();
  const qrCodeData = JSON.stringify({ name, uniqueId });

  const user = new User({ name, uniqueId, qrCodeData });

  try {
    await user.save();
    res.status(201).json({ uniqueId, qrCodeData });
  } catch (err) {
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

    res.status(200).json({ message: `Welcome ${user.name} you are allow to enter` });
  } catch (err) {
    res.status(500).json({ error: "Failed to validate user" });
  }
});

module.exports = router;
