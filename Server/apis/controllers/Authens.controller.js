const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { Account } = require("../../models/schema");
const ExcelJS = require("exceljs");
const bcrypt = require("bcrypt");
dotenv.config();
const { logAction } = require("../utils/auditlog");

const registerAD = async (req, res) => {
  try {
    const { PhoneNumber, Email, FirstName, LastName, Password } = req.body;

    if (!PhoneNumber || !Email || !FirstName || !LastName || !Password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    const existingAccount = await Account.findOne({
      $or: [{ PhoneNumber }, { Email }],
    });

    if (existingAccount) {
      return res
        .status(401)
        .json({ message: "Phone number or email already exists" });
    }

    const Role = "Admin";
    const hashedPassword = await bcrypt.hash(Password, 10);

    const user = new Account({
      PhoneNumber,
      Email,
      FirstName,
      LastName,
      Status: "Active",
      Password: hashedPassword,
      Role,
    });

    const token = jwt.sign(
      { PhoneNumber, Email, FirstName, LastName },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );

    await user.save();

    return res
      .status(201)
      .json({ message: "Account created successfully", token });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const register = async (req, res) => {
  try {
    const { PhoneNumber, Email, FirstName, LastName } = req.body;
    if (!PhoneNumber || !Email || !FirstName || !LastName) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }
    const existingAccount = await Account.findOne({
      $or: [{ PhoneNumber }, { Email }],
    });

    if (existingAccount) {
      return res
        .status(401)
        .json({ message: "Phone number or email already exists" });
    }

    const user = new Account({
      PhoneNumber,
      Email,
      FirstName,
      LastName,
      Status: "Active",
      Role: "User",
    });

    // Tạo token JWT
    const token = jwt.sign(
      { PhoneNumber, Email, FirstName, LastName },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );

    await user.save();

    return res
      .status(201)
      .json({ message: "Account created successfully", token });
  } catch (error) {
    console.error("Register error:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { PhoneNumber } = req.body;
    const user = await Account.findOne({ PhoneNumber });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.Status === "Block") {
      return res.status(400).json({ message: "Tài khoản của bạn đã bị khoá" });
    }
    const token = jwt.sign(
      {
        FirstName: user.FirstName,
        LastName: user.LastName,
        Role: user.Role,
        PhoneNumber: user.PhoneNumber,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "24h",
      }
    );
    res.status(201).json({ message: "User logged in successfully", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error by login", error });
  }
};

//Danh sách người dùng
const listUser = async (req, res) => {
  try {
    const admin = req.decoded?.Role;
    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await Account.find({ Role: { $ne: "Admin" } });

    if (!user) {
      res.status(400).json({ message: "Lỗi không tìm thấy dữ liệu" });
    }
    res.status(201).json({ message: "Get user success", user });
  } catch (error) {
    console.error("Error fetching user list:", error);
    res.status(500).json({ message: "Internal server error by listUser" });
  }
};

//Tìm kiếm user
const search_User = async (req, res) => {
  try {
    const admin = req.decoded?.Role;
    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { PhoneNumber } = req.params;

    const user = await Account.findOne({
      PhoneNumber: PhoneNumber,
    });

    if (!user) {
      return res.status(400).json({ message: "Account not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error by searchUser" });
  }
};

//Xuất danh sách người dùng
const exportUser = async (req, res) => {
  try {
    const users = await Account.find({ Role: "User" });

    if (!users || users.length === 0) {
      return res
        .status(401)
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
    ]; //Key của các cột

    worksheet.getRow(1).font = { bold: true }; // in đậm
    worksheet.getRow(1).eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }); //Kẻ ô

    users.forEach((user, index) => {
      const row = worksheet.addRow({
        index: index + 1,
        lastName: user.LastName,
        firstName: user.FirstName,
        email: user.Email,
        phone: user.PhoneNumber,
      });

      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
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
    res.status(500).json({ message: "Lỗi xuất file", error });
  }
};

//Phần quyền staff
const updateRole = async (req, res) => {
  try {
    const { PhoneNumber, Password } = req.body;
    const adminPhone = req.decoded?.PhoneNumber;

    const adminAccount = await Account.findOne({ PhoneNumber: adminPhone });
    if (!adminAccount) {
      return res.status(401).json({ message: "Không đúng tài khoản admin" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      Password,
      adminAccount.Password
    );
    if (!isPasswordCorrect) {
      return res
        .status(402)
        .json({ message: "Bạn không có quyền cập nhập vì sai mật khẩu" });
    }

    const user = await Account.findOne({ PhoneNumber });
    if (!user) {
      return res.status(403).json({ message: "Không tìm thấy người dùng" });
    }

    if (user.Role === "User") {
      user.Role = "Staff";
    }
    await user.save();

    return res.status(200).json({ message: "Cập nhật thành công", user });
  } catch (error) {
    console.error("Error updating role:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ khi cập nhật quyền",
      error: error.message,
    });
  }
};

const BlockAccount = async (req, res) => {
  try {
    const { PhoneNumber } = req.params;
    const checkRole = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });

    if (checkRole.Role !== "Admin" && checkRole.Role !== "Staff") {
      return res
        .status(402)
        .json({ message: "Bạn không có quyền khoá tài khoản" });
    }

    const user = await Account.findOne({ PhoneNumber });
    if (!user) {
      return res.status(403).json({ message: "Không tìm thấy người dùng" });
    }

    if (user.Role === "Admin") {
      return res
        .status(400)
        .json({ message: "Không thể cập nhật quyền cho tài khoản này" });
    }

    if (user.Status === "Active") {
      user.Status = "Block";
    } else if (user.Role === "Block") {
      user.Status = "Active";
    }

    await user.save();

    return res
      .status(201)
      .json({ message: "Đã khóa tài khoản thành công", user });
  } catch (error) {
    console.error("Error updating role:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ khi cập nhật",
      error: error.message,
    });
  }
};
module.exports = {
  register,
  login,
  listUser,
  search_User,
  exportUser,
  updateRole,
  registerAD,
  BlockAccount,
};
