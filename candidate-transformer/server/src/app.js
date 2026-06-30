require("dotenv").config();
const express = require("express");
const cors = require("cors");
const profileRoutes = require("./routes/profileRoutes");
const authRoutes = require("./routes/authRoutes");
const { requireAuth } = require("./middleware/authMiddleware");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.get("/health", (req, res) => res.json({ ok: true, service: "candidate-transformer" }));
app.use("/api/auth", authRoutes);
app.use("/api", requireAuth, profileRoutes);
app.use(errorHandler);

module.exports = app;
