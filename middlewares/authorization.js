const User = require("../models/user");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const isAuthrorized = async (req, res, next) => {
  const token = req.cookies.token;
  console.log(token);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Please login first!",
    });
  }

  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  req.user = decoded;

  const user = await User.findOne({ email: decoded.email });

  console.log(user);
  console.log(req.user.password);
  console.log(decoded.email);
  console.log(user.password);

  if (user.password == decoded.password) {
    req.user = user;
    next();
  } else {
    res.status(401).json({ success: false, message: "Incorrect Password" });
  }
};

module.exports = isAuthrorized;
