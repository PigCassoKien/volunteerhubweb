import { useState } from "react";
import axios from "../../api/axios";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSendOtp = async () => {
    if (!email) return setMsg("Vui lòng nhập email");

    try {
      await axios.post("/otp/generate", { email, type: "RESET_PASSWORD" });
      setMsg("Mã OTP đã được gửi!");
      setStep(2);
    } catch (err) {
      const m = err.response?.data?.message || err.response?.data?.error || "Gửi OTP thất bại";
      setMsg(m);
    }
  };

  const handleResetPassword = async () => {
    if (otp.length !== 6) return setMsg("OTP chưa hợp lệ");

    if (newPassword !== confirmPassword) return setMsg("Mật khẩu không trùng khớp");

    try {
      await axios.post("/users/reset-password", { email, code: otp, newPassword });
      setMsg("Mật khẩu đã được đổi thành công!");
      window.location.href = "/login";
    } catch (err) {
      const m = err.response?.data?.message || err.response?.data?.error || "Đặt lại mật khẩu thất bại";
      setMsg(m);
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
            {msg && <div className="text-sm text-red-600">{msg}</div>}
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
            <div className="flex items-center gap-2">
              <input
                type={showNew ? "text" : "password"}
                className="border p-2 rounded flex-1"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowNew(s => !s)} className="text-gray-500">
                {showNew ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <label>Nhập lại mật khẩu</label>
            <div className="flex items-center gap-2">
              <input
                type={showConfirm ? "text" : "password"}
                className="border p-2 rounded flex-1"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowConfirm(s => !s)} className="text-gray-500">
                {showConfirm ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <button
              onClick={handleResetPassword}
              className="bg-green-600 text-white py-2 rounded"
            >
              Đặt lại mật khẩu
            </button>
            {msg && <div className="text-sm text-red-600">{msg}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
