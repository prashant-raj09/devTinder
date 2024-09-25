const express = require("express");
const { userAuth } = require("../middlewares/auth");
const userRouter = express.Router();
const ConnectionRequest = require("../models/connectionRequest");

const USER_SAFE_DATA = "firstName lastName age gender about skills";

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    // Code for getting all received requests from the current user
    const loggedInUser = req.user;

    // This is fetching data from the server
    const connectionRequest = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA); // Both are the same thing
    // .populate("fromUserId", ["firstName", "lastName"]); // This is fetching the first and last names from the current user table.

    res.json({
      message: "Received requests",
      data: connectionRequest,
    });
  } catch (err) {
    res.status(500).send("Server Error: " + err.message);
  }
});

userRouter.get("/user/connection", userAuth, async (req, res) => {
  try {
    // Code for getting all connection requests from the current user
    const loggedInUser = req.user;
    // This is fetching data from the server
    const connectionRequest = await ConnectionRequest.find({
      $or: [
        {
          toUserId: loggedInUser._id,
          status: "accepted",
        },
        {
          fromUserId: loggedInUser._id,
          status: "accepted",
        },
      ],
    }).populate("fromUserId", USER_SAFE_DATA);

    const data = connectionRequest
      .map((response) => response.fromUserId)

      // This is fetching the first and last names from the current user table.
      res.json({
        data,
      });
  } catch (err) {
    res.status(400).send("Server Error: " + err.message);
  }
});
module.exports = userRouter;
