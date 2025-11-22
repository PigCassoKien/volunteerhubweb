import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

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
                className={`flex items-center gap-2 hover:text-green-600 transition ${
                  location.pathname === item.path
                    ? "text-green-600 border-b-2 border-green-600 pb-1"
                    : ""
                }`}
              >
                <i className={`fa-solid ${item.icon} relative top-[2px] text-green-500`}></i>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Nút đăng nhập / đăng ký */}
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

        {/* Nút mobile menu */}
        <div className="lg:hidden">
          <button className="text-green-700 text-2xl">
            <i className="fa-solid fa-bars"></i>
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
