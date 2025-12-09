import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function AdminLayout({ title = "Admin", children }) {
  const location = useLocation();

  const nav = [
    { label: "Tổng quan", to: "/admin" },
    { label: "Sự kiện", to: "/admin/events" },
    { label: "Người dùng", to: "/admin/users" },
    { label: "Xuất dữ liệu", to: "/admin/export" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-emerald-600 font-bold text-lg">Volunteer Hub</Link>
            <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
          </div>
          <div className="text-sm text-gray-600">Khu quản trị</div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1 bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm text-gray-500 font-medium mb-3">Admin Menu</div>
          <nav className="flex flex-col gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm " +
                  (location.pathname === n.to
                    ? "bg-emerald-50 text-emerald-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50")
                }
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="md:col-span-3">
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