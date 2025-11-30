import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin } from "react-icons/fi";

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  // Scroll lên đầu khi vào trang
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
          fullName: formData.fullName.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          phoneNumber: formData.phoneNumber.trim(),
          address: formData.address.trim(),
          role: "VOLUNTEER",
        }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
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
          type: "REGISTER",
        }),
      });

      const text = await res.text();
      if (!res.ok) {
        let errorData = {};
        try {
          errorData = JSON.parse(text);
        } catch { }
        throw new Error(errorData.message || "Mã OTP không đúng");
      }

      let data = {};
      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch { }
      }

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
      <div className="flex items-center justify-center bg-gray-50 py-10 px-2">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md grid gap-3"
        >
          <h2 className="text-2xl font-bold text-center text-green-700 mb-2">
            Tạo tài khoản VolunteerHub
          </h2>

          {/* Họ tên + SĐT*/}
          <div className="flex gap-3">
            <InputField
              icon={<FiUser />}
              label="Họ và tên"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
              className="flex-1"
            />
            <InputField
              icon={<FiPhone />}
              label="Số điện thoại"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
              className="flex-1"
            />
          </div>

          <InputField icon={<FiMail />} label="Email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Nhập email" />
          <InputField icon={<FiMapPin />} label="Địa chỉ" name="address" value={formData.address} onChange={handleChange} placeholder="Nhập địa chỉ" />
          <InputField icon={<FiLock />} label="Mật khẩu" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Nhập mật khẩu" />
          <InputField icon={<FiLock />} label="Xác nhận mật khẩu" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Nhập lại mật khẩu" />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-70"
          >
            {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
          </button>

          <p className="text-sm text-center text-gray-600 mt-2">
            Đã có tài khoản?{" "}
            <Link to="/login" className="text-green-600 hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        </form>
      </div>

      {/* Modal OTP */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-center text-green-700 mb-4">
              Nhập mã OTP
            </h3>
            <p className="text-center text-gray-600 mb-8 text-sm">
              Mã đã được gửi đến email: <br />
              <strong>{formData.email}</strong>
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full text-center text-4xl font-bold tracking-widest py-4 border-2 border-gray-300 rounded-xl focus:border-green-600 outline-none"
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
                  className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition"
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

// Component reusable cho Input
function InputField({ icon, label, className = "", ...props }) {
  return (
    <div className={`flex-1 ${className}`}>
      <label className="block text-gray-600 text-sm mb-1">{label}</label>
      <div className="flex items-center border rounded-lg px-3 py-2">
        {icon}
        <input {...props} className="w-full outline-none ml-2" />
      </div>
    </div>
  );
}
