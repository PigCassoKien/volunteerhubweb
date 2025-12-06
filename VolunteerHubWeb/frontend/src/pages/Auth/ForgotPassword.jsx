import { useState } from "react";
import axios from "../../api/axios";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSendOtp = async () => {
    if (!email) return alert("Vui lòng nhập email");

    try {
      await axios.post("/otp/generate", { email, type: "RESET_PASSWORD" });
      alert("Mã OTP đã được gửi!");
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.message || "Gửi OTP thất bại");
    }
  };

  const handleResetPassword = async () => {
    if (otp.length !== 6) return alert("OTP chưa hợp lệ");

    if (newPassword !== confirmPassword)
      return alert("Mật khẩu không trùng khớp");

    try {
      await axios.post("/users/reset-password", { email, code: otp, newPassword });
      alert("Mật khẩu đã được đổi thành công!");
      window.location.href = "/login";
    } catch (err) {
      alert(err.response?.data?.message || "Đặt lại mật khẩu thất bại");
    }
  };

  return (
    <div className="flex items-center justify-center p-6">
      <div className="bg-white shadow-lg p-6 rounded-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4 text-green-700">
          Quên mật khẩu
        </h2>

        {step === 1 && (
          <div className="grid gap-3">
            <label>Email đăng ký</label>
            <input
              type="email"
              className="border p-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={handleSendOtp}
              className="bg-green-600 text-white py-2 rounded"
            >
              Gửi mã OTP
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-3">
            <label>Mã OTP</label>
            <input
              type="text"
              maxLength={6}
              className="border p-2 rounded"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />

            <label>Mật khẩu mới</label>
            <input
              type="password"
              className="border p-2 rounded"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <label>Nhập lại mật khẩu</label>
            <input
              type="password"
              className="border p-2 rounded"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
              onClick={handleResetPassword}
              className="bg-green-600 text-white py-2 rounded"
            >
              Đặt lại mật khẩu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
