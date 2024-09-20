const express = require("express");

const app = express(); // This app is instance of express. This app is creating a new web server using express

const connectDB = require("./config/database");

/* 

For Handleing Request

app.use("/", (req, res) => {
  res.send("Hello from the DashBoard!!!");
});

    app.use("/ab?c", (req, res) => {
        res.send("Hello");
    });
    Pattern Breakdown:
        /a: The route must start with a.
        b?: The b is optional, meaning the route can either have b or not.
        c: The route must end with c.

    Matched URLs:
    The following URLs will match this route:
        /ac → The b is missing, but this is valid because b is optional.
        /abc → This is a valid match because it includes both b and c.

    Non-Matching URLs:
    These URLs won't match the route:
        /a → Missing c, which is required.
        /ab → Missing c.
        /abcd → d is not part of the pattern.
    Summary:
        This route will respond with "Hello" for requests that match either /ac or /abc.

app.use("/test", (req, res) => {
  res.send("Hello from the server");
});
app.use("/hello", (req, res) => {
  res.send("Hello hello hello !!!");
});

Why i move this from top to bottom because when ever any request come to server it check the path that it include / it will return from there only 
    Ex: If on server if i write localhost:3000/hello/anything it will print the /hello part it will not check after /hello what is written. Same way it will / only and return from top it will not check that is it /hello or /text that why i move it from top to bottom.

    --- Order of Routes Matter ----

app.use("/", (req, res) => {
  res.send("Hello from DashBoard");
});

app.get("/user", (req, res) => {
  res.send({ firstName: "Prashant", lastName: "Raj" });
});

app.post("/user", (req, res) => {
  res.send("Data Added Succesfully");
});

app.delete("/user", (req, res) => {
  res.send("Deleted Succesfully");
});
*/

// This is the middleware for converting the json data into js object for all

const User = require("./models/user");
const { restart } = require("nodemon");
app.use(express.json());

// This is for Feed API - GET/Feed - get all the users from the database

app.get("/feed", async (req, res) => {
  try {
    const user = await User.find({});
    if (!user) {
      res.status(404).send("User Not Found");
    } else {
      res.send(user);
    }
  } catch {
    restart.status(400).send("Something Went Wrong");
  }
});

// This is for single user
app.get("/user", async (req, res) => {
  const userEmail = req.body.emailId;

  try {
    const user = await User.find({ emailId: userEmail }); // if i pass empty {} inside this than it will return all
    if (user.length === 0) {
      res.status(404).send("User Not Found");
    }
    res.send(user);
  } catch {
    res.status(400).send("Something went wrong");
  }
});

// This is for delete user from the database

app.delete("/user", async (req, res) => {
  const userId = req.body._id;

  try {
    //const user  = await User.findByIdAndDelete({_id:userId});
    // or Both are same like for deleting user we can pass userId to delete user from the database.
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      res.status(404).send("user Not Found");
    } else {
      res.send("User Deleted Successfully");
    }
  } catch {
    res.status(400).send("Something went wrong");
  }
});

// This is for Patch
app.patch("/user", async (req, res) => {
  const userId = req.body._id;
  const data = req.body;
  try {
    // console.log(userId);
    const user = await User.findByIdAndUpdate({ _id: userId }, data);
    //console.log(user);
    if (!user) {
      res.status(404).send("User Not Found....");
    } else {
      res.send("User Updated");
    }
  } catch {
    res.status(400).send("Something went wrong......");
  }
});

// This is for SignUp API
app.post("/signup", async (req, res) => {
  // console.log(req.body);  ---> it will read the data from postman(from html/web-page) and we can use it for storing it into DB

  // Creating a new instance of User object
  const user = new User(req.body);

  try {
    await user.save();

    res.send("User Added Successfully");
  } catch {
    res.status(400).send("Error saving the user:" + err.message);
  }
});

connectDB()
  .then(() => {
    console.log("Database connection established!");
    app.listen(3000, () => {
      console.log("Server is listening on port 3000.");
    });
  })
  .catch((err) => {
    console.error("error is there");
  });
