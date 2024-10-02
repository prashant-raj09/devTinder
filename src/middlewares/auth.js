const User = require("../models/user");
const jwt = require("jsonwebtoken");

// Middleware for checking if the user is authenticated or not.
const userAuth = async (req, res, next) => {
  try {
    // Read the token from the cookies
    const { token } = req.cookies;
    // check if the token is valid and not expired
    if (!token) {
      return res.status(401).send("Please Login");
    }

    const decodedMessage = await jwt.verify(token, process.env.JWTSECRETKEY);

    const { _id } = decodedMessage;

    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found");
    } else {
        req.user = user; // attach the user to the request object for further use.
      next(); // send the request to the server and return the response object from the server.
    }
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
};

module.exports = {
  userAuth,
};
