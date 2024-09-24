const express = require("express");
const { userAuth } = require("../middlewares/auth");
const profileRouter = express.Router();

// This is for Profile
// Here i am passing userAuth for authentication purposes and it is handled by the middleware which will handle the authentication process.
profileRouter.get("/profile", userAuth, async (req, res) => {
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

module.exports = profileRouter;
