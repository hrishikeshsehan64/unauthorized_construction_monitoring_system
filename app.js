const express = require("express");

const siteRoutes = require("./src/routes/siteRoutes");
const surveyRoutes = require("./src/routes/surveyRoutes");
const errorMiddleware = require("./src/middleware/errorMiddleware");
const reportRoutes = require("./src/routes/reportRoutes");
const investigationRoutes = require("./src/routes/investigationRoutes");
const authRoutes = require("./src/routes/authRoutes");
const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Unauthorized Construction Monitoring System API is running",
  });
});

app.use("/auth", authRoutes);
app.use("/sites", siteRoutes);
app.use("/surveys", surveyRoutes);
app.use("/reports", reportRoutes);
app.use("/investigations", investigationRoutes);

// Also alias under /api for frontend proxy compatibility
app.use("/api/auth", authRoutes);
app.use("/api/sites", siteRoutes);
app.use("/api/surveys", surveyRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/investigations", investigationRoutes);

app.use(errorMiddleware);

module.exports = app;