require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "Long Live India",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/SecretUserDB", {
  useNewUrlParser: true,
});
// mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/secrets", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.post("/register", function (req, res) {
  User.register({ username: req.body.email }, req.body.password, function (err, user) {
      if (err)
      {
        console.log(err);
        res.redirect("/register");
      } 
      else 
      {
        console.log("register ho gya hu !!");
        passport.authenticate("local", function(err, user, info){
          console.log("I am authenticated !!");
          res.redirect("/secrets");
        })(req, res);
      }
  });
});

app.post("/login", function (req, res) {

  const user = new User({
    username: req.body.email,
    password: req.body.password
  });

  req.login(user, function(err){
    if(err)
    {
      console.log(err);
    }
    else
    {
      console.log("I am logged in !!");
      passport.authenticate("local", function(err, user, info){
        console.log("I am authenticated !!");
        res.redirect("/secrets");
      })(req, res);
    }
  })
});

app.listen(5000, function () {
  console.log("Server started at port 5000");
});
