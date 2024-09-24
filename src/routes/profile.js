const express = require("express");
const { userAuth } = require("../middlewares/auth");
const profileRouter = express.Router();

const bcrypt = require("bcrypt");
const {
  validateEditProfileData,
  validateEditPassword,
} = require("../utils/validation");

// This is for Profile
// Here i am passing userAuth for authentication purposes and it is handled by the middleware which will handle the authentication process.
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    // Getting the user information from the server because i am sending it from middleware .
    const user = req.user;
    if (!user) {
      throw new Error("user not found");
    } else {
      res.send(user);
    }
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    validateEditProfileData(req);

    const loggedInUser = req.user;

    /* 
    This is used to update the loggedInUser object with the values from req.body, effectively copying over all the data submitted in a request to the logged-in user object.
    */
    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    await loggedInUser.save();
    res.json({
      message: `${loggedInUser.firstName}, your profile updated successfully`,
      data: loggedInUser,
    });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    validateEditPassword(req);
    const loggedInUser = req.user;

    const { password } = req.body;
    if (!(await bcrypt.compare(password, loggedInUser.password))) {
      throw new Error("Current Password is incorrect");
    }

    // Here we are hashing the new password and confirming it with the confirmPassword.
    const { newPassword, confirmPassword } = req.body;
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    const confirmPasswordHash = await bcrypt.compare(
      confirmPassword,
      newPasswordHash
    );

    // Confirming if newPassword and confirmPassword are the same.

    if (!confirmPasswordHash) {
      throw new Error("Password Not Matched");
    }

    // If all checks pass, then we update the password.

    // This will update the loggedInUser password with the new hashed password.
    loggedInUser.password = newPasswordHash;
    await loggedInUser.save();

    // Logging out the user after password change.
    res.cookie("token", null, { expires: new Date(Date.now()) });
    res.json({
      message: `${loggedInUser.firstName}, your password updated successfully and you have been logged out`,
    });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

module.exports = profileRouter;
