const express = require("express");
const router = express.Router();
const blogModel = require("../models/blogModel");
const multer = require("multer");
const path = require("path");
const comment = require("../models/commentModel");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploadBgImage/`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()} - ${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

router.get("/addblog", (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

router.get("/:id", async (req, res) => {
  const blog = await blogModel.findById(req.params.id).populate("createdBy");
  const comments = await comment
    .find({ blogId: req.params.id })
    .populate("createdBy");
  console.log("comments-> ", comments);
  return res.render("blog", { 
    user: req.user,
    blog: blog,
    comments,
  });
});

router.post("/comment/:blogId", async (req, res) => {
  await comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});

router.post("/", upload.single("coverImage"), async (req, res) => {
  const { title, body } = req.body;
  const blog = await blogModel.create({
    title,
    body,
    createdBy: req.user._id,
    coverImageURL: `/uploadBgImage/${req.file.filename}`,
  });
  return res.redirect(`/blog/${blog.id}`);
});

module.exports = router;
