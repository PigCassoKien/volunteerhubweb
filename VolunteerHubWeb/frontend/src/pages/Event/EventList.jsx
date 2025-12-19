import { FiSearch, FiBookmark, FiCalendar, FiX, FiFilter } from "react-icons/fi";
import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import EventCard from "../../components/EventCard";
import Pagination from "../../components/Pagination";
import StatsSection from "../../components/StatsSection";
import CreateEvent from "../../components/CreateEvent";

export default function EventList() {
  const [category, setCategory] = useState("Tất cả");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myStatusByEvent, setMyStatusByEvent] = useState({});
  const [categories, setCategories] = useState(["Tất cả"]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [search, setSearch] = useState("");
  const [searchTermForFilter, setSearchTermForFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("ALL"); // ALL | UPCOMING | ONGOING | ENDED
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  useEffect(() => {
    if (search.trim() === "") {
      setSearchTermForFilter("");
    }
  }, [search]);

  // LOAD EVENTS
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("/events/all");
        const data = Array.isArray(res.data) ? res.data : [];

        setEvents(
          data
            .filter((e) => e.status === "APPROVED")
        );
      } catch (err) {
        console.error("Lỗi tải danh sách sự kiện:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // LOAD USER REGISTRATION STATUS
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const loadMyStatuses = async () => {
      try {
        const res = await axios.post("/registrations/history", {
          startDate: "2000-01-01T00:00:00",
          endDate: "2100-01-01T00:00:00",
          status: null,
        });

        const byEvent = {};
        const priority = {
          APPROVED: 3,
          PENDING: 2,
          COMPLETED: 1,
          CANCELED: 0,
          REJECTED: 0,
        };

        res.data.forEach((r) => {
          const evId = r.eventId;
          const curr = byEvent[evId];

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

  // LOAD CATEGORIES
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

  // LOAD FAVORITES + sort event list
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get("/events/all");
        const publicEvents = (Array.isArray(data) ? data : []).filter(
          (e) => String(e.status || "").toUpperCase() === "APPROVED"
        );

        let favIds = new Set();
        try {
          const fav = await axios.get("/favorites/my");
          favIds = new Set((fav.data || []).map((e) => String(e.id)));
          setFavoriteIds(favIds);
        } catch (_) { }

        const sorted = publicEvents.sort((a, b) => {
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

  // Toggle Favorites
  const toggleFavorite = async (eventId) => {
    try {
      const res = await axios.post(`/favorites/toggle/${eventId}`);
      const newState = res.data?.favorited === true;

      setFavoriteIds((prev) => {
        const copy = new Set(prev);
        if (newState) copy.add(String(eventId));
        else copy.delete(String(eventId));
        return copy;
      });

      setEvents((prev) => {
        const copy = [...prev];
        copy.sort((a, b) => {
          const fa = favoriteIds.has(String(a.id)) ? 0 : 1;
          const fb = favoriteIds.has(String(b.id)) ? 0 : 1;
          return fa - fb;
        });
        return copy;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = () => {
    setSearchTermForFilter(search.trim().toLowerCase());
  };

  // Filter events
  const now = new Date();

  const matchesSearch = (e) => {
    if (!searchTermForFilter) return true;
    const s = searchTermForFilter;
    return (
      (e.title || "").toLowerCase().includes(s) ||
      (e.location || "").toLowerCase().includes(s) ||
      (e.category?.name || "").toLowerCase().includes(s) ||
      (e.createdByFullName || "").toLowerCase().includes(s)
    );
  };

  const matchesTimeFilter = (e) => {
    if (timeFilter === "ALL") return true;
    const start = new Date(e.startDate);
    const end = new Date(e.endDate);
    if (timeFilter === "UPCOMING") return start > now;
    if (timeFilter === "ONGOING") return start <= now && end >= now;
    if (timeFilter === "ENDED") return end < now;
    return true;
  };

  const displayedEvents = (
    category === "Tất cả"
      ? events
      : events.filter((e) => e.category?.name === category)
  ).filter((e) => matchesSearch(e) && matchesTimeFilter(e));

  const filteredEvents = displayedEvents;

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE));
  const pageEvents = filteredEvents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50">

      {/*Banner */}
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
                  <a href="/" className="hover:text-white">
                    Trang chủ
                  </a>
                </li>
                <li>/</li>
                <li className="font-semibold text-white">
                  Danh sách sự kiện
                </li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="relative z-10 text-white">
          <h1 className="text-5xl font-bold">
            Khám phá các sự kiện
          </h1>
          <p className="mt-3 text-lg">
            Tìm kiếm và tham gia các hoạt động phù hợp với bạn
          </p>
        </div>
      </div>

      {/* Search + Filter  */}
      <div className="max-w-6xl mx-auto -mt-16 bg-white shadow-xl rounded-xl p-8 relative z-20">
        <div className="flex items-center justify-between gap-3 mb-6">

          {/* Search box */}
          <div className="flex items-center flex-1 justify-start w-full 
    bg-white border border-gray-300 rounded-xl px-4 py-3 
    shadow-sm hover:shadow-md focus-within:border-emerald-500 transition-all">

            <FiSearch className="text-gray-500 text-xl mr-3" />

            <input
              type="search"
              placeholder="Tìm kiếm sự kiện..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm outline-none placeholder-gray-400"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500 ml-2"
              >
                <FiX className="text-lg" />
              </button>
            )}
          </div>

          <button
            onClick={handleSearch}
            className="flex items-center justify-center gap-2 
             px-8 py-3 min-w-[140px]
             bg-emerald-600 text-white rounded-full text-sm 
             hover:bg-emerald-700 transition"
          >
            Tìm kiếm
          </button>
        </div>

        {/* Result count */}
        <p className="text-gray-600 mb-4">
          <span className="font-semibold text-gray-800">
            {loading
              ? "Đang tải..."
              : `Tìm thấy ${filteredEvents.length} sự kiện`}
          </span>
        </p>

        {/* Categories */}
        <div className="mb-6">
          <p className="text-gray-700 font-semibold flex items-center gap-1 mb-3">
            <FiBookmark className="text-emerald-600" /> Lĩnh vực hoạt động
          </p>

          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-full text-sm transition-all border 
                  ${category === c
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-emerald-50"
                  }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Sort by */}
        <div className="flex items-center gap-2">
          <p className="text-gray-700 font-semibold flex items-center gap-1">
            <FiCalendar className="text-emerald-600" /> Sắp xếp theo
          </p>

          <div className="hidden md:flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
            <FiFilter className="text-gray-500 mr-2" />
            <select className="bg-transparent text-sm outline-none">
              <option value="date">Ngày diễn ra</option>
              <option value="name">Tên sự kiện</option>
              <option value="participants">Số người tham gia</option>
            </select>
          </div>
          {/* Time filters */}
          <div className="ml-4 flex items-center gap-2">
            <button onClick={() => { setTimeFilter("ALL"); setPage(1); }} className={`px-3 py-1 rounded-full text-sm ${timeFilter==='ALL' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Tất cả</button>
            <button onClick={() => { setTimeFilter("UPCOMING"); setPage(1); }} className={`px-3 py-1 rounded-full text-sm ${timeFilter==='UPCOMING' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Chưa bắt đầu</button>
            <button onClick={() => { setTimeFilter("ONGOING"); setPage(1); }} className={`px-3 py-1 rounded-full text-sm ${timeFilter==='ONGOING' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Đang diễn ra</button>
            <button onClick={() => { setTimeFilter("ENDED"); setPage(1); }} className={`px-3 py-1 rounded-full text-sm ${timeFilter==='ENDED' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Đã kết thúc</button>
          </div>
        </div>
      </div>

      {/* ---------- Event Cards ---------- */}
      <div className="max-w-6xl mx-auto mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 pb-6">
        {!loading && pageEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            status={myStatusByEvent[event.id]}
            isFavorited={favoriteIds.has(String(event.id))}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>

      {/* Pagination */}
      <div className="max-w-6xl mx-auto text-center pb-16">
        <Pagination page={page} totalPages={totalPages} onChange={(p) => setPage(p)} />
      </div>

      <StatsSection />
      <CreateEvent />
    </div>
  );
}
