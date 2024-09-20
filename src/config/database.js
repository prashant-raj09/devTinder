const { mongoose } = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://prashantraj12313:RlTM5T5zEI26Or8z@namastenode.wtuoh.mongodb.net/devTinder"
  );
};


module.exports = connectDB

