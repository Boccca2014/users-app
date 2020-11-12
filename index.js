require("dotenv").config();
const cookieParser = require("cookie-parser");
const users = require("./model/User.js");
const db = require("./data/db.js");
const morgan = require("morgan");
const colors = require("colors");
const nunjucks = require("nunjucks");
const express = require("express");
const app = express();
const port = process.env.PORT || 5001;

db.connect();

nunjucks.configure("views", {
  express: app,
});

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.static("assets"));
app.use(cookieParser(process.env.ENCRYPT_KEY));

app.use((req, res, next) => {
  if (req.cookies.message) {
    res.clearCookie("message");
  }
  next();
});

app.get("/", (req, res) => {
  const username = req.signedCookies.username;
  const message = req.cookies.message;
  if (username) {
    res.redirect("/dashboard");
  } else {
    res.render("index.njk", { message });
  }
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  console.log(colors.cyan("Login using", { username, password }));

  try {
    // check credential
    const user = await users.findOne({ username, password });
    if (!user) throw Error("No user found with this username!");
    console.log(user);
    // redirect to dashboard
    res
      .cookie("username", user.username, { signed: true })
      .redirect(`/dashboard`);
  } catch (err) {
    console.log(err);
    // redirect to homepage
    res.cookie("message", "Incorrect username or password").redirect("/");
  }
});

app.get("/dashboard", (req, res) => {
  const username = req.signedCookies.username;
  const message = req.cookies.message;
  if (username) {
    res.render("dashboard.njk", { username, message });
  } else {
    res.cookie("message", "Please login first!").redirect("/");
  }
});

app.post("/logout", (req, res) => {
  console.log(colors.cyan("Log out!"));
  res
    .clearCookie("username")
    .cookie("message", "You have successfully logged out!")
    .redirect("/");
});

app.get("/register", (req, res) => {
  const message = req.cookies.message;
  res.render("register.njk", { message });
});

app.post("/register", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  console.log(colors.cyan("Register:", { username, password }));
  try {
    // TODO register the user!
    const user = await users.create({ username, password });
    console.log(user);
    // redirect to the login page
    res.cookie("message", "You have successfully registered!").redirect("/");
  } catch (err) {
    console.log(err);
    res
      .cookie("message", "Invalid username or password!")
      .redirect("/register");
  }
});

app.listen(port, () =>
  console.log(`Users' App is running at http://localhost:${port}`)
);
