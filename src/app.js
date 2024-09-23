const express = require("express");

const app = express(); // This app is instance of express. This app is creating a new web server using express

const connectDB = require("./config/database");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const validator = require("validator");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth");
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

// This is act like middleware for converting it into json object for all
app.use(express.json());

// This is act like middleware for reading the cookies from the server and sending them to the client.
app.use(cookieParser());

// This is for SignUp API
app.post("/signup", async (req, res) => {
  // console.log(req.body);  ---> it will read the data from postman(from html/web-page) and we can use it for storing it into DB

  try {
    // This function is for validation purposes only
    validateSignUpData(req);

    // Hashing the password using bcrypt
    const { firstName, lastName, emailId, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    // Creating a new instance of User object
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    await user.save();
    res.send("User Added Successfully");
  } catch (err) {
    res.status(400).send("Error saving the user:" + err.message);
  }
});

// This is for Login API
app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!validator.isEmail(emailId)) {
      throw new Error("Invalid Email Address");
    }
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid Email Address...");
    }

    // Validating the password using bcrypt through the function which is defined in the userSchema in user.js
    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      throw new Error("Invalid Password, Please enter valid Password");
    } else {

      // Creating JWT (JSON Web Token) using the function which is defined in userSchema in user.js
      const token = await user.getJWT();

      // Setting the JWT in a cookie and it will expire after 8hrs from now on.
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 + 3600000),
      });

      res.send("Login Successful");
    }
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

// This is fro Profile
// Here i am passing userAuth for authentication purposes and it is handled by the middleware which will handle the authentication process.
app.get("/profile", userAuth, async (req, res) => {
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
app.patch("/user/:userId", async (req, res) => {
  const userId = req.params?.userId;
  const data = req.body;
  try {
    const ALLOWED_UPDATES = ["photoUrl", "about", "gender", "age", "skills"];
    const isValidAllowed = Object.keys(data).every((key) =>
      ALLOWED_UPDATES.includes(key)
    );
    if (!isValidAllowed) {
      throw new Error("Update not allowed");
    }
    const user = await User.findByIdAndUpdate({ _id: userId }, data, {
      runValidators: true,
    });
    //console.log(user);
    if (!user) {
      res.status(404).send("User Not Found....");
    } else {
      res.send("User Updated");
    }
  } catch (err) {
    res.status(400).send("Update Failed " + err.message);
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
