const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"User", // This is the reference to the User collection
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is incorrect status type`,
      },
    },
  },
  {
    timestamps: true,
  }
);

// compound index for making DB faster

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

// Pre-save hook to prevent duplicate requests
connectionRequestSchema.pre("save", function(next){
  const connectionRequest = this;

  // TODO: Implement logic to prevent duplicate requests
  // Check if the fromUserId and toUserId same values
  if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
    throw new Error("You can't send a connection request to yourself");
  }
  next();
})

const ConnectionRequest = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);

module.exports = ConnectionRequest;
