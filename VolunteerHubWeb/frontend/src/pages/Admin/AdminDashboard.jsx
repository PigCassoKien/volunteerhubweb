import React, { useEffect, useState, useMemo } from "react";
import axios from "../../api/axios";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { FiUsers, FiCalendar, FiBarChart2, FiClock } from "react-icons/fi";
import Pagination from "../../components/Pagination";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    newEvents: [],
    trendingEvents: [],
    newPosts: []
  });
  const [loading, setLoading] = useState(true);
  const [approvedCountByEvent, setApprovedCountByEvent] = useState({});
  const PAGE_SIZE = 5;

  const [newEventPage, setNewEventPage] = useState(1);
  const [trendingPage, setTrendingPage] = useState(1);
  const [postPage, setPostPage] = useState(1);

  const eventNameMap = useMemo(() => {
    const map = {};
    (stats.newEvents || []).forEach(ev => {
      map[ev.id] = ev.title;
    });
    return map;
  }, [stats.newEvents]);

  useEffect(() => setPostPage(1), [stats.newPosts]);

  const sortedPosts = useMemo(() => {
    return [...(stats.newPosts || [])].sort((a, b) => {
      const scoreA = (a.reactionCount ?? 0) * 2 + (a.commentCount ?? 0);
      const scoreB = (b.reactionCount ?? 0) * 2 + (b.commentCount ?? 0);

      if (scoreB !== scoreA) return scoreB - scoreA;

      // nếu tương tác bằng nhau → bài mới hơn lên trước
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [stats.newPosts]);

  const paginate = (arr, page) => {
    const start = (page - 1) * PAGE_SIZE;
    return arr.slice(start, start + PAGE_SIZE);
  };

  const sortedTrendingEvents = [...stats.trendingEvents].sort(
    (a, b) =>
      (approvedCountByEvent[b.id] ?? 0) -
      (approvedCountByEvent[a.id] ?? 0)
  );

  useEffect(() => setNewEventPage(1), [stats.newEvents]);
  useEffect(() => setTrendingPage(1), [stats.trendingEvents]);

  useEffect(() => {
    const fetchApprovedCounts = async () => {
      try {
        const results = await Promise.all(
          stats.trendingEvents.map(async (ev) => {
            try {
              const res = await axios.get(
                `/registrations/count/${ev.id}`,
                { params: { status: "APPROVED" } }
              );
              return [ev.id, res.data ?? 0];
            } catch {
              return [ev.id, 0];
            }
          })
        );

        setApprovedCountByEvent(Object.fromEntries(results));
      } catch (err) {
        console.error("Lỗi load approved counts", err);
      }
    };

    if (stats?.trendingEvents?.length) {
      fetchApprovedCounts();
    }
  }, [stats.trendingEvents]);

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Sự kiện mới */}
        <div className="bg-white rounded-xl shadow-sm border flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-semibold flex items-center gap-2 text-emerald-700">
              <FiCalendar /> Sự kiện mới
            </h3>
            <Link to="/admin/events" className="text-sm text-emerald-600 hover:underline">
              Xem tất cả
            </Link>
          </div>

          <ul className="divide-y flex-1">
            {paginate(stats.newEvents, newEventPage).map(ev => (
              <li key={ev.id}>
                <Link
                  to={`/events/${ev.id}`}
                  className="block px-4 py-3 hover:bg-emerald-50 transition"
                >
                  <div className="font-medium text-gray-800 line-clamp-1">
                    {ev.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Ngày tạo: {ev.createdAt ? new Date(ev.createdAt).toLocaleDateString() : "—"}
                  </div>
                </Link>
              </li>
            ))}

            {!stats.newEvents.length && (
              <li className="px-4 py-6 text-sm text-gray-500 text-center">
                Không có sự kiện mới
              </li>
            )}
          </ul>
          <Pagination
            page={newEventPage}
            totalPages={Math.ceil(stats.newEvents.length / PAGE_SIZE)}
            onChange={setNewEventPage}
          />
        </div>

        {/* Sự kiện thu hút */}
        <div className="bg-white rounded-xl shadow-sm border flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-semibold flex items-center gap-2 text-emerald-700">
              <FiBarChart2 /> Sự kiện thu hút
            </h3>
            <Link to="/admin/events" className="text-sm text-emerald-700 hover:underline">
              Xem tất cả
            </Link>
          </div>

          <ul className="divide-y flex-1">
            {paginate(sortedTrendingEvents, trendingPage).map(ev => (
              <li key={ev.id}>
                <Link
                  to={`/events/${ev.id}`}
                  className="block px-4 py-3 hover:bg-blue-50 transition"
                >
                  <div className="font-medium text-gray-800 line-clamp-1">
                    {ev.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Đăng ký: {approvedCountByEvent[ev.id] ?? 0}
                  </div>
                </Link>
              </li>
            ))}

            {!stats.trendingEvents.length && (
              <li className="px-4 py-6 text-sm text-gray-500 text-center">
                Không có dữ liệu
              </li>
            )}
          </ul>
          <Pagination
            page={trendingPage}
            totalPages={Math.ceil(sortedTrendingEvents.length / PAGE_SIZE)}
            onChange={setTrendingPage}
          />
        </div>

        {/* Bài viết mới */}
        <div className="bg-white rounded-xl shadow-sm border flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-semibold flex items-center gap-2 text-emerald-700">
              <FiClock /> Bài viết mới
            </h3>
          </div>

          <ul className="divide-y flex-1">
            {paginate(sortedPosts, postPage).map(p => (
              <li key={p.id}>
                <Link
                  to={`/events/${p.eventId}?post=${p.id}`}
                  className="relative block px-4 py-3 hover:bg-purple-50 transition"
                >
                  <div className="text-sm text-gray-800 line-clamp-2 pr-16">
                    {p.content || "(Không có nội dung)"}
                  </div>

                  <div className="text-xs text-gray-400 mt-1">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ""}
                  </div>

                  {eventNameMap[p.eventId] && (
                    <div className="absolute bottom-2 right-3 text-[11px] text-gray-500 italic">
                      {eventNameMap[p.eventId]}
                    </div>
                  )}
                </Link>
              </li>
            ))}

            {!sortedPosts.length && (
              <li className="px-4 py-6 text-sm text-gray-500 text-center">
                Không có bài viết
              </li>
            )}
          </ul>

          <Pagination
            page={postPage}
            totalPages={Math.ceil(sortedPosts.length / PAGE_SIZE)}
            onChange={setPostPage}
          />
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