const apiRoutes = require("./apiRoutes");
const authRoutes = require("./authRoutes");
function route(app) {
  app.use("/api", apiRoutes);
  app.use("/auth", authRoutes);
}
module.exports = route;
