const nodemailer = require("nodemailer");



const sendEmail = async ({ to, subject, text, html }) => {
  try {
    console.log("Email: ",process.env.EMAIL_USERNAME);
    console.log("Password: ",process.env.EMAIL_PASSWORD);
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

module.exports = {
  sendEmail,
};