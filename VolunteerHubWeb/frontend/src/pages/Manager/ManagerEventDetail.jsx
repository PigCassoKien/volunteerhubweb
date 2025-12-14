import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { getFileUrl } from "../../utils/files";

import InfoTab from "./tabs/InfoTab";
import RegistrationsTab from "./tabs/RegistrationsTab";
import WallTab from "./tabs/WallTab";
import PendingTab from "./tabs/PendingTab";

export default function ManagerEventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("info");
  const [refreshKey, setRefreshKey] = useState(0);

  const reload = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    loadAll();
  }, [id, refreshKey]);

  const loadAll = async () => {
    try {
      const [ev, regs, ps] = await Promise.all([
        axios.get(`/events/get/${id}`),
        axios.get(`/registrations/event/${id}`),
        axios.get(`/posts/event/${id}`),
      ]);
      setEvent(ev.data);
      setRegistrations(Array.isArray(regs.data) ? regs.data : []);
      setPosts(Array.isArray(ps.data) ? ps.data : []);
    } catch (err) {
      console.error(err);
      navigate("/manager");
    } finally {
      setLoading(false);
    }
  };

  const approveRegistration = async (rid) => {
    if (!confirm("Duyệt đăng ký này?")) return;
    await axios.put(`/registrations/approve/${rid}`);
    reload();
  };

  const rejectRegistration = async (rid) => {
    if (!confirm("Từ chối đăng ký?")) return;
    await axios.put(`/registrations/cancel/${rid}`);
    reload();
  };

  const completeRegistration = async (rid) => {
    if (!confirm("Đánh dấu hoàn thành?")) return;
    await axios.put(`/registrations/complete/${rid}`);
    reload();
  };

  const approvePost = async (pid) => {
    if (!confirm("Duyệt bài viết này?")) return;
    await axios.put(`/posts/approve/${pid}`);
    reload();
  };

  const rejectPost = async (pid) => {
    if (!confirm("Từ chối bài viết này?")) return;
    await axios.put(`/posts/reject/${pid}`);
    reload();
  };

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (!event) return <div className="p-6 text-red-600">Không tìm thấy sự kiện</div>;

  const pendingPosts = posts.filter((p) => p.status === "PENDING");
  const approvedPosts = posts.filter((p) => p.status === "APPROVED");

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* header */}
      <div className="flex items-start gap-6">
        <img
          src={getFileUrl(event?.imageFile)}
          className="w-48 h-32 object-cover rounded-md border"
        />
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{event.title}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {event.location} · {new Date(event.startDate).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b">
        <nav className="flex gap-2">
          {[
            ["info", "Thông tin"],
            ["regs", `Đăng ký (${registrations.length})`],
            ["wall", "Wall trao đổi"],
            ["pending", `Bài chờ (${pendingPosts.length})`],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 ${tab === key ? "border-b-2 border-emerald-600 text-emerald-600" : "text-gray-600"
                }`}
            >
              {label}
            </button>
          ))}

          <div className="ml-auto">
            <Link to="/manager" className="text-sm text-gray-500 hover:text-gray-700">
              Quay lại
            </Link>
          </div>
        </nav>
      </div>

      {/* TAB CONTENT */}
      <div className="mt-6">
        {tab === "info" && <InfoTab event={event} registrations={registrations} />}
        {tab === "regs" && (
          <RegistrationsTab
            registrations={registrations}
            approve={approveRegistration}
            reject={rejectRegistration}
            complete={completeRegistration}
          />
        )}
        {tab === "wall" && (
          <WallTab posts={approvedPosts} eventId={id} reload={reload} approve={approvePost} reject={rejectPost} />
        )}
        {tab === "pending" && (
          <PendingTab pending={pendingPosts} approve={approvePost} reject={rejectPost} />
        )}
      </div>
    </div>
  );
}
