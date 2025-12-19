import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import axios from "../../api/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post("/auth/login", { email, password });
      // data should be AuthenticationResponse { token, user }
      const token = data?.token;
      const user = data?.user;
      if (!token || !user) throw new Error("Invalid response from server");

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // redirect based on role
      const role = (user.role || "").toUpperCase();
      if (role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (role === "EVENT_MANAGER") {
        navigate("/manager");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login failed", err);
      const m = err.response?.data?.message || err.response?.data?.error || "Đăng nhập thất bại";
      setMsg(m);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-50 py-10 px-2">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md grid gap-4"
      >
        <h2 className="text-2xl font-bold text-center text-green-700 mb-2">
          Đăng nhập vào VolunteerHub
        </h2>

        <InputField
          icon={<FiMail />}
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email"
          disabled={loading}
        />
        <InputField
          icon={<FiLock />}
          label="Mật khẩu"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nhập mật khẩu"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        {msg && <div className="text-center text-sm mt-2 text-red-600">{msg}</div>}

        <p className="text-sm text-center mt-1">
          <Link to="/forgot-password" className="text-green-600 hover:underline">
            Quên mật khẩu?
          </Link>
        </p>

        <p className="text-sm text-center text-gray-600 mt-1">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="text-green-600 hover:underline font-medium"
          >
            Đăng ký ngay
          </Link>
        </p>

        {/* Hoặc đăng nhập với */}
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-3 text-gray-500 text-sm">hoặc đăng nhập với</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="flex justify-center gap-4">
          <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-8 py-2 hover:bg-gray-50 transition">
            <FcGoogle className="text-2xl" />
            <span className="text-sm font-medium text-gray-600">Google</span>
          </button>
          <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-8 py-2 hover:bg-gray-50 transition">
            <FaFacebook className="text-2xl text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Facebook</span>
          </button>
        </div>
      </form>
    </div>
  );
}

function InputField({ icon, label, className = "", ...props }) {
  const [show, setShow] = useState(false);
  const isPassword = props.type === "password";
  const actualType = isPassword ? (show ? "text" : "password") : props.type;

  return (
    <div className={`flex-1 ${className}`}>
      <label className="block text-gray-600 text-sm mb-1">{label}</label>
      <div className="flex items-center border rounded-lg px-3 py-2">
        {icon}
        <input {...props} type={actualType} className="w-full outline-none ml-2" />
        {isPassword && (
          <button type="button" onClick={() => setShow(s => !s)} className="ml-2 text-gray-500">
            {show ? <FiEyeOff /> : <FiEye />}
          </button>
        )}
      </div>
    </div>
  );
}