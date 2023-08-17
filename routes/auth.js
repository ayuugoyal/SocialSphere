const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config();

router.post("/register", async (req, res) => {
  try {
    if (
      req.body.username &&
      req.body.name &&
      req.body.email &&
      req.body.password
    ) {
      let username, email;
      if (req.body.username) {
        username = await User.findOne({ username: req.body.username });
        username &&
          res.status(400).json({
            success: false,
            message: "username already exist",
          });
      }
      if (req.body.email) {
        email = await User.findOne({ email: req.body.email });
        email &&
          res.status(400).json({
            success: false,
            message: "email already exist",
          });
      }
      if (!username && !email) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const newUser = new User({
          username: req.body.username,
          name: req.body.name,
          email: req.body.email,
          password: hashedPassword,
        });

        const savedUser = await newUser.save();
        console.log(savedUser);
        res.status(200).json({
          status: true,
          userDetails: savedUser,
          message: "registration successful",
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: "Please Provide all feilds",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    if ((req.body.username || req.body.email) && req.body.password) {
      let user;
      if (req.body.username) {
        user = await User.findOne({ username: req.body.username });
      } else if (req.body.email) {
        user = await User.findOne({ email: req.body.email });
      }
      !user &&
        res
          .status(400)
          .json({ success: false, message: "username or email is incorrect" });
      if (user) {
        const validPassword = await bcrypt.compare(
          req.body.password,
          user.password
        );
        !validPassword &&
          res.status(400).json({ success: false, message: "Wrong Password" });

        if (validPassword) {
          const userData = {
            email: req.body.email,
            password: user.password,
          };

          const token = jwt.sign(userData, process.env.ACCESS_TOKEN_SECRET);

          const options = {
            expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            httpOnly: true,
          };

          res
            .status(200)
            .cookie("token", token, options)
            .json({
              success: true,
              token: token,
              options: options,
              userDetails: {
                username: user.username,
                name: user.name,
                email: user.email,
              },
              message: "User Logged In",
            });
        }
      }
    } else {
      res
        .status(422)
        .json({ success: false, message: "username or email is not provided" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
