import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import AdminLayout from "../../components/AdminLayout";
import EventCard from "../../components/EventCard";

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;
  const [search, setSearch] = useState("");
  const [searchTermForFilter, setSearchTermForFilter] = useState("");

  useEffect(() => {
    setSearchTermForFilter(search.trim().toLowerCase());
    setPage(1);
  }, [search]);
  const [timeFilter, setTimeFilter] = useState("ALL"); // ALL | UPCOMING | ONGOING | ENDED
  const [showNotApproved, setShowNotApproved] = useState(false);

  useEffect(() => { setPage(1); }, [timeFilter, showNotApproved]);

  const loadEvents = async () => {
    try {
      // try admin endpoint first, fallback to public
      let res;
      try {
        res = await axios.get("/admin/events");
      } catch {
        res = await axios.get("/events/all");
      }
      const list = Array.isArray(res.data) ? res.data : [];
      const now = Date.now();
      list.sort((a, b) => {
        const aEnded = a.endDate ? new Date(a.endDate).getTime() < now : false;
        const bEnded = b.endDate ? new Date(b.endDate).getTime() < now : false;
        if (aEnded !== bEnded) return aEnded ? 1 : -1;
        return new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime();
      });
      setEvents(list);
    } catch (err) {
      console.error("Load events failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => { setPage(1); }, [events]);

  const approve = async (id) => {
    if (!confirm("Duyệt sự kiện này?")) return;
    try {
      await axios.put(`/events/approve/${id}`);
      await loadEvents();
    } catch (err) {
      alert(err.response?.data?.message || "Duyệt thất bại");
    }
  };

  const remove = async (id) => {
    if (!confirm("Xóa sự kiện này?")) return;
    try {
      await axios.delete(`/events/delete/${id}`);
      setEvents((prev) => prev.filter((e) => String(e.id) !== String(id)));
    } catch (err) {
      alert("Xóa thất bại");
    }
  };

  const matchesTime = (e) => {
    if (timeFilter === "ALL") return true;
    const now = Date.now();
    const start = e.startDate ? new Date(e.startDate).getTime() : null;
    const end = e.endDate ? new Date(e.endDate).getTime() : null;
    if (timeFilter === "UPCOMING") return start != null && start > now;
    if (timeFilter === "ONGOING") return start != null && end != null && start <= now && end >= now;
    if (timeFilter === "ENDED") return end != null && end < now;
    return true;
  };

  const filtered = events.filter((e) => {
    if (showNotApproved && String(e.status).toUpperCase() === "APPROVED") return false;
    if (!matchesTime(e)) return false;
    if (!searchTermForFilter) return true;
    const s = searchTermForFilter;
    return (
      (e.title || "").toLowerCase().includes(s) ||
      (e.location || "").toLowerCase().includes(s) ||
      (e.category?.name || "").toLowerCase().includes(s) ||
      (e.createdByFullName || "").toLowerCase().includes(s)
    );
  });

  if (loading) return (
    <AdminLayout title="Quản lý sự kiện">
      <div>Đang tải sự kiện...</div>
    </AdminLayout>
  );

  if (!events.length) return (
    <AdminLayout title="Quản lý sự kiện">
      <div className="text-center text-gray-500">Không có sự kiện</div>
    </AdminLayout>
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const startIndex = (page - 1) * PAGE_SIZE;
  const paged = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <AdminLayout title="Quản lý sự kiện">
      <div className="mb-4">
        <input
          type="search"
          placeholder="Tìm sự kiện (nhanh)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border rounded-md"
        />
      </div>
      {/* Filter buttons: time segmented + not-approved toggle */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          {[
            { key: "ALL", label: "Tất cả" },
            { key: "UPCOMING", label: "Sắp tới" },
            { key: "ONGOING", label: "Đang diễn ra" },
            { key: "ENDED", label: "Đã kết thúc" },
          ].map((b) => (
            <button
              key={b.key}
              onClick={() => setTimeFilter(b.key)}
              className={`px-3 py-1 rounded-md text-sm border ${timeFilter === b.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              {b.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showNotApproved}
              onChange={() => setShowNotApproved(v => !v)}
              className="w-4 h-4"
            />
            <span>Chưa duyệt</span>
          </label>
          <button
            onClick={() => { setTimeFilter('ALL'); setShowNotApproved(false); setSearch(''); }}
            className="px-3 py-1 border rounded-md text-sm hover:bg-gray-50"
          >
            Đặt lại
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {paged.map((ev) => (
          <div key={ev.id} className="relative">
            <EventCard
              event={ev}
              // admin view: no favorite interactions
              isFavorited={false}
              onToggleFavorite={() => { }}
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{ev.status}</span>
                <span className="ml-2 text-gray-400">· {ev.registeredCount ?? 0} đăng ký</span>
              </div>

              <div className="flex items-center gap-2">
                {String(ev.status).toUpperCase() !== "APPROVED" && (
                  <button
                    onClick={() => approve(ev.id)}
                    className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700"
                  >
                    Duyệt
                  </button>
                )}
                <button
                  onClick={() => remove(ev.id)}
                  className="px-3 py-1 border text-red-600 rounded text-sm hover:bg-red-50"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
        <div className="text-sm text-gray-600">Trang {page} / {totalPages}</div>
        <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
      </div>
    </AdminLayout>
  );
}