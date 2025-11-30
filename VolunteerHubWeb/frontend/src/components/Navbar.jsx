import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // Dropdown state
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Click outside để đóng menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    { label: "Trang chủ", path: "/", icon: "fa-solid fa-house" },
    { label: "Sự kiện", path: "/events", icon: "fa-solid fa-calendar-check" },
    { label: "Cộng đồng", path: "/community", icon: "fa-solid fa-people-group" },
    { label: "Về chúng tôi", path: "/about", icon: "fa-solid fa-circle-info" },
    { label: "Liên hệ", path: "/contact", icon: "fa-solid fa-phone" },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto flex justify-between items-center px-4 py-4">

        {/* Logo */}
        <div className="flex items-center space-x-3">
          <i className="fa-solid fa-hand-holding-heart text-green-600 text-4xl"></i>
          <div>
            <h1 className="font-extrabold text-green-700 text-2xl leading-tight">
              Volunteer<span className="text-green-500">Hub</span>
            </h1>
            <p className="text-bold text-gray-500 -mt-1">Kết nối yêu thương</p>
          </div>
        </div>

        {/* Menu */}
        <ul className="hidden lg:flex items-center space-x-8 text-gray-700 font-medium">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-2 hover:text-green-600 transition ${location.pathname === item.path
                    ? "text-green-600 border-b-2 border-green-600 pb-1"
                    : ""
                  }`}
              >
                <i className={`${item.icon} text-green-500`}></i>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Nếu đã đăng nhập → hiển thị avatar + dropdown */}
        {token && user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition"
            >
              <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xl">
                <i className="fa-solid fa-user"></i>
              </div>

              <div className="hidden md:block text-left">
                <p className="font-semibold text-gray-800">{user.name}</p>
                <p className="text-sm text-green-600">Tình nguyện viên</p>
              </div>

              <i className="fa-solid fa-chevron-down text-gray-500"></i>
            </button>

            {/* Dropdown */}
            {open && (
              <div className="absolute right-0 mt-2 w-60 bg-white shadow-lg rounded-xl p-4 border animate-fadeIn">
                <div className="pb-3 border-b">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-green-600">Tình nguyện viên</p>
                </div>

                <ul className="mt-3 space-y-3 text-gray-700">
                  <li>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 hover:text-green-600 transition"
                    >
                      <i className="fa-solid fa-user"></i> Hồ sơ cá nhân
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/saved-events"
                      className="flex items-center gap-2 hover:text-green-600 transition"
                    >
                      <i className="fa-solid fa-bookmark"></i> Sự kiện đã lưu
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/settings"
                      className="flex items-center gap-2 hover:text-green-600 transition"
                    >
                      <i className="fa-solid fa-gear"></i> Cài đặt
                    </Link>
                  </li>

                  <li>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-red-600 font-medium w-full hover:text-red-700 transition"
                    >
                      <i className="fa-solid fa-right-from-bracket"></i> Đăng xuất
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          /* Nút đăng nhập / đăng ký */
          <div className="hidden md:flex items-center space-x-3">
            <Link
              to="/login"
              className="border border-green-500 text-green-600 font-medium px-4 py-2 rounded-lg hover:bg-green-50 transition duration-200 flex items-center gap-2"
            >
              <i className="fa-solid fa-arrow-right-to-bracket"></i> Đăng nhập
            </Link>
            <Link
              to="/register"
              className="bg-green-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 flex items-center gap-2"
            >
              <i className="fa-solid fa-user-plus"></i> Đăng ký
            </Link>
          </div>
        )}

        {/* Mobile */}
        <div className="lg:hidden block">
          <button className="text-green-700 text-2xl">
            <i className="fa-solid fa-bars"></i>
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
