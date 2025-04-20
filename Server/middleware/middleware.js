const { verify } = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const checkToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token is required" });
  }

  verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.decoded = decoded;
    next();
  });
};

const validateApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey) {
    return res.status(401).json({ message: "Thiếu API key" });
  }
  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({ message: "API key không hợp lệ" });
  }
  next();
};

module.exports = { checkToken, validateApiKey };
