const express = require("express");

const app = express(); // This app is instance of express. This app is creating a new web server using express

// For Handleing Request

// app.use("/", (req, res) => {
//   res.send("Hello from the DashBoard!!!");
// });
/*

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
*/

// app.use("/test", (req, res) => {
//   res.send("Hello from the server");
// });
// app.use("/hello", (req, res) => {
//   res.send("Hello hello hello !!!");
// });
/*
Why i move this from top to bottom because when ever any request come to server it check the path that it include / it will return from there only 
    Ex: If on server if i write localhost:3000/hello/anything it will print the /hello part it will not check after /hello what is written. Same way it will / only and return from top it will not check that is it /hello or /text that why i move it from top to bottom.

    --- Order of Routes Matter ----
*/
// app.use("/", (req, res) => {
//   res.send("Hello from DashBoard");
// });

app.get("/user", (req, res) => {
  res.send({ firstName: "Prashant", lastName: "Raj" });
});

app.post("/user", (req, res) => {
  res.send("Data Added Succesfully");
});

app.delete("/user", (req, res) => {
  res.send("Deleted Succesfully");
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000.");
});
