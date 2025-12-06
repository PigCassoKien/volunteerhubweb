import { FiSearch, FiBookmark, FiCalendar, FiX, FiFilter } from "react-icons/fi";
import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import EventCard from "../../components/EventCard";
import StatsSection from "../../components/StatsSection";
import CreateEvent from "../../components/CreateEvent";

export default function EventList() {
  const [category, setCategory] = useState("Tất cả");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myStatusByEvent, setMyStatusByEvent] = useState({}); // add
  const [categories, setCategories] = useState(["Tất cả"]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("/events/all");
        const data = Array.isArray(res.data) ? res.data : [];
        // CHANGED: chỉ hiển thị sự kiện đã APPROVED
        setEvents(data.filter((e) => e.status === "APPROVED"));
      } catch (err) {
        console.error("Lỗi tải danh sách sự kiện:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const loadMyStatuses = async () => {
      try {
        // lấy toàn bộ lịch sử để map theo eventId
        const res = await axios.post("/registrations/history", {
          startDate: "2000-01-01T00:00:00",
          endDate: "2100-01-01T00:00:00",
          status: null,
        });
        // map: eventId -> status mới nhất (ưu tiên không CANCELED)
        const byEvent = {};
        res.data.forEach((r) => {
          const evId = r.eventId;
          const curr = byEvent[evId];
          // chọn theo thứ tự ưu tiên
          const priority = { APPROVED: 3, PENDING: 2, COMPLETED: 1, CANCELED: 0, REJECTED: 0 };
          if (!curr || priority[r.status] > priority[curr]) {
            byEvent[evId] = r.status;
          }
        });
        setMyStatusByEvent(byEvent);
      } catch (e) {
        console.log("Lỗi tải trạng thái đăng ký của tôi", e);
      }
    };

    loadMyStatuses();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/categories/all");
        const cats = Array.isArray(res.data) ? res.data : [];
        setCategories(["Tất cả", ...cats.map((c) => c.name)]);
      } catch (err) {
        console.error("Lỗi tải categories:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get("/events/all");
        // filter out pending events on client
        const publicEvents = (Array.isArray(data) ? data : []).filter(e => String(e.status || "").toUpperCase() === "APPROVED");

        // try favorites
        let favIds = new Set();
        try {
          const fav = await axios.get("/favorites/my");
          favIds = new Set((fav.data || []).map(e => String(e.id)));
          setFavoriteIds(favIds);
        } catch (_) {}

        const sorted = publicEvents.sort((a,b) => {
          const fa = favIds.has(String(a.id)) ? 0 : 1;
          const fb = favIds.has(String(b.id)) ? 0 : 1;
          return fa - fb;
        });
        setEvents(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleFavorite = async (eventId) => {
    try {
      const res = await axios.post(`/favorites/toggle/${eventId}`);
      const newState = res.data?.favorited === true;
      setFavoriteIds(prev => {
        const copy = new Set(prev);
        if (newState) copy.add(String(eventId)); else copy.delete(String(eventId));
        return copy;
      });
      setEvents(prev => {
        const copy = [...prev];
        copy.sort((a,b) => {
          const fa = favoriteIds.has(String(a.id)) ? 0 : 1;
          const fb = favoriteIds.has(String(b.id)) ? 0 : 1;
          return fa - fb;
        });
        return copy;
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // debounce search input to avoid filtering on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [search]);

  // compute filtered list using debounced search (case-insensitive contains)
  const displayedEvents = (category === "Tất cả" ? events : events.filter((e) => e.category?.name === category))
    .filter((e) => {
      if (!debouncedSearch) return true;
      const s = debouncedSearch;
      const title = (e.title || "").toLowerCase();
      const loc = (e.location || "").toLowerCase();
      const cat = (e.category?.name || "").toLowerCase();
      const creator = (e.createdByFullName || "").toLowerCase();
      return title.includes(s) || loc.includes(s) || cat.includes(s) || creator.includes(s);
    });

  const filteredEvents = displayedEvents;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div
        className="relative h-[280px] bg-cover bg-center flex items-center justify-center text-center"
        style={{ backgroundImage: "url('/images/event-banner.jpg')" }}
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
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center flex-1 max-w-3xl w-full bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm focus-within:shadow-md transition">
            <FiSearch className="text-gray-400 text-xl mr-3" />
            <input
              type="search"
              placeholder="Tìm theo tên, địa điểm, danh mục..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") setSearch(""); }}
              className="flex-1 text-sm outline-none placeholder-gray-400 bg-transparent"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500 ml-2"
                aria-label="Clear search"
              >
                <FiX />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center bg-white border border-gray-200 rounded-full px-3 py-2 shadow-sm">
              <FiFilter className="text-gray-500 mr-2" />
              <select
                className="bg-transparent text-sm outline-none"
                defaultValue="date"
              >
                <option value="date">Ngày diễn ra</option>
                <option value="name">Tên sự kiện</option>
                <option value="participants">Số người tham gia</option>
              </select>
            </div>

            <button
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-full text-sm hover:bg-emerald-700 transition"
              onClick={() => { /* optional: trigger manual search / analytics */ }}
            >
              Tìm kiếm
            </button>
          </div>
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
            <EventCard key={event.id} event={event} status={myStatusByEvent[event.id]} isFavorited={favoriteIds.has(String(event.id))} onToggleFavorite={toggleFavorite} />
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
