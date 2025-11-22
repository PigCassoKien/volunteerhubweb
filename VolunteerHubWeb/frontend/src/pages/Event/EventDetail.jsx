import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { FiMapPin, FiCalendar, FiUsers, FiArrowLeft } from "react-icons/fi";

const EventDetail = () => {
  const { id } = useParams(); // lấy id từ URL
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`/api/events/${id}`);
        setEvent(res.data);
      } catch (err) {
        console.error("Lỗi tải chi tiết sự kiện:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Đang tải dữ liệu...</div>;
  }

  if (!event) {
    return <div className="text-center py-20 text-red-500">Không tìm thấy sự kiện.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Banner */}
      <div className="relative h-[320px] bg-cover bg-center" style={{ backgroundImage: `url(${event.imageFile || '/images/default-event.jpg'})` }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute bottom-8 left-8 text-white z-10">
          <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
          <p className="text-gray-200 text-lg">{event.category?.name || "Khác"}</p>
        </div>
      </div>

      {/* Nội dung chi tiết */}
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg -mt-12 p-8 relative z-20">
        <Link
          to="/events"
          className="inline-flex items-center text-emerald-600 mb-4 hover:underline"
        >
          <FiArrowLeft className="mr-2" /> Quay lại danh sách
        </Link>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Chi tiết sự kiện</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Thông tin chính */}
          <div className="lg:col-span-2">
            <p className="text-gray-700 leading-relaxed mb-6">
              {event.description || "Sự kiện này chưa có mô tả chi tiết."}
            </p>

            <div className="flex flex-col gap-3 text-gray-600">
              <p className="flex items-center gap-2">
                <FiCalendar className="text-emerald-600" />
                <span>
                  {new Date(event.startDate).toLocaleString("vi-VN")} -{" "}
                  {new Date(event.endDate).toLocaleString("vi-VN")}
                </span>
              </p>

              <p className="flex items-center gap-2">
                <FiMapPin className="text-emerald-600" />
                <span>{event.location}</span>
              </p>

              <p className="flex items-center gap-2">
                <FiUsers className="text-emerald-600" />
                <span>
                  Tối đa {event.maxParticipants || 50} người tham gia
                </span>
              </p>

              <p className="text-gray-700">
                <strong>Trạng thái:</strong> {event.status || "Chưa cập nhật"}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="bg-emerald-50 p-5 rounded-xl">
            <p className="text-gray-700 mb-2">
              <strong>Người tạo:</strong> {event.createdById || "Tình nguyện viên"}
            </p>

            <button className="w-full bg-emerald-600 text-white py-3 rounded-lg mt-4 hover:bg-emerald-700 transition">
              Đăng ký tham gia
            </button>
            <button className="w-full border border-emerald-600 text-emerald-600 py-3 rounded-lg mt-3 hover:bg-emerald-50 transition">
              ❤️ Thêm vào yêu thích
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
