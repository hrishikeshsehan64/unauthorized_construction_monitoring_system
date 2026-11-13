const express = require("express");
const siteRoutes = require("./routes/siteRoutes");
const surveyRoutes = require("./routes/surveyRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Unauthorized Construction Monitoring System API is running",
  });
});

app.use(express.json());
app.use("/sites", siteRoutes);
app.use("/surveys", surveyRoutes);
app.use(errorMiddleware);   


module.exports = app;

// all routes are now completely set up