import { FiCalendar, FiUsers, FiBookmark, FiMapPin } from "react-icons/fi";

export default function StatsSection() {
  return (
    <div className="max-w-7xl mx-auto bg-emerald-50 rounded-3xl py-10 my-16 shadow-sm px-6">
      <h2 className="text-center text-2xl font-bold text-gray-800 mb-2">
        Thống kê hoạt động
      </h2>
      <p className="text-center text-gray-500 mb-8">
        Cùng nhau tạo ra những tác động tích cực
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
        <div className="bg-emerald-100 rounded-xl py-6">
          <FiCalendar className="text-emerald-600 text-3xl mx-auto mb-2" />
          <p className="text-2xl font-semibold text-gray-800">6</p>
          <p className="text-sm text-gray-500">Sự kiện</p>
        </div>
        <div className="bg-blue-100 rounded-xl py-6">
          <FiUsers className="text-blue-600 text-3xl mx-auto mb-2" />
          <p className="text-2xl font-semibold text-gray-800">392</p>
          <p className="text-sm text-gray-500">Người tham gia</p>
        </div>
        <div className="bg-purple-100 rounded-xl py-6">
          <FiBookmark className="text-purple-600 text-3xl mx-auto mb-2" />
          <p className="text-2xl font-semibold text-gray-800">5</p>
          <p className="text-sm text-gray-500">Lĩnh vực</p>
        </div>
        <div className="bg-orange-100 rounded-xl py-6">
          <FiMapPin className="text-orange-600 text-3xl mx-auto mb-2" />
          <p className="text-2xl font-semibold text-gray-800">5</p>
          <p className="text-sm text-gray-500">Thành phố</p>
        </div>
      </div>
    </div>
  );
}
