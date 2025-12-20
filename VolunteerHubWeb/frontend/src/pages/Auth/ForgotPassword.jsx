import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-toastify";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const handleSendOtp = async () => {
    if (!email) return setMsg("Vui lòng nhập email");
    setMsg("");
    setSending(true);
    try {
      await axios.post("/otp/generate", { email, type: "RESET_PASSWORD" });
      toast.success("Mã OTP đã được gửi tới email của bạn");
      setStep(2);
      setResendTimer(60);
    } catch (err) {
      const m = err.response?.data?.message || err.response?.data?.error || "Gửi OTP thất bại";
      setMsg(m);
      toast.error(m);
    } finally {
      setSending(false);
    }
  };

  const handleResetPassword = async () => {
    if (otp.length !== 6) return setMsg("OTP chưa hợp lệ");

    if (newPassword !== confirmPassword) return setMsg("Mật khẩu không trùng khớp");

    setMsg("");
    setResetting(true);
    try {
      await axios.post("/users/reset-password", { email, code: otp, newPassword });
      toast.success("Mật khẩu đã được đổi thành công!");
      // small delay for UX
      setTimeout(() => (window.location.href = "/login"), 800);
    } catch (err) {
      const m = err.response?.data?.message || err.response?.data?.error || "Đặt lại mật khẩu thất bại";
      setMsg(m);
      toast.error(m);
    } finally {
      setResetting(false);
    }
  };

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      setSending(true);
      await axios.post("/otp/generate", { email, type: "RESET_PASSWORD" });
      toast.success("OTP đã được gửi lại");
      setResendTimer(60);
    } catch (err) {
      const m = err.response?.data?.message || err.response?.data?.error || "Không thể gửi lại OTP";
      toast.error(m);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-6">
      <div className="bg-white shadow-lg p-6 rounded-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4 text-green-700">Quên mật khẩu</h2>

        {step === 1 && (
          <div className="grid gap-3">
            <label className="text-sm font-medium">Email đăng ký</label>
            <input
              type="email"
              className="border p-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <button
              onClick={handleSendOtp}
              disabled={sending}
              className={`bg-green-600 text-white py-2 rounded ${sending ? 'opacity-70' : 'hover:bg-green-700'}`}
            >
              {sending ? 'Đang gửi...' : 'Gửi mã OTP'}
            </button>
            {msg && <div className="text-sm text-red-600">{msg}</div>}
            <div className="text-xs text-gray-500">Kiểm tra hộp thư đến (hoặc spam). Mã có hiệu lực trong 10 phút.</div>
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
              disabled={resetting}
              className={`bg-green-600 text-white py-2 rounded ${resetting ? 'opacity-70' : 'hover:bg-green-700'}`}
            >
              Đặt lại mật khẩu
            </button>
            {msg && <div className="text-sm text-red-600">{msg}</div>}
            <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
              <div>
                {!resendTimer ? (
                  <button onClick={handleResend} className="underline text-green-600">Gửi lại mã</button>
                ) : (
                  <span>Gửi lại sau {resendTimer}s</span>
                )}
              </div>
              <div>
                <a href="/login" className="text-green-600 hover:underline">Quay lại đăng nhập</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
