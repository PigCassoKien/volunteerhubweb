import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import ContactModal from "../pages/ContactModal";
import NotificationBell from "../components/NotificationBell";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Load user
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser || storedUser === "undefined" || storedUser === "null") return null;
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem("token");
    return storedToken && storedToken !== "undefined" ? storedToken : null;
  });

  const updateAuthState = () => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (!storedUser || storedUser === "undefined" || storedUser === "null") {
        setUser(null);
      } else {
        setUser(JSON.parse(storedUser));
      }

      setToken(storedToken && storedToken !== "undefined" ? storedToken : null);
    } catch {
      setUser(null);
      setToken(null);
    }
  };

  // Lắng nghe sự kiện auth thay đổi
  useEffect(() => {
    window.addEventListener("auth-changed", updateAuthState);
    return () => window.removeEventListener("auth-changed", updateAuthState);
  }, []);

  // Update theo route
  useEffect(() => {
    updateAuthState();
  }, [location.pathname]);

  // Dropdown user
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/login");
  };

  // Modal liên hệ
  const [openContact, setOpenContact] = useState(false);

  const menuItems = [
    { label: "Trang chủ", path: "/", icon: "fa-solid fa-house" },
    { label: "Sự kiện", path: "/events", icon: "fa-solid fa-calendar-check" },
    { label: "Cộng đồng", path: "/community", icon: "fa-solid fa-people-group" },
    { label: "Về chúng tôi", path: "/about", icon: "fa-solid fa-circle-info" },
    {
      label: "Liên hệ",
      action: () => setOpenContact(true),
      icon: "fa-solid fa-phone",
    },
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
            <li key={item.label}>
              {item.path ? (
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
              ) : (
                <button
                  onClick={item.action}
                  className="flex items-center gap-2 hover:text-green-600 transition"
                >
                  <i className={`${item.icon} text-green-500`}></i>
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>

        {/* USER AUTH + NOTIFICATION */}
        {token && user ? (
          <div className="flex items-center gap-4">

            {/* 🔔 NotificationBell */}
            <NotificationBell />

            {/* Avatar + dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition"
              >
                <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xl">
                  <i className="fa-solid fa-user"></i>
                </div>

                <div className="hidden md:block text-left">
                  <p className="font-semibold text-gray-800">{user.fullName}</p>
                  <p className="text-xs text-green-600">Tình nguyện viên</p>
                </div>

                <i className="fa-solid fa-chevron-down text-gray-500"></i>
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border p-4 z-50">
                  <div className="pb-3 border-b">
                    <p className="font-semibold">{user.fullName}</p>
                    <p className="text-sm text-green-600">Tình nguyện viên</p>
                  </div>

                  <ul className="mt-3 space-y-3 text-gray-700">
                    <li>
                      <Link to="/profile" className="flex items-center gap-2 hover:text-green-600">
                        <i className="fa-solid fa-user text-green-600"></i> Hồ sơ cá nhân
                      </Link>
                    </li>
                    <li>
                      <Link to="/saved-events" className="flex items-center gap-2 hover:text-green-600">
                        <i className="fa-solid fa-bookmark text-green-600"></i> Sự kiện đã lưu
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-red-600 font-medium w-full hover:text-red-700"
                      >
                        <i className="fa-solid fa-right-from-bracket"></i> Đăng xuất
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : (
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

        {/* Mobile menu button */}
        <div className="lg:hidden block">
          <button className="text-green-700 text-2xl">
            <i className="fa-solid fa-bars"></i>
          </button>
        </div>
      </nav>

      {/* Modal Liên hệ */}
      <ContactModal open={openContact} onClose={() => setOpenContact(false)} />
    </header>
  );
}

export default Navbar;
