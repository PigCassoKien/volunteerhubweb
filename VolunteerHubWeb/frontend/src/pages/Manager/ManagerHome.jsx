import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import EventListManager from "./EventListManager";
import CategoryManager from "./CategoryManager";
import RegistrationsManager from "./RegistrationsManager";
import EventEditor from "./EventEditor";

export default function ManagerHome() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const [showEditor, setShowEditor] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ newEvents: 0, trending: 0, posts: 0 });

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

      <EventListManager
        events={events}
        onEdit={(ev) => { setEditingEvent(ev); setShowEditor(true); }}
        onRefresh={loadMyEvents}
      />

      <div className="mt-10 grid grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Quản lý danh mục</h3>
          <CategoryManager onUpdated={loadMyEvents} />
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Báo cáo & đăng ký</h3>
          <p className="text-sm text-gray-500">Chọn một sự kiện để quản lý đăng ký / xuất dữ liệu.</p>
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