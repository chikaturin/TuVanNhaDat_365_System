const { Contact, Account } = require("../../models/schema");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSAPP,
  },
});

// Cấu hình nội dung email
const mailOptions = (post, email) => ({
  from: process.env.EMAIL,
  to: process.env.MYEMAIL,
  subject: "Yêu cầu liên hệ từ người dùng NekoHome",
  text: `Có yêu cầu liên hệ từ người dùng NekoHome hãy kiểm tra`,
  html: `
  <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333;">
    <p>
      Có người dùng email là <strong>${email}</strong> đã từ NekoHome gửi 
      ${
        post === "NO"
          ? "<strong>EMAIL cần liên hệ</strong>"
          : `liên hệ về bài đăng : 
              <a href="https://nekohome.vn/property-detail/${post}" target="_blank" 
                 style="color: #1a73e8; text-decoration: none;">
                Xem Bài Đăng
              </a>`
      }
    </p>
  </div>
`,
});

const sendContact = async (req, res) => {
  try {
    const { name, phone, post, typeofPost, email, message } = req.body;

    const existingRequest = await Contact.find({
      email: email,
      phone: phone,
    });
    if (existingRequest.length > 5) {
      return res
        .status(401)
        .json({ message: "Bạn đã gửi yêu cầu về bài đăng này rồi" });
    }
    const checkContact = await Contact.findOne({
      email: email,
      phone: phone,
    });
    if (checkContact) {
      return res
        .status(402)
        .json({ message: "Bạn đã gửi yêu cầu liên hệ rồi" });
    }

    const newRequest = new Contact({
      name,
      phone,
      post,
      typeofPost,
      email,
      message,
    });

    await transporter.sendMail(mailOptions(post, email || "NO", email));
    await newRequest.save();

    return res.status(200).json({ message: "Yêu cầu đã được gửi thành công" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi trong quá trình gửi yêu cầu" });
  }
};

const getContact = async (req, res) => {
  try {
    const checkRole = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });

    if (checkRole.Role !== "Admin" && checkRole.Role !== "Staff") {
      return res.status(403).json({ message: "Khong co quyen truy cap" });
    }
    const contact = await Contact.find({});
    if (!contact) {
      return res.status(404).json({ message: "Khong co yeu cau lien he" });
    }
    return res.status(200).json({ contact });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi trong quá trình gửi yêu cầu" });
  }
};

const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndDelete(id);
    if (!contact) {
      return res.status(404).json({ message: "Khong tim thay yeu cau" });
    }
    return res.status(200).json({ message: "Xoa yeu cau thanh cong" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi trong quá trình gửi yêu cầu" });
  }
};

const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const status = "Đã liên hệ";
    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ message: "Khong tim thay yeu cau" });
    }
    return res.status(200).json({ message: "Cap nhat yeu cau thanh cong" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi trong quá trình gửi yêu cầu" });
  }
};

module.exports = {
  sendContact,
  getContact,
  updateContact,
};
