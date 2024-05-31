const mongoose = require("mongoose");

const { createHmac, randomBytes } = require("crypto");
const { createTokenForUser } = require("../services/authentication");

/* ----------------------------------------------- */

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      reqired: true,
    },
    email: {
      type: String,
      reqired: true,
      unique: true,
    },
    salt: {
      type: String,
      reqired: true,
    },
    password: {
      type: String,
      reqired: true,
    },
    profileImage: {
      type: String,
      default: "/images/avatar.png",
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
  },
  { timestamps: true }
);

/* ----------------------------------------------- */

userSchema.pre("save", async function (next) {
  // Get the user instance
  const user = this;

  // Check if the password field is modified
  if (!user.isModified("password")) {
    return next();
  }

  try {
    // Generate a random salt
    const salt = randomBytes(16).toString("hex");

    // Hash the password with the generated salt
    const hashedPassword = await hashPassword(user.password, salt);

    // Update user's salt and hashed password
    user.salt = salt;
    user.password = hashedPassword;

    next();
  } catch (error) {
    next(error);
  }
});

// Helper function to hash password with salt
async function hashPassword(password, salt) {
  return new Promise((resolve, reject) => {
    createHmac("sha256", salt)
      .update(password)
      .digest("hex", (err, hashedPassword) => {
        if (err) {
          reject(err);
        } else {
          resolve(hashedPassword);
        }
      });
  });
}

/* ----------------------------------------------- */

userSchema.static(
  "matchPasswordAndGenerateToken",
  async function (email, password) {
    // Find user by email
    const user = await this.findOne({ email });

    // If user doesn't exist, throw an error
    if (!user) {
      throw new Error("User Not Found!");
    }

    // Hash the provided password with the user's salt
    const hashedPassword = hashPassword(password, user.salt);

    // Compare the hashed passwords
    if (user.password !== hashedPassword) {
      throw new Error("Incorrect Password!");
    }

    // if match Passwor then create Toke for user
    const token = createTokenForUser(user);

    // return token
    return token;
  }
);

// Helper function to hash password with salt
function hashPassword(password, salt) {
  return createHmac("sha256", salt).update(password).digest("hex");
}

/* ----------------------------------------------- */

const User = mongoose.model("User", userSchema);
module.exports = User;
