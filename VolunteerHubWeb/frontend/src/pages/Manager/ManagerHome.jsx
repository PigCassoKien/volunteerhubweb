import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import EventListManager from "./EventListManager";
import CategoryManager from "./CategoryManager";
import RegistrationsManager from "./RegistrationsManager";
import EventEditor from "./EventEditor";
import { motion } from "framer-motion";
import { BarChart3, Flame, FileText, PlusCircle } from "lucide-react";

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
      const list = Array.isArray(data) ? data : [];
      const now = Date.now();
      list.sort((a, b) => {
        const aEnded = a.endDate ? new Date(a.endDate).getTime() < now : false;
        const bEnded = b.endDate ? new Date(b.endDate).getTime() < now : false;
        if (aEnded !== bEnded) return aEnded ? 1 : -1;
        return new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime();
      });
      setEvents(list);
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

  const StatCard = ({ icon: Icon, label, value }) => (
    <motion.div
      className="bg-white p-5 rounded-2xl shadow hover:shadow-md transition flex items-center gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="p-3 bg-gray-100 rounded-xl">
        <Icon size={24} className="text-emerald-600" />
      </div>
      <div>
        <div className="text-gray-500 text-sm">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý sự kiện</h1>
          <p className="text-gray-500 mt-1">Xin chào, {storedUser?.fullName}</p>
        </div>
        <button
          onClick={() => {
            setEditingEvent(null);
            setShowEditor(true);
          }}
          className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow"
        >
          <PlusCircle size={18} /> Tạo sự kiện mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard icon={BarChart3} label="Sự kiện mới" value={stats.newEvents} />
        <StatCard icon={Flame} label="Sự kiện thu hút" value={stats.trending} />
        <StatCard icon={FileText} label="Bài viết mới" value={stats.posts} />
      </div>

      {/* Event List */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <EventListManager
          events={events}
          onEdit={(ev) => {
            setEditingEvent(ev);
            setShowEditor(true);
          }}
          onRefresh={loadMyEvents}
        />
      </motion.div>

      {/* Category & Registrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        <motion.div
          className="bg-white p-5 rounded-2xl shadow"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h3 className="font-semibold text-lg mb-4">Quản lý danh mục</h3>
          <CategoryManager onUpdated={loadMyEvents} />
        </motion.div>

        <motion.div
          className="bg-white p-5 rounded-2xl shadow"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h3 className="font-semibold text-lg mb-4">Báo cáo & đăng ký</h3>
          <p className="text-sm text-gray-500 mb-2">Chọn sự kiện để xem danh sách đăng ký.</p>
          <RegistrationsManager events={events} />
        </motion.div>
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <EventEditor
          event={editingEvent}
          onClose={() => {
            setShowEditor(false);
            setEditingEvent(null);
          }}
          onSaved={() => {
            setShowEditor(false);
            loadMyEvents();
          }}
        />
      )}
    </div>
  );
}
