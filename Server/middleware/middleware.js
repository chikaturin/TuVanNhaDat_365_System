const { verify } = require("jsonwebtoken");
const dotenv = require("dotenv");
const { Account } = require("../models/schema");
dotenv.config();

const checkToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(405).json({ message: "Token is required" });
  }

  verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(406).json({ message: "Invalid token" });
    }
    req.decoded = decoded;
    next();
  });
};

const checkTokenAPI = (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return res.status(405).json({ message: "Token is required" });
  }

  verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(405).json({ message: "Invalid token" });
    }
    req.decoded = decoded;
    res.status(200).json({
      decoded,
    });
  });
};

const checkTokenAPI2 = async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    const decoded = verify(token, process.env.SECRET_KEY);
    req.decoded = decoded;

    const account = await Account.findOne({
      PhoneNumber: decoded?.PhoneNumber,
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (account.Role !== "Admin" && account.Role !== "Staff") {
      res.status(201).json({
        decoded,
      });
    }

    return res.status(200).json({ role: account.Role });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const validateApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey) {
    return res.status(407).json({ message: "Thiếu API key" });
  }
  if (apiKey !== process.env.API_KEY) {
    return res.status(408).json({ message: "API key không hợp lệ" });
  }
  next();
};

module.exports = { checkToken, validateApiKey, checkTokenAPI, checkTokenAPI2 };
