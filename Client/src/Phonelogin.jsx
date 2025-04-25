import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const PhoneLogin = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [message, setMessage] = useState("");

  // Kiểm tra và thiết lập reCAPTCHA chỉ một lần duy nhất
  useEffect(() => {
    console.log("Checking for reCAPTCHA setup");

    // // Kiểm tra auth có đúng không
    // if (!auth) {
    //   console.error("Firebase auth is not properly initialized.");
    //   return;
    // }

    // if (!window.recaptchaVerifier) {
    //   console.log("Setting up reCAPTCHA", auth);

    //   window.recaptchaVerifier = new RecaptchaVerifier(
    //     "recaptcha-container",
    //     {
    //       size: "invisible", // Invisible reCAPTCHA
    //       defaultCountry: "VN", // Default country code (Vietnam)
    //     },
    //     auth
    //   );

    //   // Render reCAPTCHA và thêm log khi hoàn tất
    //   window.recaptchaVerifier
    //     .render()
    //     .then(function () {
    //       console.log("reCAPTCHA đã được render.");
    //     })
    //     .catch((err) => {
    //       console.error("Lỗi khi render reCAPTCHA:", err);
    //     });
    // }
  }, []);

  const validatePhoneNumber = (phone) => {
    const regex = /^\+84\d{9}$/;
    return regex.test(phone);
  };

  const sendOTP = async (e) => {
    e.preventDefault();

    console.log("Phone number:", phone);
    if (!validatePhoneNumber(phone)) {
      setMessage("Số điện thoại không hợp lệ.");
      return;
    }

    console.log("Sending OTP to:", phone);

    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phone,
        appVerifier
      );
      setConfirmation(confirmationResult);
      setMessage("Mã OTP đã được gửi.");
    } catch (err) {
      console.error(err); // Log chi tiết lỗi
      setMessage("Lỗi gửi OTP: " + err.message);
    }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    try {
      await confirmation.confirm(otp);
      setMessage("Xác thực thành công!");
    } catch (err) {
      setMessage("Sai mã OTP.");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Đăng nhập bằng số điện thoại</h2>

      {/* Form gửi OTP */}
      <form onSubmit={sendOTP} className="mb-4">
        <input
          type="tel"
          placeholder="+84xxxxxxxxx"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        />
        <div id="recaptcha-container"></div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded w-full">
          Gửi mã OTP
        </button>
      </form>

      {/* Form xác minh OTP
      {confirmation && (
        <form onSubmit={verifyOTP}>
          <input
            type="text"
            placeholder="Nhập mã OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="border p-2 rounded w-full mb-2"
          />
          <button className="bg-green-500 text-white px-4 py-2 rounded w-full">
            Xác minh OTP
          </button>
        </form>
      )} */}

      {message && <p className="mt-4 text-center text-red-500">{message}</p>}
    </div>
  );
};

export default PhoneLogin;
