import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import AdminLayout from "../../components/AdminLayout";
import EventCard from "../../components/EventCard";

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    try {
      // try admin endpoint first, fallback to public
      let res;
      try {
        res = await axios.get("/admin/events");
      } catch {
        res = await axios.get("/events/all");
      }
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Load events failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

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

  if (loading) return <AdminLayout title="Quản lý sự kiện"><div>Đang tải sự kiện...</div></AdminLayout>;
  if (!events.length) return <AdminLayout title="Quản lý sự kiện"><div className="text-center text-gray-500">Không có sự kiện</div></AdminLayout>;

  return (
    <AdminLayout title="Quản lý sự kiện">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((ev) => (
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
    </AdminLayout>
  );
}