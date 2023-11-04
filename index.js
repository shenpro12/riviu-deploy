const express = require("express");
const morgan = require("morgan");
require("dotenv").config();
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const passport = require("passport");

const route = require("./resource/route");
const db = require("./config/db");
require("./resource/util/passport");

const app = express();
const port = 3001;
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
app.use(
  cookieSession({
    name: "session",
    keys: ["teemoly"],
    maxAge: 24 * 60 * 60 * 100,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(
  cors({
    credentials: true,
    origin: "https://animelove-beta.vercel.app/",
    methods: "GET,POST,PUT,DELETE",
  })
);
app.use(morgan("combined"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "build")));
db.connect();
route(app);
app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening on port ${port}`);
});
