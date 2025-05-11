const nodemailer = require("nodemailer");
const {Otp} = require("../../models/schema")

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME, // email của bạn
        pass: process.env.EMAIL_PASSWORD, // mật khẩu ứng dụng hoặc token
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
};


const sendOTP = async (req, res) => {
  try {
    const email = req.body.email;
    console.log("email", email);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Cập nhật hoặc tạo mới OTP
    await Otp.findOneAndUpdate(
      { email },
      { otp },
      { upsert: true, new: true }
    );

    // Cấu hình gửi email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: "Mã xác thực OTP",
      text: `Mã xác thực của bạn là: ${otp}`,
      html: `<p>Mã xác thực của bạn là: <strong>${otp}</strong></p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);

    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
 
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return res.status(404).json({ success: false, message: "OTP not found or expired" });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Xoá OTP sau khi xác thực thành công
    await Otp.deleteOne({ email });

    return res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ success: false, error: error.message });
  } 
};

module.exports = {
  sendEmail,
  sendOTP,
  verifyOTP,
};