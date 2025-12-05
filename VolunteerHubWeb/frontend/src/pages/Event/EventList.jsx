import { FiSearch, FiBookmark, FiCalendar } from "react-icons/fi";
import { useState, useEffect } from "react";
import axios from "axios";
import EventCard from "../../components/EventCard";
import StatsSection from "../../components/StatsSection";
import CreateEvent from "../../components/CreateEvent";

const EventList = () => {
  const [category, setCategory] = useState("Tất cả");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ["Tất cả", "Môi trường", "Từ thiện", "Giáo dục", "Y tế", "Cộng đồng"];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("/api/events/all");
        setEvents(res.data);
      } catch (err) {
        console.error("Lỗi tải danh sách sự kiện:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents =
    category === "Tất cả"
      ? events
      : events.filter((e) => e.category?.name === category);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div
        className="relative h-[280px] bg-cover bg-center flex items-center justify-center text-center"
        style={{ backgroundImage: "url('src\assets\Team planting trees together for a green initiative.jpg')" }}
      >
        <div className="absolute inset-0 bg-emerald-800/50"></div>

        <div className="absolute top-5 left-0 w-full z-20">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="text-white/90 text-sm">
              <ol className="flex items-center space-x-2">
                <li>
                  <a href="/" className="hover:text-white">Trang chủ</a>
                </li>
                <li>/</li>
                <li className="font-semibold text-white">Danh sách sự kiện</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="relative z-10 text-white">
          <h1 className="text-5xl font-bold">Khám phá các sự kiện</h1>
          <p className="mt-3 text-lg">
            Tìm kiếm và tham gia các hoạt động tình nguyện phù hợp với bạn
          </p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="max-w-6xl mx-auto -mt-16 bg-white shadow-xl rounded-xl p-8 relative z-20">
        <div className="flex items-center border border-gray-300 rounded-full px-4 py-3 mb-6">
          <FiSearch className="text-gray-400 text-xl mr-3" />
          <input
            type="text"
            placeholder="Tìm kiếm sự kiện theo tên, mô tả hoặc địa điểm..."
            className="flex-1 outline-none text-gray-700 placeholder-gray-400"
          />
        </div>

        <p className="text-gray-600 mb-4">
          <span className="font-semibold text-gray-800">
            {loading ? "Đang tải..." : `Tìm thấy ${filteredEvents.length} sự kiện`}
          </span>
        </p>

        <div className="mb-6">
          <p className="text-gray-700 font-semibold flex items-center gap-1 mb-3">
            <FiBookmark className="text-emerald-600" /> Lĩnh vực hoạt động
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-1.5 rounded-full text-sm border transition flex items-center gap-1 ${category === c
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-gray-100 text-gray-700 hover:bg-emerald-100 border-gray-300"
                  }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-gray-700 font-semibold flex items-center gap-1">
            <FiCalendar className="text-emerald-600" /> Sắp xếp theo
          </p>
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 transition">
            <option value="date">Ngày diễn ra</option>
            <option value="name">Tên sự kiện</option>
            <option value="participants">Số người tham gia</option>
          </select>
        </div>
      </div>

      {/* Event Cards */}
      <div className="max-w-6xl mx-auto mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {!loading &&
          filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))
        }
      </div>

      <div className="text-center pb-16">
        <button className="px-6 py-3 border border-emerald-600 text-emerald-600 rounded-full hover:bg-emerald-50 transition">
          + Xem thêm sự kiện
        </button>
      </div>

      <StatsSection />
      <CreateEvent />
    </div>
  );
};

export default EventList;
