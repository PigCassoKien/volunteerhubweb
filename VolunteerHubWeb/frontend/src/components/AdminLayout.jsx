import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiUsers } from "react-icons/fi";
import { FaChartBar } from "react-icons/fa";
import { FaRegFileAlt } from "react-icons/fa";
import { MdEventAvailable } from "react-icons/md";

export default function AdminLayout({ title = "Admin", children }) {
  const location = useLocation();

  const nav = [
    { label: "Tổng quan", icon: <FaChartBar />, path: "/admin/dashboard" },
    { label: "Sự kiện", icon: <MdEventAvailable />, path: "/admin/events" },
    { label: "Người dùng", icon: <FiUsers />, path: "/admin/users" },
    { label: "Xuất dữ liệu", icon: <FaRegFileAlt />, path: "/admin/export" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        <aside className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-6 cursor-pointer"
            onClick={() => navigate("/")}>
            <i className="fa-solid fa-hand-holding-heart text-green-600 text-3xl"></i>
            <h1 className="text-xl font-bold text-green-700">
              Volunteer<span className="text-green-500">Hub</span>
            </h1>
          </div>
          <nav className="flex flex-col gap-1 text-gray-700">
            {nav.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={
                  "flex items-center gap-3 p-2 rounded-lg hover:bg-green-50 hover:text-green-600 transition " +
                  (location.pathname === item.path
                    ? "bg-emerald-50 text-emerald-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50")
                }
              >
                <span className="text-green-600 text-xl">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            {/* breadcrumb / title area */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs text-gray-500">Admin</div>
                <div className="text-2xl font-semibold text-gray-800">{title}</div>
              </div>
            </div>

            <div className="mt-3">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}