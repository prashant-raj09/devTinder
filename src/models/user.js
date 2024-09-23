const mongoose = require("mongoose");
const validator = require("validator");
// We use "require" for so that, That field must be filled and we use "unique" so there is no dublicate

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      // This will validate the email address 
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email Address " + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Password is not strong " + value);
        }
      },
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "other"].includes(value.toLowerCase())) {
          throw new Error("Gender is not valid");
        }
      },
    },
    photoUrl: {
      type: String,
      default:
        "https://www.inklar.com/wp-content/uploads/2020/05/dummy_user-370x300-1.png",
    },
    about: {
      type: String,
      default: "This is default about of the user",
    },
    skills: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
