const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const path = require("path");

const userRoutes = require("./backend/routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, "/frontend")));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// API Routes
app.use("/api/users", userRoutes);

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/frontend/main.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
