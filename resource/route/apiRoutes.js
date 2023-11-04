const express = require("express");
const apitrollers = require("../controller/apiControllers");
const authverify = require("../helper/authVerify.helper");
const route = express.Router();

route.post("/anime/top/reset", apitrollers.reset);
route.post(
  "/account/profile/update",
  authverify.authVerify,
  apitrollers.profile_update
);
route.post(
  "/anime/inventory/add",
  authverify.authVerify,
  apitrollers.inventoryAdd
);
route.post(
  "/anime/inventory/remove",
  authverify.authVerify,
  apitrollers.inventoryRemove
);
route.post("/anime/star", authverify.authVerify, apitrollers.star);
route.post("/anime/report", authverify.authVerify, apitrollers.report);
route.post("/account/password", apitrollers.password);
route.post("/account/login", apitrollers.login);
route.post("/account/sigin", apitrollers.sigin);
route.post("/anime/comment", apitrollers.comment);
route.post("/comment", authverify.authVerify, apitrollers.comment_post);
route.get("/anime", apitrollers.anime);

module.exports = route;
