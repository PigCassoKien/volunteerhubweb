import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-2xl text-center bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1>
        <p className="text-xl text-gray-600 mb-4">Không tìm thấy trang bạn yêu cầu.</p>
        <p className="text-sm text-gray-500 mb-6">Bạn không có quyền truy cập hoặc đường dẫn không tồn tại.</p>
        <div className="flex justify-center gap-3">
          <Link to="/" className="px-4 py-2 bg-emerald-600 text-white rounded">Trang chủ</Link>
          <Link to="/events" className="px-4 py-2 border rounded">Danh sách sự kiện</Link>
        </div>
      </div>
    </div>
  );
}