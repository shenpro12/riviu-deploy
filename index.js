const express = require("express");
require("dotenv").config();
const path = require("path");

const app = express();
const port = 3001;

app.use(express.json());
app.use(express.urlencoded());

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "build")));

app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening on port ${port}`);
});
