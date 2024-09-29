const express = require("express");
const { userAuth } = require("../middlewares/auth");
const userRouter = express.Router();
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

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
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = connectionRequest.map((response) => {
      if (response.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return response.toUserId;
      }
      return response.fromUserId;
    });

    // This is fetching the first and last names from the current user table.
    res.json({
      data,
    });
  } catch (err) {
    res.status(400).send("Server Error: " + err.message);
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    // For pagination purposes

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    limit = limit > 50 ? 50 : limit;

    const skip = (page - 1) * limit;

    // Fetch all connections between the logged in user and others.
    const connectionRequest = await ConnectionRequest.find({
      $or: [
        {
          toUserId: loggedInUser,
          status:"accepted",
        },
        {
          fromUserId: loggedInUser,
          status: "accepted",
        },
      ],
    }).select("fromUserId toUserId");

    {
      connectionRequest.map((req) => {
        console.log(req._id);
      });
    }

    // Creating a set of unique connections
    const hideUserFromFeed = new Set();

    connectionRequest.forEach((request) => {
      hideUserFromFeed.add(request.fromUserId._id.toString());
      hideUserFromFeed.add(request.toUserId._id.toString());
    });

    const users = await User.find({
      $and: [
        {
          _id: {
            $nin: Array.from(hideUserFromFeed),
          },
        },
        {
          _id: {
            $ne: loggedInUser._id,
          },
        },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.json({ data: users });
  } catch (err) {
    res.status(400).send("Server Error: " + err.message);
  }
});

module.exports = userRouter;
