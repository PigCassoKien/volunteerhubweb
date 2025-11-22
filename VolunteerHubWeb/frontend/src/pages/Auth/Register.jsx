import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiUser, FiMail, FiLock } from "react-icons/fi";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (formData.password.length < 8) {
      alert("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          phoneNumber: "",
          address: "",
          role: "VOLUNTEER",
        }),
      });

      const text = await res.text(); // Đọc thân phản hồi một lần dưới dạng văn bản

      let data;
      try {
        data = JSON.parse(text); // Cố gắng phân tích thành JSON
      } catch (parseErr) {
        throw new Error(text || "Server trả về dữ liệu không hợp lệ");
      }

      if (!res.ok) {
        throw new Error(data.message || "Đăng ký thất bại");
      }

      alert("Đăng ký thành công! Mã OTP đã được gửi đến email của bạn 📩");
      setShowOtpModal(true);
    } catch (err) {
      alert(err.message || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  // Xác thực OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      alert("Vui lòng nhập đủ 6 chữ số");
      return;
    }

    try {
      const res = await fetch("/api/otp/verify", {  
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          code: otp,
          type: "REGISTER"
        }),
      });

      // Đọc text trước để kiểm tra (body chỉ đọc 1 lần)
      const text = await res.text();

      if (!res.ok) {
        let errorData = {};
        try {
          errorData = JSON.parse(text);
        } catch {
          throw new Error(text || "Lỗi server không xác định");
        }
        throw new Error(errorData.message || "Mã OTP không đúng");
      }

      // Nếu text không rỗng, parse JSON; nếu rỗng, coi như thành công (không token)
      let data = {};
      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch {
          // Nếu parse thất bại nhưng res.ok, bỏ qua
        }
      }

      // Nếu có token, lưu
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      alert("Xác thực thành công! Chào mừng bạn đến với VolunteerHub 🎉");
      setTimeout(() => navigate("/"), 500);
    } catch (err) {
      alert(err.message || "Mã OTP sai hoặc đã hết hạn");
    }
  };

  return (
    <>
      {/* Form đăng ký */}
      <div className="flex items-center justify-center py-10 bg-gray-50">
        <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-green-700 mb-6">
            Tạo tài khoản VolunteerHub
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-base text-gray-600 mb-1">Họ và tên</label>
              <div className="flex items-center border rounded-lg px-3 py-2">
                <FiUser className="text-gray-400 mr-2" />
                <input
                  name="name"
                  type="text"
                  placeholder="Nhập họ tên"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full outline-none"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-base text-gray-600 mb-1">Email</label>
              <div className="flex items-center border rounded-lg px-3 py-2">
                <FiMail className="text-gray-400 mr-2" />
                <input
                  name="email"
                  type="email"
                  placeholder="Nhập email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full outline-none"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-base text-gray-600 mb-1">Mật khẩu</label>
              <div className="flex items-center border rounded-lg px-3 py-2">
                <FiLock className="text-gray-400 mr-2" />
                <input
                  name="password"
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full outline-none"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-base text-gray-600 mb-1">Xác nhận mật khẩu</label>
              <div className="flex items-center border rounded-lg px-3 py-2">
                <FiLock className="text-gray-400 mr-2" />
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full outline-none"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-70"
            >
              {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
            </button>

            <p className="text-sm text-center text-gray-600 mt-3">
              Đã có tài khoản?{" "}
              <Link to="/login" className="text-green-600 hover:underline">
                Đăng nhập ngay
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Modal OTP*/}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-center text-green-700 mb-4">
              Nhập mã OTP
            </h3>
            <p className="text-center text-gray-600 mb-8 text-sm">
              Mã đã được gửi đến email:
              <br />
              <strong>{formData.email}</strong>
            </p>

            <form onSubmit={handleVerifyOtp}>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full text-center text-4xl font-bold tracking-widest py-4 border-2 border-gray-300 rounded-xl focus:border-green-600 outline-none mb-6"
                autoFocus
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowOtpModal(false);
                    setOtp("");
                  }}
                  className="flex-1 border border-gray-400 py-2.5 rounded-lg font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py- py-2.5 rounded-lg font-medium hover:bg-green-700 transition"
                >
                  Xác nhận
                </button>
              </div>
            </form>

            <p className="text-center text-xs text-gray-500 mt-5">
              Không nhận được mã?{" "}
              <button className="text-green-600 font-bold hover:underline">
                Gửi lại
              </button>
            </p>
          </div>
        </div>
      )}
    </>
  );
}