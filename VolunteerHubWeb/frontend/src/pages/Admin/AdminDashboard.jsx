import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { FiUsers, FiCalendar, FiBarChart2, FiClock, FiDownload } from "react-icons/fi";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ newEvents: [], trendingEvents: [], newPosts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get("/dashboard/stats");
        setStats(data || {});
      } catch (err) {
        console.error("Load dashboard failed", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div>Đang tải dashboard...</div>;

  const m = stats || {};

  return (
    <AdminLayout title="Bảng quản trị">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg"><FiCalendar className="text-2xl text-emerald-600" /></div>
          <div>
            <div className="text-xs text-gray-500">Tổng số sự kiện</div>
            <div className="text-2xl font-semibold">{m.totalEvents ?? 0}</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg"><FiUsers className="text-2xl text-blue-600" /></div>
          <div>
            <div className="text-xs text-gray-500">Tổng số người dùng</div>
            <div className="text-2xl font-semibold">{m.totalUsers ?? 0}</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow flex items-center gap-4">
          <div className="p-3 bg-yellow-50 rounded-lg"><FiBarChart2 className="text-2xl text-yellow-600" /></div>
          <div>
            <div className="text-xs text-gray-500">Đăng ký / Đã xác nhận</div>
            <div className="text-2xl font-semibold">{(m.totalRegistrations ?? 0)} / {(m.totalApprovedRegistrations ?? 0)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Tình nguyện viên</div>
          <div className="text-xl font-semibold">{m.totalVolunteers ?? 0}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Quản lý sự kiện</div>
          <div className="text-xl font-semibold">{m.totalManagers ?? 0}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Active (7 ngày)</div>
          <div className="text-xl font-semibold">{m.activeUsersLast7Days ?? 0}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Lưu lượng (placeholder)</div>
          <div className="text-xl font-semibold">{m.siteVisits ?? 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded shadow-sm bg-emerald-50">
          <h3 className="font-medium text-emerald-700">Sự kiện mới</h3>
          <ul className="mt-2 space-y-2 text-sm text-gray-700">
            {stats.newEvents.slice(0,5).map(ev => <li key={ev.id}>{ev.title}</li>)}
            {!stats.newEvents.length && <li className="text-gray-500">Không có sự kiện mới</li>}
          </ul>
        </div>

        <div className="p-4 rounded shadow-sm bg-white">
          <h3 className="font-medium">Sự kiện thu hút</h3>
          <ul className="mt-2 space-y-2 text-sm text-gray-700">
            {stats.trendingEvents.slice(0,5).map(ev => <li key={ev.id}>{ev.title}</li>)}
            {!stats.trendingEvents.length && <li className="text-gray-500">Không có dữ liệu</li>}
          </ul>
        </div>

        <div className="p-4 rounded shadow-sm bg-white">
          <h3 className="font-medium">Bài viết mới</h3>
          <ul className="mt-2 space-y-2 text-sm text-gray-700">
            {stats.newPosts.slice(0,5).map(p => <li key={p.id}>{p.content?.slice(0,80)}</li>)}
            {!stats.newPosts.length && <li className="text-gray-500">Không có bài viết</li>}
          </ul>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Link to="/admin/events" className="px-4 py-2 bg-blue-600 text-white rounded">Quản lý sự kiện</Link>
        <Link to="/admin/users" className="px-4 py-2 bg-emerald-600 text-white rounded">Quản lý người dùng</Link>
        <Link to="/admin/export" className="px-4 py-2 border rounded">Xuất dữ liệu</Link>
      </div>
    </AdminLayout>
  );
}