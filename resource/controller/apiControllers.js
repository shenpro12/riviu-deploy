const animeList = require("../model/animeList");
const comments = require("../model/comment");
const reports = require("../model/report");
const subComments = require("../model/subComment");
const accounts = require("../model/account");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const fs = require("fs");
const { io } = require("socket.io-client");
const jwtHelper = require("../helper/jwt.helper");
const socket = io(process.env.socketServerOrigin);
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});
class apiControllers {
  //GET /api/anime
  async anime(req, res) {
    try {
      const data = await animeList.find({});
      setTimeout(() => {
        res.json({ data: data });
      }, 1000);
    } catch {
      res.json({ status: false });
    }
  }
  //POST /api/account/sigin
  async sigin(req, res) {
    try {
      if (
        req.body.data.userName &&
        req.body.data.password &&
        req.body.data.re_Password
      ) {
        const account = await accounts.findOne({
          userName: req.body.data.userName,
        });
        if (account) {
          res.json({ status: "Email đã được đăng ký tài khoản!" });
        } else if (
          !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/g.test(
            req.body.data.password
          ) ||
          !/^[A-Za-z0-9]{6,30}@gmail.com$/g.test(req.body.data.userName)
        ) {
          res.json({ status: "Mật khẩu hoặc Email không hợp lệ!" });
        } else if (req.body.data.password != req.body.data.re_Password) {
          res.json({ status: "Mật khẩu không trùng khớp!" });
        } else {
          const salt = bcrypt.genSaltSync(10);
          const hash = bcrypt.hashSync(req.body.data.password, salt);
          const user = new accounts({
            userName: req.body.data.userName,
            password: hash,
            thirdPartyLogin: ["normal"],
            info: {
              name: "",
              avatar: "",
              isFemale: false,
            },
          });
          await user.save();
          res.json({ status: "Đăng ký thành công!" });
        }
      } else {
        res.json({ status: "Vui lòng nhập đầy đủ thông tin!" });
      }
    } catch {
      res.json({ status: false });
    }
  }
  //POST /api/account/login
  async login(req, res) {
    try {
      if (!req.body.data.passord && !req.body.data.userName) {
        res.json({ mess: "Hãy nhập đầy đủ thông tin!" });
        return;
      }
      const account = await accounts.findOne({
        userName: req.body.data.userName,
      });

      if (
        account &&
        bcrypt.compareSync(req.body.data.password, account.password)
      ) {
        let token = await jwtHelper.generateTokenLogin(
          account,
          process.env.TOKEN_SECRET,
          process.env.ACCESS_TOKELIFE
        );
        let refeshToken = await jwtHelper.generateTokenLogin(
          account,
          process.env.TOKEN_SECRET,
          process.env.REFESH_TOKENLIFE
        );
        res.cookie(
          "_token",
          { token, refeshToken },
          {
            expires: new Date(Date.now() + 2592000000),
            httpOnly: true,
            secure: true,
          }
        );
        res.json({
          status: true,
          userProfile: {
            userName: account.userName,
            _id: account._id,
            info: account.info,
            filmInventory: account.filmInventory,
          },
        });
      } else {
        res.json({ mess: "Thông tin tài khoản sai! Hãy nhập lại thông tin!" });
      }
    } catch {
      res.json({ status: false });
    }
  }
  //POST /api/account/password
  async password(req, res) {
    try {
      setTimeout(async () => {
        const account = await accounts.findOne({
          userName: req.body.data.userName,
        });
        if (!account) {
          res.json({ message: "Tài khoản không tồn tại!" });
          return;
        }
        let newPassword =
          (Math.floor(Math.random() * (1000000 - 99999)) + 99999).toString() +
          "@qaz";
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(newPassword, salt);
        await accounts.updateOne(
          { userName: req.body.data.userName },
          { password: hash }
        );
        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.Email,
            pass: process.env.pass,
          },
        });

        let mailOptions = {
          from: process.env.Email,
          to: req.body.data.userName,
          subject: "Mật khẩu đăng nhập AnimeLove mới",
          html:
            "Mật khẩu của bạn là: " +
            newPassword +
            " .Vui lòng thay đổi mật khẩu khi đăng nhập để bảo vệ tài khoản!",
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
        res.json({
          message: "Mật khẩu mới đã được gửi đến Email đăng ký tài khoản!",
        });
      }, 1000);
    } catch {
      res.json({ status: false });
    }
  }
  //POST /api/account/profile/update
  async profile_update(req, res) {
    try {
      setTimeout(async () => {
        let status = "Cập nhật thông tin thành công!";
        const account = await accounts.findOne({
          userName: req.userName,
        });
        let password = account.password;
        let avatar = account.info.avatar;
        if (req.file) {
          avatar = await cloudinary.uploader.upload(req.file.path);
          fs.unlinkSync(req.file.path);
          if (account.info.avatar.includes("https://res.cloudinary.com")) {
            cloudinary.uploader.destroy(
              account.info.avatar.split("/")[7].split(".")[0],
              function (error, result) {
                console.log(result, error);
              }
            );
          }
        }
        if (
          req.body.password &&
          /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/g.test(
            req.body.password
          )
        ) {
          const salt = bcrypt.genSaltSync(10);
          const hash = bcrypt.hashSync(req.body.password, salt);
          password = hash;
        } else if (req.body.password) {
          status +=
            " Không thể cập nhật mật khẩu, mật khẩu phải có độ dài 8 ký tự, bao gồm 1 số, 1 chữ và 1 ký tự đặc biệt!";
        }
        //console.log(avatar.secure_url);
        await accounts.updateOne(
          { userName: req.userName },
          {
            "info.name": req.body.name,
            "info.isFemale": req.body.gender,
            "info.avatar": avatar.secure_url ? avatar.secure_url : avatar,
            password: password,
          }
        );

        res.status(200).json({
          status: status,
          success: true,
          message: "success",
          user: {
            userName: account.userName,
            _id: account._id,
            info: {
              ...account.info,
              name: req.body.name,
              isFemale: req.body.gender,
              avatar: avatar.secure_url ? avatar.secure_url : avatar,
            },
          },
        });
      }, 1000);
    } catch {
      res.json({ status: false });
    }
  }
  //POST /api/anime/comment
  async comment(req, res) {
    try {
      setTimeout(async () => {
        if (req.body.data.animeId) {
          //get comment by anime ID
          let comment = await comments.findOne({
            animeId: req.body.data.animeId,
          });
          if (comment) {
            comment = Promise.all(
              comment.content.map(async (item) => {
                let subComment = []; //init subComment
                //find all subComment belong this comment
                const subCommentData = await subComments.find({
                  commentId: item._id,
                });

                if (subCommentData.length) {
                  //when this comment have subcomment, loop subCommentData and find user info of this subcomment
                  for (let i = 0; i < subCommentData.length; i++) {
                    //find user info
                    let temp = await accounts.findOne({
                      _id: subCommentData[i].userId,
                    });
                    //make subcomment obj then push into subComment arr
                    subComment.push({
                      comment: subCommentData[i].comment,
                      userId: subCommentData[i].userId,
                      _id: subCommentData[i]._id,
                      info: {
                        name: temp.info.name ? temp.info.name : temp.userName,
                        avatar: temp.info.avatar,
                      },
                      createdAt: subCommentData[i].createdAt,
                    });
                  }
                }
                //find user info of this comment
                let userCommentInfo = await accounts.findOne({
                  _id: item.userId,
                });
                //console.log(subComment);
                //make this comment have user info and add subcomment to this comment and return

                let temp = {
                  comment: item.comment,
                  userId: item.userId,
                  _id: item._id,
                  subComment: subComment,
                  info: {
                    name: userCommentInfo.info.name
                      ? userCommentInfo.info.name
                      : userCommentInfo.userName,
                    avatar: userCommentInfo.info.avatar,
                  },
                  createdAt: item.createdAt,
                  image: item.image,
                };
                return temp;
              })
            );
          }
          //console.log(comment);
          res.json({ status: true, comment: await comment });
        } else {
          res.json({ status: false });
        }
      }, 2000);
    } catch {
      res.json({ status: false });
    }
  }
  //POST /api/comment
  async comment_post(req, res) {
    setTimeout(async () => {
      let image = "";
      if (req.file) {
        image = await cloudinary.uploader.upload(req.file.path);
        fs.unlinkSync(req.file.path);
      }
      if (
        req.body.comment &&
        req.body.commentId &&
        req.body.profile &&
        req.body.animeId
      ) {
        const anime = await animeList.findOne({
          "season._id": req.body.animeId,
        });
        const comment = await comments.findOne({
          "content._id": req.body.commentId,
        });
        if (anime && comment) {
          socket.emit("userSendSubCommnet", {
            comment: req.body.comment,
            profile: JSON.parse(req.body.profile),
            animeId: req.body.animeId,
            commentId: req.body.commentId,
          });
          res.json({ status: true });
          return;
        } else {
          res.json({ status: false, message: "Gửi thất bại!" });
        }
      } else if (
        (req.body.comment || image) &&
        req.body.animeId &&
        req.body.profile
      ) {
        const anime = await animeList.findOne({
          "season._id": req.body.animeId,
        });
        if (anime) {
          socket.emit("userSendCommnet", {
            comment: req.body.comment,
            profile: JSON.parse(req.body.profile),
            animeId: req.body.animeId,
            image: image.secure_url ? image.secure_url : "",
          });
          res.json({ status: true });
        } else {
          res.json({ status: false, message: "Gửi thất bại!" });
        }
      } else {
        res.json({ status: false, message: "Gửi thất bại!" });
      }
    }, 1000);
  }
  //POST /api/anime/top/reset
  async reset(req, res) {
    try {
      const data = await animeList.findOne({ "season._id": req.body.data._id });
      let temp = data.season.filter((item) => item._id == req.body.data._id);
      let views;
      if (temp.length) {
        views = temp[0].views;
      }
      const date = new Date();
      views.day.total += 1;
      views.week.total += 1;
      views.month.total += 1;
      views.total_view += 1;
      let day = new Date(views.day.dateOfRecord);
      let month = new Date(views.month.dateOfRecord);
      if (
        `${day.getDate()}${day.getMonth() + 1}${day.getFullYear()}` !=
        `${date.getDate()}${date.getMonth() + 1}${date.getFullYear()}`
      ) {
        views.day.total = 0;
        views.day.dateOfRecord = Date.now();
      }
      if (date.getTime() - views.week.dateOfRecord > 604800000) {
        views.week.total = 0;
        views.week.dateOfRecord = Date.now();
      }
      if (
        `${month.getMonth() + 1}${month.getFullYear()}` !=
        `${date.getMonth() + 1}${date.getFullYear()}`
      ) {
        views.month.total = 0;
        views.month.dateOfRecord = Date.now();
      }
      temp[0].views = views;
      data.season = data.season.map((item) => {
        if (item._id == req.body.data._id) {
          item = temp[0];
        }
        return item;
      });
      await animeList.updateOne(
        {
          "season._id": req.body.data._id,
        },
        { season: data.season }
      );
    } catch {
      res.json({ status: false });
    }
  }
  //POST /api/anime/inventory/add
  async inventoryAdd(req, res) {
    try {
      let temp = {
        animeId: req.body.data.animeId,
      };
      await accounts.updateOne(
        { userName: req.userName },
        {
          $push: {
            filmInventory: temp,
          },
        }
      );
      res.json({ status: true });
    } catch {
      res.json({ status: false });
    }
  }
  //POST /api/anime/inventory/remove
  async inventoryRemove(req, res) {
    try {
      const account = await accounts.findOne({ userName: req.userName });
      let userInventory = account.filmInventory.filter(
        (item) => req.body.data.animeId != item.animeId
      );
      await accounts.updateOne(
        { userName: req.userName },
        { filmInventory: [...userInventory] }
      );
      res.json({ status: true });
    } catch {
      res.json({ status: false });
    }
  }
  //POST /api/anime/star
  async star(req, res) {
    try {
      const anime = await animeList.findOne({
        "season._id": req.body.data.animeId,
      });
      //console.log(anime);
      if (anime) {
        await animeList.updateOne(
          { "season._id": req.body.data.animeId },
          {
            $set: {
              "season.$.star": req.body.data.rate,
            },
          }
        );
        const newAnimeList = await animeList.find({});
        res.json({ status: true, data: newAnimeList });
        return;
      }
      res.json({ status: false });
    } catch {
      res.json({ status: false });
    }
  }
  //POST /api/anime/report
  async report(req, res) {
    setTimeout(async () => {
      try {
        const report = await reports.findOne({
          userId: req.body.data.userId,
          episode: req.body.data.episode,
          animeId: req.body.data.animeId,
        });
        if (report) {
          await reports.updateOne(
            {
              userId: req.body.data.userId,
              episode: req.body.data.episode,
              animeId: req.body.data.animeId,
            },
            { report: req.body.data.report }
          );
        } else {
          const newReport = new reports({
            userId: req.body.data.userId,
            episode: req.body.data.episode,
            animeId: req.body.data.animeId,
            report: req.body.data.report,
          });
          await newReport.save();
        }
        res.json({ status: true });
      } catch {
        res.json({ status: false });
      }
    }, 1000);
  }
}
module.exports = new apiControllers();
