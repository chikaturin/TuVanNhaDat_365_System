import {
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { auth } from "../firebase"; // Đảm bảo đường dẫn đúng
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const App = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [message, setMessage] = useState("");
  const [hasFilled, setHasFilled] = useState(false); // Biến này để xác định form nào sẽ hiển thị

  // Kiểm tra và thiết lập reCAPTCHA chỉ một lần duy nhất

  const fetchAPI = async () => {
    try {
      const response = await fetch(
        "http://localhost:8888/api/blockAccount/0922514123",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "365nhadat",
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJQaG9uZU51bWJlciI6IjA5MDA5MDA5MDAiLCJFbWFpbCI6ImFkbWluQGdtYWlsLmNvbSIsIkZpcnN0TmFtZSI6ImFkbWluIiwiTGFzdE5hbWUiOiJhZG1pbiIsImlhdCI6MTc0NTU1NjcxNCwiZXhwIjoxNzQ1NjQzMTE0fQ.G06pB_RSM4NOBXsOPow1TL35ulLJb5DwbmeY46FjDbU`,
          },
        }
      );
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error fetching API:", error);
    }
  };
  useEffect(() => {
    fetchAPI();
  }, []);

  useEffect(() => {
    console.log("Checking for reCAPTCHA setup");

    // Kiểm tra auth có đúng không
    if (!auth) {
      console.error("Firebase auth is not properly initialized.");
      return;
    }

    if (!window.recaptchaVerifier) {
      console.log("Setting up reCAPTCHA", auth);

      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {}
      );

      // Render reCAPTCHA và thêm log khi hoàn tất
      window.recaptchaVerifier
        .render()
        .then(function () {
          console.log("reCAPTCHA đã được render.");
        })
        .catch((err) => {
          console.error("Lỗi khi render reCAPTCHA:", err);
        });
    }
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
      setHasFilled(true); // Chuyển sang form nhập OTP
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
      alert("Xác thực thành công!");
    } catch (err) {
      setMessage("Sai mã OTP.");
    }
  };

  return (
    <div className="app__container">
      {hasFilled ? (
        <Card sx={{ width: "300px" }}>
          <CardContent
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <Typography sx={{ padding: "20px" }} variant="h5" component="div">
              Nhập mã OTP
            </Typography>
            <form onSubmit={verifyOTP}>
              <TextField
                sx={{ width: "240px" }}
                variant="outlined"
                label="Mã OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{ width: "240px", marginTop: "20px" }}
              >
                Xác minh OTP
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ width: "300px" }}>
          <CardContent
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <Typography sx={{ padding: "20px" }} variant="h5" component="div">
              Nhập số điện thoại của bạn
            </Typography>
            <form onSubmit={sendOTP}>
              <TextField
                sx={{ width: "240px" }}
                variant="outlined"
                autoComplete="off"
                label="Số điện thoại"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{ width: "240px", marginTop: "20px" }}
              >
                Gửi mã OTP
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default App;
