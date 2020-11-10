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
app.use(cookieParser());

app.get("/", (req, res) => {
  // TODO if user is already logged in, redirect to dashboard
  // otherwsie render the login form
  const message = req.cookies.message;
  res.render("index.njk", { message });
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
    res.redirect(`/dashboard?username=${user.username}`);
  } catch (err) {
    console.log(err);
    // redirect to homepage
    res.cookie("message", "Incorrect username or password").redirect("/");
  }
});

app.get("/dashboard", (req, res) => {
  const username = req.query.username;
  res.render("dashboard.njk", { username });
});

app.post("/logout", (req, res) => {
  // TODO log user out of the application
  // redirect to the login page
  console.log(colors.cyan("Log out!"));
  res.redirect("/");
});

app.get("/register", (req, res) => {
  res.render("register.njk", null);
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
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});

app.listen(port, () =>
  console.log(`Users' App is running at http://localhost:${port}`)
);
