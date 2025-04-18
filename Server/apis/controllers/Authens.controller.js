const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { User } = require("../../models/schema");
dotenv.config();

const register = async (req, res) => {
  try {
    const { PhoneNumber, Email, FirstName, LastName } = req.body;

    //check phonenumber had been used before
    const existPhoneNumber = await User.findOne({ _id: PhoneNumber });
    if (existPhoneNumber) {
      return res.status(400).json({ message: "Phone number already exist" });
    }
    const Role = "User";
    const user = new User({
      _id: PhoneNumber,
      Email,
      FirstName,
      LastName,
      Role,
    });
    const token = jwt.sign(
      { PhoneNumber, Email, FirstName, LastName, Role },
      process.env.SECRET_KEY,
      {
        expiresIn: "24h",
      }
    );
    await user.save();
    res.status(201).json({ message: "User created successfully", token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Đăng ký tài khoản cho nhân viên
const registerStaff = async (req, res) => {
  try {
    const { PhoneNumber, Email, FirstName, LastName } = req.body;

    //check phonenumber had been used before
    const existPhoneNumber = await User.findOne({ _id: PhoneNumber });
    if (existPhoneNumber) {
      return res.status(400).json({ message: "Phone number already exist" });
    }
    const Role = "Staff";
    const user = new User({
      _id: PhoneNumber,
      Email,
      FirstName,
      LastName,
      Role,
    });
    const token = jwt.sign(
      { PhoneNumber, Email, FirstName, LastName, Role },
      process.env.SECRET_KEY,
      {
        expiresIn: "24h",
      }
    );
    await user.save();
    res.status(201).json({ message: "User created successfully", token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { PhoneNumber } = req.body;
    const user = await User.findOne({ _id: PhoneNumber });
    if (!user) return res.status(400).json({ message: "User not found" });
    const token = jwt.sign(
      {
        _id: user._id,
        FirstName: user.FirstName,
        LastName: user.LastName,
        Role: user.Role,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "24h",
      }
    );
    res.status(200).json({ message: "User logged in successfully", token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { register, registerStaff, login };
