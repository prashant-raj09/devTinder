const express = require("express");

const app = express(); // This app is instance of express. This app is creating a new web server using express

// For Handleing Request
// app.use("/", (req, res) => {
//   res.send("Hello from the DashBoard!!!");
// });
app.use("/test", (req, res) => {
  res.send("Hello from the server");
});
app.use("/hello", (req, res) => {
  res.send("Hello hello hello !!!");
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000.");
});
