import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { FiMapPin, FiCalendar, FiUsers, FiArrowLeft, FiClock } from "react-icons/fi";
import { FaStar } from "react-icons/fa";

const EventDetail = () => {
  const { id } = useParams(); // lấy id từ URL
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0 });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`/api/events/get/${id}`);
        setEvent(res.data);
      } catch (err) {
        console.error("Lỗi tải chi tiết sự kiện:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (event) {
      const calculateTimeLeft = () => {
        const difference = new Date(event.startDate) - new Date();
        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          setTimeLeft({ days, hours });
        } else {
          setTimeLeft({ days: 0, hours: 0 });
        }
      };
      calculateTimeLeft();
      const interval = setInterval(calculateTimeLeft, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [event]);

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Đang tải dữ liệu...</div>;
  }

  if (!event) {
    return <div className="text-center py-20 text-red-500">Không tìm thấy sự kiện.</div>;
  }

  // Giả sử event có registered và rating; nếu không, có thể fetch thêm hoặc dummy
  const registered = event.registered || 42;
  const rating = event.rating || 5.0;
  const remaining = (event.maxParticipants || 50) - registered;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Banner */}
      <div className="relative h-[320px] bg-cover bg-center" style={{ backgroundImage: `url(${event.imageFile || '/images/default-event.jpg'})` }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute top-6 left-0 right-0 z-20">
          <div className="max-w-7xl mx-auto px-4 text-white text-sm flex gap-2">
            <Link to="/events" className="hover:underline">Sự kiện</Link>
            <span>/</span>
            <span className="text-gray-300">{event.title}</span>
          </div>
        </div>

        <div className="absolute bottom-8 left-8 text-white z-10">
          <h1 className="text-4xl font-bold mb-2 text-orange-500">{event.title}</h1> {/* Màu cam cho tiêu đề */}
          <p className="text-gray-200 text-lg">{event.category?.name || "Khác"}</p>
        </div>
      </div>

      {/* Bubble tham gia */}
      <div className="relative -mt-12 max-w-5xl mx-auto z-20">
        <div className="absolute left-8 bg-white rounded-lg shadow-md p-4 flex items-center gap-2">
          <span className="text-green-500">❤️</span>
          <div>
            <p className="font-semibold">Tham gia ngay hôm nay.</p>
            <p className="text-sm text-gray-500">Còn {remaining} suất tham gia hôm nay.</p>
          </div>
        </div>
        <div className="absolute right-8 bg-green-500 text-white rounded-full px-4 py-2">
          Đang diễn ra
        </div>
      </div>

      {/* Nội dung chi tiết */}
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg -mt-12 pt-20 p-8 relative z-20"> {/* Điều chỉnh padding để bubble không chồng */}
        <Link
          to="/events"
          className="inline-flex items-center text-emerald-600 mb-4 hover:underline"
        >
          <FiArrowLeft className="mr-2" /> Quay lại danh sách
        </Link>

        {/* Tab menu */}
        <ul className="flex border-b mb-6">
          <li className="mr-6"><a href="#" className="text-gray-500 hover:text-emerald-600">Tổng quan</a></li>
          <li className="mr-6"><a href="#" className="text-emerald-600 border-b-2 border-emerald-600 pb-2">Chi tiết</a></li>
          <li className="mr-6"><a href="#" className="text-gray-500 hover:text-emerald-600">Hình ảnh</a></li>
          <li className="mr-6"><a href="#" className="text-gray-500 hover:text-emerald-600">Đánh giá</a></li>
          <li className="mr-6"><a href="#" className="text-gray-500 hover:text-emerald-600">Tham gia cùng tôi để thay đổi tích cực</a></li>
        </ul>

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
            <p className="text-gray-600 text-sm mb-4">
              Bằng cách tham gia sự kiện này bạn đang tạo ra sự thay đổi tích cực
            </p>

            <button className="w-full bg-emerald-600 text-white py-3 rounded-lg mt-4 hover:bg-emerald-700 transition">
              Đăng ký tham gia
            </button>
            <button className="w-full border border-emerald-600 text-emerald-600 py-3 rounded-lg mt-3 hover:bg-emerald-50 transition">
              ❤️ Thêm vào yêu thích
            </button>
          </div>
        </div>

        {/* Stats boxes */}
        <div className="grid grid-cols-4 gap-4 mt-8">
          <div className="bg-green-100 rounded-lg p-4 text-center">
            <FiCalendar className="text-green-500 mx-auto mb-2" size={24} />
            <p className="text-2xl font-bold">{timeLeft.days}</p>
            <p className="text-sm text-gray-600">Ngày</p>
          </div>
          <div className="bg-blue-100 rounded-lg p-4 text-center">
            <FiClock className="text-blue-500 mx-auto mb-2" size={24} />
            <p className="text-2xl font-bold">{timeLeft.hours}</p>
            <p className="text-sm text-gray-600">Giờ</p>
          </div>
          <div className="bg-purple-100 rounded-lg p-4 text-center">
            <FiUsers className="text-purple-500 mx-auto mb-2" size={24} />
            <p className="text-2xl font-bold">{registered}</p>
            <p className="text-sm text-gray-600">Dã đang ký</p> {/* Giữ nguyên như ảnh, có lẽ lỗi đánh máy cho "Đã đăng ký" */}
          </div>
          <div className="bg-orange-100 rounded-lg p-4 text-center">
            <FaStar className="text-orange-500 mx-auto mb-2" size={24} />
            <p className="text-2xl font-bold">{rating}</p>
            <p className="text-sm text-gray-600">Đánh giá</p>
          </div>
        </div>

        {/* Nút đăng nhập ngay */}
        <button className="w-full bg-emerald-600 text-white py-3 rounded-lg mt-6 hover:bg-emerald-700 transition">
          Đăng nhập ngay
        </button>
      </div>
    </div>
  );
};

export default EventDetail;