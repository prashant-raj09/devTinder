const User = require("../models/user");
const jwt = require("jsonwebtoken");

// Middleware for checking if the user is authenticated or not.
const userAuth = async (req, res, next) => {
  try {
    // Read the token from the cookies
    const cookies = req.cookies;
    const { token } = cookies;
    // check if the token is valid and not expired
    if (!token) {
      throw new Error("Invalid token");
    }

    const decodedMessage = await jwt.decode(token, "DEVTinder@09$");

    const { _id } = decodedMessage;

    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found");
    } else {
        req.user = user; // attach the user to the request object for further use.
      next(); // send the request to the server and return the response object from the server.
    }
  } catch (err) {
    throw new Error("Error: " + err.message);
  }
};

module.exports = {
  userAuth,
};
