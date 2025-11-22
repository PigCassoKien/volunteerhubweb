import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiMail, FiLock } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa6";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text(); // Đọc thân phản hồi dưới dạng text trước

      let data;
      try {
        data = JSON.parse(text); // Cố gắng parse JSON
      } catch (parseErr) {
        throw new Error(text || "Server trả về dữ liệu không hợp lệ");
      }

      if (!res.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      // Lưu token
      localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

      alert("Đăng nhập thành công! Chào mừng trở lại ❤️");

      setTimeout(() => navigate("/"), 300);
    } catch (err) {
      alert(err.message || "Email hoặc mật khẩu không đúng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-50 py-10">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-green-700 mb-6">
          Đăng nhập vào VolunteerHub
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-base text-gray-600 mb-1">Email</label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <FiMail className="text-gray-400 mr-2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email"
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
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                required
                className="w-full outline-none"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-4">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-green-600 hover:underline font-medium">
            Đăng ký ngay
          </Link>
        </p>

        {/* Phần hoặc đăng nhập với */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-3 text-gray-500 text-sm">hoặc đăng nhập với</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="flex justify-center gap-4">
          <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-8 py-2 hover:bg-gray-50 transition">
            <FcGoogle className="text-2xl" />
            <span className="text-sm font-medium text-gray-600">Google</span>
          </button>
          <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-8 py-2 hover:bg-gray-50 transition">
            <FaFacebook className="text-2xl text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Facebook</span>
          </button>
        </div>
      </div>
    </div>
  );
}