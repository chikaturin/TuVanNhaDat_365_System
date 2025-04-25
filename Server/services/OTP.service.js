// const twilio = require("twilio");
// const redis = require("redis");
// const crypto = require("crypto");
// require("dotenv").config();

// const client = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

// const redisClient = redis.createClient();
// redisClient.connect();

// // Tạo OTP 6 chữ số an toàn
// const generateOTP = () => {
//   return crypto.randomInt(100000, 999999).toString();
// };

// const RATE_LIMIT = 5; // Tối đa 3 yêu cầu
// const RATE_LIMIT_WINDOW = 300; // 5 phút tính bằng giây
// const COOLDOWN_PERIOD = 30; // 30 giây trước khi yêu cầu OTP tiếp theo

// const sendOTP = async (req, res) => {
//   try {
//     // Kiểm tra API key
//     const { phone } = req.body;

//     if (!phone) {
//       return res.status(400).json({ message: "Số điện thoại là bắt buộc" });
//     }

//     // Kiểm tra giới hạn tỷ lệ
//     const rateLimitKey = `rate_limit:${phone}`;
//     const currentCount = await redisClient.get(rateLimitKey);
//     const requestCount = parseInt(currentCount) || 0;

//     // if (requestCount >= RATE_LIMIT) {
//     //   return res
//     //     .status(429)
//     //     .json({ message: "Quá nhiều yêu cầu, vui lòng thử lại sau" });
//     // }

//     // Kiểm tra thời gian chờ
//     const lastRequestKey = `last_request:${phone}`;
//     const lastRequestTime = await redisClient.get(lastRequestKey);
//     const currentTime = Math.floor(Date.now() / 1000);

//     if (
//       lastRequestTime &&
//       currentTime - parseInt(lastRequestTime) < COOLDOWN_PERIOD
//     ) {
//       return res.status(429).json({
//         message: `Vui lòng đợi ${COOLDOWN_PERIOD} giây trước khi yêu cầu OTP mới`,
//       });
//     }

//     // Tạo và lưu OTP
//     const otp = generateOTP();
//     const otpKey = `otp:${phone}`;
//     const phoneKey = `phone:${phone}`;

//     // Lưu OTP và số điện thoại với thời gian hết hạn 2 phút
//     await redisClient.setEx(otpKey, 120, otp);
//     await redisClient.setEx(phoneKey, 120, phone);

//     // Cập nhật giới hạn tỷ lệ
//     if (requestCount === 0) {
//       await redisClient.setEx(rateLimitKey, RATE_LIMIT_WINDOW, "1");
//     } else {
//       await redisClient.incr(rateLimitKey);
//     }

//     // Cập nhật thời gian yêu cầu cuối cùng
//     await redisClient.setEx(
//       lastRequestKey,
//       COOLDOWN_PERIOD,
//       currentTime.toString()
//     );

//     // Gửi OTP qua Twilio
//     await client.messages.create({
//       body: `Mã OTP của bạn là: ${otp}`,
//       from: process.env.TWILIO_PHONE_NUMBER,
//       to: phone,
//     });

//     return res
//       .status(200)
//       .json({ message: `OTP đã được gửi đến số điện thoại của bạn` });
//   } catch (error) {
//     console.error("Lỗi trong sendOTP:", error);
//     return res.status(500).json({ message: "Lỗi server, vui lòng thử lại" });
//   }
// };

// const verifyOTP = async (req, res) => {
//   try {
//     // Kiểm tra API key
//     const checkAPIkey = validateApiKey(req, res);
//     if (checkAPIkey) return checkAPIkey;

//     const { phone, otp } = req.body;

//     if (!phone || !otp) {
//       return res
//         .status(400)
//         .json({ message: "Số điện thoại và OTP là bắt buộc" });
//     }

//     const otpKey = `otp:${phone}`;
//     const cachedOTP = await redisClient.get(otpKey);

//     if (cachedOTP === null) {
//       return res.status(404).json({ message: "OTP đã hết hạn" });
//     }

//     if (cachedOTP !== otp) {
//       return res.status(400).json({ message: "OTP không đúng" });
//     }

//     // OTP hợp lệ, dọn dẹp Redis
//     await redisClient.del(otpKey);
//     await redisClient.del(`phone:${phone}`);

//     return res.status(200).json({ phone, message: "Xác thực OTP thành công" });
//   } catch (error) {
//     console.error("Lỗi trong verifyOTP:", error);
//     return res.status(500).json({ message: "Lỗi server, vui lòng thử lại" });
//   }
// };

// module.exports = { sendOTP, verifyOTP };
