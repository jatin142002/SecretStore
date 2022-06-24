require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

// const encrypt = require("mongoose-encryption"); // -------Use of mongoose encryption

// const md5 = require("md5"); // ---------------Hashing Technique

const bcrypt = require("bcrypt"); // -------------Salting and Hashing
const saltRounds = 10;

const app = express();

mongoose.connect("mongodb://localhost:27017/SecretUserDB", {
  useNewUrlParser: true,
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// --------------Mongoose encryption applied
// console.log(process.env.SECRET);
// userSchema.plugin(encrypt, { secret: process.env.SECRET , encryptedFields: ["password"]});

const User = mongoose.model("User", userSchema);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  // const newUser = new User({
  //   email: req.body.email,
  //   password: md5(req.body.password),
  // });

  // newUser.save(function (err) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     res.render("secrets");
  //   }
  // });

  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    // Store hash in your password DB.
    const newUser = new User({
      email: req.body.email,
      password: hash,
    });

    newUser.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        res.render("secrets");
      }
    });
  });
});

app.post("/login", function (req, res) {
  User.findOne({ email: req.body.email }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        bcrypt.compare(req.body.password, foundUser.password, function (err, result) {
          if (result === true) {
            res.render("secrets");
          } else {
            res.send("Enter correct credentials");
          }
        });
      } else {
        res.send("Enter correct credentials");
      }
    }
  });
});

app.listen(5000, function () {
  console.log("Server started at port 5000");
});
