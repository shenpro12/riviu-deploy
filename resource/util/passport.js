const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const bcrypt = require("bcrypt");
const accounts = require("../model/account");
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://animelove-beta.vercel.app/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
      //console.log(profile);
      const account = await accounts.findOne({
        userName: profile.emails[0].value,
      });
      if (!account) {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync("levandat", salt);
        const user = new accounts({
          userName: profile.emails[0].value,
          password: hash,
          thirdPartyLogin: ["google"],
          info: {
            name: profile.displayName,
            avatar: profile._json.picture,
            isFemale: false,
          },
        });
        await user.save();
      } else {
        if (!account.thirdPartyLogin.includes("google")) {
          await accounts.updateOne(
            { userName: profile.emails[0].value },
            {
              thirdPartyLogin: [...account.thirdPartyLogin, "google"],
              "info.avatar": account.info.avatar
                ? account.info.avatar
                : profile._json.picture,
              "info.name": account.info.name
                ? account.info.name
                : profile.displayName,
            }
          );
        }
      }
      done(null, profile);
      //console.log("rf:", refreshToken);
    }
  )
);
passport.serializeUser((user, done) => {
  process.nextTick(function () {
    return done(null, user);
  });
});
passport.deserializeUser((user, done) => {
  process.nextTick(function () {
    return done(null, user);
  });
});
