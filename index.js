const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session"); // Updated import
const dotenv = require("dotenv").config();
const cookieParser = require("cookie-parser");
const passport = require("passport");
const setupSwagger = require("./docs/swagger");
const route = require("./routes/routes");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true, // Fixed the typo (Unitialized -> Uninitialized)
    resave: false,
  })
);
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
// the routings
app.use(route);

//swagger setup
setupSwagger(app);
const URI = process.env.MONGODB_URI;
mongoose.connect(URI);
const database = mongoose.connection;
database.on("error", () => {
  console.log("Error connecting with the database");
});
database.once("open", () => {
  console.log("Connected to the database successfully");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port  🚀 ${PORT}`);
});
