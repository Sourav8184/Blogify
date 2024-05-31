const express = require("express");
const router = express.Router();
const userModel = require("../models/userModels");

/* ----------------------------------------------- */

router.get("/signup", (req, res) => {
  return res.render("signup");
});

/* ----------------------------------------------- */

router.get("/signin", (req, res) => {
  return res.render("signin");
});

/* ----------------------------------------------- */

router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    // Validate input
    if (!fullName || !email || !password) {
      return res.render("signup", {
        error: "All details are requried",
      });
    }
    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.render("signup", {
        error: "User Already Exist",
      });
    }
    // Create new user
    await userModel.create({
      fullName,
      email,
      password,
    });
    // Redirect to home page after successful signup
    return res.redirect("/");
  } catch (error) {
    console.error("Error occurred during signup:", error);
    return res.render("signup", {
      error: "Internal Server Error",
    });
  }
});

/* ----------------------------------------------- */

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    // Attempt to match the email and password
    const token = await userModel.matchPasswordAndGenerateToken(
      email,
      password
    );
    // If matching is successful, log the user and redirect to the home page
    return res.cookie("token", token).redirect("/");
  } catch (error) {
    // If an error occurs (e.g., incorrect password or user not found), handle it
    console.error("Sign in error:", error.message);
    return res.render("signin", {
      error: "Incorrect Email or Password",
    });
  }
});

/* ----------------------------------------------- */
router.get("/logout", (req, res) => {
  res.clearCookie("token").redirect("/");
});
/* ----------------------------------------------- */

module.exports = router;
