import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();

// CORS - Handle BEFORE everything else
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Parse JSON bodies
app.use(express.json());

// Routes
app.use("/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    console.log("Server still starting on port " + PORT + " without MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (MongoDB offline)`);
    });
  });