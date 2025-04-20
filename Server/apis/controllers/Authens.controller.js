const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { User } = require("../../models/schema");
const ExcelJS = require("exceljs");
dotenv.config();

const register = async (req, res) => {
  try {
    const { PhoneNumber, Email, FirstName, LastName } = req.body;

    // Kiểm tra xem số điện thoại đã tồn tại chưa
    const existingUser = await User.findById(PhoneNumber);
    if (existingUser) {
      return res.status(400).json({ message: "Phone number already exists" });
    }

    const Role = "User";

    const user = new User({
      _id: PhoneNumber, // dùng phone làm _id
      Email,
      FirstName,
      LastName,
      Role,
    });

    const token = jwt.sign(
      { PhoneNumber, Email, FirstName, LastName, Role },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );

    await user.save();

    return res.status(201).json({ message: "User created successfully", token });
  } catch (error) {
    console.error("Error in register:", error); // In lỗi ra console để dễ debug
    return res.status(500).json({
      message: "Internal server error",
      error: error.message || "Unknown error",
    });
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

//Danh sách người dùng
const listUser = async (req, res) => {
  try {
    const user = await User.find();
    if (!user) {
      res.status(400).json({ message: "Lỗi không tìm thấy dữ liệu" });
    }
    res.status(201).json({ message: "Get user success", user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

//Tìm kiếm user
const search_User = async (req, res) => {
  try {
    const { phone } = req.params;
    const user = await User.findById(phone);
    if (!user) {
      res.status(401).json({ message: "User not found" });
    }
    res.status(201).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

//Xuất danh sách người dùng
const exportUser = async (req, res) => {
  try {
    const users = await User.findOne({ Role: "User" });

    if (!users || users.length === 0) {
      return res
        .status(400)
        .json({ message: "Không có người dùng nào để xuất" });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Danh sách người dùng");

    worksheet.columns = [
      { header: "STT", key: "index", width: 10 },
      { header: "Họ", key: "lastName", width: 30 },
      { header: "Tên", key: "firstName", width: 30 },
      { header: "Email", key: "email", width: 30 },
      { header: "Số điện thoại", key: "phone", width: 20 },
    ];

    users.forEach((user, index) => {
      worksheet.addRow({
        index: index + 1,
        lastName: user.LastName,
        firstName: user.FirstName,
        email: user.Email,
        phone: user._id,
      });
    });

    // Set header để download file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");

    // Ghi file vào response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Lỗi xuất file:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

//Phần quyền staff
const updateRole = async (req, res) => {
  try {
    //phone của nhân viên, Role bạn muốn cập nhập
    //Password của Admin khi muốn cập nhập
    const { phone, Password, Role } = req.body;
    const admin = req.decoded?._id;
    const passWordAdmin = await User.findById(admin);

    if (Password !== passWordAdmin) {
      res.status(401).json({ message: "Bạn không có quyền cập nhập" });
    }
    const user = await User.findByIdAndUpdate(phone, {
      $set: {
        Role: Role,
      },
    });
    await user.save();
    res.status(201).json({ message: "Update success" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  register,
  registerStaff,
  login,
  listUser,
  search_User,
  exportUser,
  updateRole,
};
