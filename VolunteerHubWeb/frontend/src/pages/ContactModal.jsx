import React from "react";

export default function ContactModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999]">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl animate-fadeIn p-6 relative">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <i className="fa-solid fa-xmark text-2xl"></i>
        </button>

        <h2 className="text-2xl font-bold text-green-700 mb-1">
          Liên hệ với chúng tôi
        </h2>
        <p className="text-gray-500 mb-4">
          Chúng tôi sẽ phản hồi trong vòng 24 giờ
        </p>

        {/* Contact Info */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 border rounded-lg flex items-center gap-3">
            <i className="fa-solid fa-phone text-green-600 text-xl"></i>
            <div>
              <p className="font-semibold">Điện thoại</p>
              <p>1900 1234</p>
            </div>
          </div>

          <div className="p-4 border rounded-lg flex items-center gap-3">
            <i className="fa-solid fa-envelope text-green-600 text-xl"></i>
            <div>
              <p className="font-semibold">Email</p>
              <p>contact@volunteer.vn</p>
            </div>
          </div>

          <div className="p-4 border rounded-lg flex items-center gap-3">
            <i className="fa-solid fa-location-dot text-green-600 text-xl"></i>
            <div>
              <p className="font-semibold">Địa chỉ</p>
              <p>Hà Nội, Việt Nam</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Họ và tên *"
              className="border p-3 rounded-lg w-full"
            />
            <input
              type="email"
              placeholder="Email *"
              className="border p-3 rounded-lg w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Số điện thoại"
              className="border p-3 rounded-lg w-full"
            />
            <select className="border p-3 rounded-lg w-full">
              <option>Chọn chủ đề</option>
              <option>Hỗ trợ</option>
              <option>Hợp tác</option>
              <option>Đóng góp</option>
            </select>
          </div>

          <textarea
            placeholder="Nội dung tin nhắn *"
            className="border p-3 rounded-lg w-full h-32"
          ></textarea>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              Hủy
            </button>

            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <i className="fa-solid fa-paper-plane"></i>
              Gửi tin nhắn
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
