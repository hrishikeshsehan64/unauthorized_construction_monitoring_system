const express = require("express");

const siteRoutes = require("./src/routes/siteRoutes");
const surveyRoutes = require("./src/routes/surveyRoutes");
const errorMiddleware = require("./src/middleware/errorMiddleware")
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Unauthorized Construction Monitoring System API is running",
  });
});


app.use("/sites", siteRoutes);
app.use("/surveys", surveyRoutes);
app.use(errorMiddleware);   


module.exports = app;

// all routes are now completely set up