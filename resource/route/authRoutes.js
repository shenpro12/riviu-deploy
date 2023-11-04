const express = require("express");
const passport = require("passport");
const accounts = require("../model/account");
const authverify = require("../helper/authVerify.helper");
const route = express.Router();
route.post("/logout", (req, res) => {
  setTimeout(() => {
    if (req.user) {
      req.logout();
    } else {
      res.clearCookie("_token");
    }
    res.json({ status: true });
  }, 2000);
});
route.get("/login/success", authverify.authVerify, async (req, res) => {
  setTimeout(async () => {
    const account = await accounts.findOne({
      userName: req.userName,
    });
    res.status(200).json({
      success: true,
      message: "success",
      user: {
        userName: account.userName,
        _id: account._id,
        info: account.info,
        filmInventory: account.filmInventory,
      },
    });
  }, 1000);
});
route.get("/login/failed", (req, res) => {
  res.status(401).json({ success: false, message: "failure" });
});
route.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
route.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "https://animelove-beta.vercel.app/",
    failureRedirect: "/login/failed",
  })
);

module.exports = route;
