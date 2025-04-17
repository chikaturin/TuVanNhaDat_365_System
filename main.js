import express, { json } from "express";
import cors from "cors";
import { config } from "dotenv";
import bodyParser from "body-parser";
const jsonParser = bodyParser.json();
const app = express();
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { createServer } from "http";
// import db from "./models/db.js";

// middleware always put first
app.use(json());
app.use(cookieParser());
app.use(morgan("combined"));

const allowedOrigins = ["http://localhost:8888"];

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (
        allowedOrigins.some((allowedOrigin) => origin.startsWith(allowedOrigin))
      ) {
        return callback(null, true);
      }
      console.error("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

//routers

// 🔥 Add CORS headers manually in case middleware fails
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:8081");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.get("/", (req, res) => res.send("Express on local"));

// Xử lý lỗi
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send("Something broke!");
  next();
});

const server = createServer(app);
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Now streaming on http://localhost:${PORT}`);
});

export default app;
