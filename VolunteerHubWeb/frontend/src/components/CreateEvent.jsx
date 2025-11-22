import { FiCalendar, FiBell } from "react-icons/fi";

export default function CreateEvent() {
  return (
    <div className="max-w-7xl mx-auto bg-emerald-700 text-white py-12 text-center rounded-3xl mb-0 px-6">
      <h3 className="text-2xl font-semibold mb-3">
        Không tìm thấy sự kiện phù hợp?
      </h3>
      <p className="text-emerald-100 mb-6">
        Hãy tạo sự kiện của riêng bạn và kêu gọi cộng đồng cùng tham gia
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button className="bg-white text-emerald-700 px-5 py-3 rounded-lg font-medium hover:bg-emerald-50 transition flex items-center justify-center gap-2">
          <FiCalendar /> Tạo sự kiện mới
        </button>
        <button className="border border-white px-5 py-3 rounded-lg font-medium hover:bg-white hover:text-emerald-700 transition flex items-center justify-center gap-2">
          <FiBell /> Đăng ký nhận thông báo
        </button>
      </div>
    </div>
  );
}
