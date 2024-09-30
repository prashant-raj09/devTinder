const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const requestRouter = express.Router();

// This is for sending the friend request to the Other Account.
requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const { status, toUserId } = req.params;

      // it will check the status of what user is sending.
      const allowedStatus = ["rejected", "interested"];

      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Invalid status " + status });
      }

      // it will find the user to whom the request is being sent. is it present in the DB?
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(400).json({ message: "User not found" });
      }

      const checkConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          {
            fromUserId,
            toUserId,
          },
          {
            fromUserId: toUserId,
            toUserId: fromUserId,
          },
        ],
      });

      if (checkConnectionRequest) {
        return res.status(400).json({ message: "Request already sent" });
      }

      // TODO: Send request to the toUserId with status

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });
      const data = await connectionRequest.save();

      res.json({
        message:
          req.user.firstName + " is " + status + " in " + toUser.firstName,
        data,
      });
    } catch (err) {
      res.status(400).send("Error : " + err.message);
    }
  }
);

// This is for accepting the friend request from the Other Account.
requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      if (requestId == loggedInUser._id) {
        return res
          .status(400)
          .json({ message: "Cannot review your own request" });
      }

      // Check the status of the request is valid or not
      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Invalid status " + status });
      }

      // Check if the request exists and belongs to the logged user and the status is Interested to be accepted or not
      const connectionRequest = await ConnectionRequest.findOne({
        fromUserId: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!connectionRequest) {
        return res
          .status(400)
          .json({ message: "Request not found or not accepted by you" });
      }

      connectionRequest.status = status;
      const data = await connectionRequest.save();

      res.json({ message: "Connection request " + status, data });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// This is for unfollow the user of the connection list

requestRouter.post(
  "/connection/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      if (requestId == loggedInUser._id) {
        return res
          .status(400)
          .json({ message: "Cannot review your own request" });
      }

      // Check the status of the request is valid or not
      // const allowedStatus = ["unfollow"];
      if (status !== "unfollow") {
        return res.status(400).json({ message: "Invalid status " + status });
      }

      // Fetch the specific connection request by requestId
      const connectionRequest = await ConnectionRequest.findOneAndUpdate(
        {
          $or: [
            {
              toUserId: loggedInUser._id,
              fromUserId: requestId,
              status: "accepted",
            },
            {
              fromUserId: loggedInUser._id,
              toUserId: requestId,
              status: "accepted",
            },
          ],
        },
        { status: "unfollow" }, // Update the status
        { new: true } // Return the updated document
      ).select("fromUserId toUserId"); //By calling .select("fromUserId toUserId"), you're telling Mongoose to only return the fromUserId and toUserId fields from the document, along with the _id (which is included by default unless excluded).

      if (!connectionRequest) {
        return res
          .status(400)
          .json({ message: "Request not found or not accepted by you" });
      }

      res.json({
        message: "Connection request unfollowed",
        data: connectionRequest,
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

module.exports = requestRouter;
