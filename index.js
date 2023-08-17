const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");

dotenv.config();

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

const PORT = process.env.PORT || 8080;

mongoose
  .connect(process.env.MONGO_URL, { useNewUrlParser: true })
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res
    .json({
      success: true,
      message: "Welcome to the SocialSphere - social media app server.",
    })
    .status(200);
});

app.use("/api/auth", authRoute);
app.use("/api", userRoute);
app.use("/api/posts", postRoute);

app.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}`);
});
