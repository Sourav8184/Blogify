require("dotenv").config();

const express = require("express");
const app = express();
const PORT = process.env.PORT;

/* ----------------------------------------------- */

const userRouter = require("./routes/userRoutes");

const blogRouter = require("./routes/blogRoutes");

const blogModel = require("./models/blogModel");

const connectDB = require("./connection");

const path = require("path");

/* ----------------------------------------------- */

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

/* ----------------------------------------------- */

const { checkForAuthenticationCookie } = require("./middleware/authentication");

/* ----------------------------------------------- */

connectDB(process.env.MONGODB_URL)
  .then(() => {
    console.log("MongoDb Connected SuccessFully");
  })
  .catch((err) => {
    console.log("MongoDB Not Connected! ", err);
  });

/* ----------------------------------------------- */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

app.use(checkForAuthenticationCookie("token"));

app.use(express.static(path.resolve("./public")));

/* ----------------------------------------------- */

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

/* ----------------------------------------------- */

app.use("/user", userRouter);

app.use("/blog", blogRouter);

app.get("/", async (req, res) => {
  const allBlogs = await blogModel.find({});
  res.render("homepage", {
    user: req.user,
    blogs: allBlogs,
  });
});

/* ----------------------------------------------- */

app.listen(PORT, () => {
  console.log(`Server started at PORT: ${PORT}`);
});

/* ----------------------------------------------- */
