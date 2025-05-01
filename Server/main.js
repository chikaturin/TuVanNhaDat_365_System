const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const { json } = require("body-parser");
const db = require("./models/db");

const app = express();

app.use(json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("combined"));

const allowedOrigins = ["http://localhost:8888", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.error("Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Routers
app.use("/api", require("./apis/routers/Authens.router"));
app.use("/api", require("./apis/routers/Post.router"));
app.use("/api", require("./apis/routers/Components.router"));

// Manual CORS fallback
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:8081");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.get("/", (req, res) => res.send("Express on Vercel"));

// Error handler
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send("Something broke!");
});

module.exports = app;
