require("dotenv").config();
require("./config/mongo"); // database initial setup

// base dependencies
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const hbs = require("hbs");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const dev_mode = false;
const logger = require("morgan");

// config logger (pour debug)
app.use(logger("dev"));

// initial config
app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
app.use(express.static("public"));
hbs.registerPartials(__dirname + "/views/partial");
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// SESSION SETUP
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 3600000 }, // in millisec
    store: new MongoStore({
      mongooseConnection: mongoose.connection, // you can store session infos in mongodb :)
      ttl: 24 * 60 * 60, // 1 day
    }),
    saveUninitialized: true,
    resave: true,
  })
);

// below, site_url is used in partials/shop_head.hbs to perform ajax request (var instead of hardcoded)
app.locals.site_url = process.env.SITE_URL;

app.use(flash());

// CUSTOM MIDDLEWARES

if (dev_mode === true) {
  app.use(require("./middlewares/devMode")); // triggers dev mode during dev phase
  app.use(require("./middlewares/debugSessionInfos")); // displays session debug
}

app.use(require("./middlewares/exposeLoginStatus"));
app.use(require("./middlewares/exposeFlashMessage"));

// Require routers
app.use("/", require("./route/index"));
app.use("/", require("./route/auth"));
app.use("/", require("./route/event"));
app.use("/", require("./route/dashboard"));

// app.use("/", require("./route/dashboard_sneaker"));

// Connect to the home page
// app.get("/", (req, res) => {
//   res.render("homepage");
// });

//******Limit how carousel (To be deleted later)****/

module.exports = app;
