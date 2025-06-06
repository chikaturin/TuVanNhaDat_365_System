// const admin = require("firebase-admin");
// const dotenv = require("dotenv");
// dotenv.config();
// const { Account } = require("../models/schema");
// const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// const convertPhoneNumber = (phoneNumber) => {
//   if (phoneNumber.startsWith("0")) {
//     return `+84${phoneNumber.slice(1)}`;
//   }
//   return phoneNumber;
// };

// const resetOTP = async (req, res) => {
//   const { PhoneNumber } = req.params;

//   if (!PhoneNumber) {
//     return res.status(400).json({ error: "Missing phone number" });
//   }

//   try {
//     console.log("req.decoded:", req.decoded);

//     const checkToken = await Account.findOne({
//       PhoneNumber: req.decoded?.PhoneNumber,
//     });

//     if (
//       !checkToken ||
//       (checkToken.Role !== "Admin" && checkToken.Role !== "Staff")
//     ) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const formattedPhoneNumber = convertPhoneNumber(PhoneNumber);
//     const user = await admin.auth().getUserByPhoneNumber(formattedPhoneNumber);
//     await admin.auth().deleteUser(user.uid);

//     return res.status(200).json({
//       message: "OTP đã được reset",
//       uid: user.uid,
//     });
//   } catch (error) {
//     console.error("Error:", error.message || error);
//     return res
//       .status(500)
//       .json({ error: error.message || "Failed to reset OTP" });
//   }
// };

// module.exports = { resetOTP }
