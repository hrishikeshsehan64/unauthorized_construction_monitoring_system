const app = require("./app");

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Unauthorized Construction Monitoring System API running on port ${PORT}`);
});
