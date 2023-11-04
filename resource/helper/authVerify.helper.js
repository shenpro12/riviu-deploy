const jwtHelper = require("./jwt.helper");
const authVerify = async (req, res, next) => {
  if (req.user) {
    req.userName = req.user.emails[0].value;
    next();
  } else if (req.cookies._token) {
    try {
      const token = await jwtHelper.verifyToken(
        req.cookies._token.token,
        process.env.TOKEN_SECRET
      );
      console.log("token is still alive");
      req.userName = token.data.userName;
      next();
    } catch {
      try {
        const token = await jwtHelper.verifyToken(
          req.cookies._token.refeshToken,
          process.env.TOKEN_SECRET
        );

        const newToken = await jwtHelper.generateTokenLogin(
          token.data,
          process.env.TOKEN_SECRET,
          process.env.ACCESS_TOKELIFE
        );
        res.cookie(
          "_token",
          { token: newToken, refeshToken: req.cookies._token.refeshToken },
          {
            expires: new Date(Date.now() + 2592000000),
            httpOnly: true,
            secure: true,
          }
        );
        req.userName = token.data.userName;
        next();
      } catch {
        console.log("rf token is die");
        res.clearCookie("_token");
        res.json({ success: false, message: "failure" });
      }
    }
  } else {
    res.json({ success: false, message: "failure" });
  }
};
module.exports = {
  authVerify,
};
