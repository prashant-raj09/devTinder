const express = require("express");
const authRouter = express.Router();

const { validateSignUpData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const validator = require("validator");
const User = require("../models/user");

// This is for SignUp API
authRouter.post("/signup", async (req, res) => {
  // console.log(req.body);  ---> it will read the data from postman(from html/web-page) and we can use it for storing it into DB

  try {
    // This function is for validation purposes only
    validateSignUpData(req);

    // Hashing the password using bcrypt
    const { firstName, lastName, emailId, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    // Creating a new instance of User object
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    await user.save();
    res.send("User Added Successfully");
  } catch (err) {
    res.status(400).send("Error saving the user:" + err.message);
  }
});

// This is for Login API
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!validator.isEmail(emailId)) {
      throw new Error("Invalid Email Address");
    }
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid Email Address...");
    }

    // Validating the password using bcrypt through the function which is defined in the userSchema in user.js
    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      throw new Error("Invalid Password, Please enter valid Password");
    } else {
      // Creating JWT (JSON Web Token) using the function which is defined in userSchema in user.js
      const token = await user.getJWT();

      // Setting the JWT in a cookie and it will expire after 8hrs from now on.
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 + 3600000),
      });

      res.send("Login Successful");
    }
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

// This is for Logout API
authRouter.post("/logout", async (req, res) => {
  res
    .cookie("token", null, {
      expires: new Date(Date.now()),
    })
    .send("Logout Successfully");
});

module.exports = authRouter;
