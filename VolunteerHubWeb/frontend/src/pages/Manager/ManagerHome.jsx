import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import EventCard from "../../components/EventCard";
import CategoryManager from "./CategoryManager";
import RegistrationsManager from "./RegistrationsManager";
import EventEditor from "./EventEditor";

export default function ManagerHome() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const [showEditor, setShowEditor] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ newEvents: 0, trending: 0, posts: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    loadMyEvents();
    loadDashboard();
  }, []);

  const loadMyEvents = async () => {
    try {
      const { data } = await axios.get("/events/my");
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load my events failed", err);
    }
  };

  const loadDashboard = async () => {
    try {
      const { data } = await axios.get("/dashboard/stats");
      setStats({
        newEvents: data.newEvents?.length || 0,
        trending: data.trendingEvents?.length || 0,
        posts: data.newPosts?.length || 0,
      });
    } catch (err) {
      console.error("Load dashboard failed", err);
    }
  };

  // Xóa sự kiện của manager (giống EventListManager)
  const handleDelete = async (id) => {
    if (!confirm("Xóa sự kiện?")) return;
    try {
      await axios.delete(`/events/delete/${id}`);
      loadMyEvents();
    } catch (err) {
      alert(err.response?.data?.message || "Xóa thất bại");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Quản lý sự kiện</h1>
          <p className="text-sm text-gray-500">Xin chào, {storedUser?.fullName}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setEditingEvent(null); setShowEditor(true); }}
            className="px-4 py-2 bg-emerald-600 text-white rounded"
          >
            Tạo sự kiện mới
          </button>
        </div>
      </div>

      {/* Ô thống kê – giữ nguyên như mini dashboard */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Sự kiện mới</div>
          <div className="text-xl font-bold">{stats.newEvents}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Sự kiện thu hút</div>
          <div className="text-xl font-bold">{stats.trending}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Bài viết mới</div>
          <div className="text-xl font-bold">{stats.posts}</div>
        </div>
      </div>

      {/* DANH SÁCH SỰ KIỆN CỦA MANAGER – dạng grid EventCard giống dashboard */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold mb-3">Sự kiện của bạn</h3>

        {!events.length ? (
          <div className="text-center text-gray-500">
            Bạn chưa có sự kiện nào. Hãy tạo sự kiện mới.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => (
              <div key={ev.id} className="relative">
                <EventCard
                  event={ev}
                  isFavorited={false}
                  onToggleFavorite={() => {}}
                />
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{ev.status}</span>
                    <span className="ml-2 text-gray-400">
                      · {ev.registeredCount ?? 0} đăng ký
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/manager/events/${ev.id}`)}
                      className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
                    >
                      Chi tiết
                    </button>
                    <button
                      onClick={() => { setEditingEvent(ev); setShowEditor(true); }}
                      className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(ev.id)}
                      className="px-3 py-1 border text-red-600 rounded text-sm hover:bg-red-50"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Khối Danh mục & Báo cáo/Đăng ký – giữ nguyên */}
      <div className="mt-10 grid grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Quản lý danh mục</h3>
          <CategoryManager onUpdated={loadMyEvents} />
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Báo cáo & đăng ký</h3>
          <p className="text-sm text-gray-500">
            Chọn một sự kiện để quản lý đăng ký / xuất dữ liệu.
          </p>
          <RegistrationsManager events={events} />
        </div>
      </div>

      {showEditor && (
        <EventEditor
          event={editingEvent}
          onClose={() => { setShowEditor(false); setEditingEvent(null); }}
          onSaved={() => { setShowEditor(false); loadMyEvents(); }}
        />
      )}
    </div>
  );
}