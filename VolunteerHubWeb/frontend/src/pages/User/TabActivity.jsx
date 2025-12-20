import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import { FiCalendar, FiClock, FiMapPin, FiDownload, FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { getFileUrl } from "../../utils/files";

export default function TabActivity({ user }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");
  const viewingOther = user && user.id && (!storedUser || user.id !== storedUser.id);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        let res;
        if (viewingOther) {
          // public endpoint for other user's registrations
          res = await axios.get(`/registrations/user/${user.id}`);
        } else {
          if (!token) {
            setActivities([]);
            setLoading(false);
            return;
          }
          // call backend history endpoint for current user
          res = await axios.post("/registrations/history", {
            startDate: null,
            endDate: null,
            status: null,
            categoryId: null,
            sortBy: "dateDesc",
          });
        }

        const list = Array.isArray(res.data) ? res.data : [];
        setActivities(list);
      } catch (err) {
        console.error("Lỗi tải lịch sử:", err);
        setError("Không tải được lịch sử hoạt động.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [token, user]);

  const handleCancel = async (regId) => {
    if (!confirm("Bạn chắc chắn muốn huỷ đăng ký này?")) return;
    try {
      const res = await axios.put(`/registrations/cancel/${regId}`);
      // update local list
      setActivities((prev) => prev.map((a) => (a.id === regId ? { ...a, ...res.data } : a)));
      alert("Đã huỷ đăng ký.");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Không thể huỷ đăng ký.");
    }
  };

  const downloadCertificate = (urlOrPath) => {
    if (!urlOrPath) return alert("Không có chứng nhận.");
    let url = urlOrPath;

    // If backend returned a path starting with /uploads, prefer the configured VITE_UPLOAD_BASE
    if (typeof url === "string" && url.startsWith("/uploads/")) {
      const base = (import.meta.env.VITE_UPLOAD_BASE || "").replace(/\/$/, "");
      if (base) {
        url = base + url.replace(/^\/uploads/, "");
      }
    } else if (typeof url === "string" && !/^https?:\/\//i.test(url) && !url.startsWith("/")) {
      // treat as filename like 'certificates/12_certificate.pdf'
      url = getFileUrl(url);
    }

    window.open(url, "_blank");
  };

  const formatDateTime = (v) => {
    if (!v) return "-";
    try {
      return new Date(v).toLocaleString("vi-VN");
    } catch {
      return v;
    }
  };

  const getStatusText = (s) => {
    switch (s) {
      case "APPROVED":
        return "Đã xác nhận";
      case "PENDING":
        return "Chờ xác nhận";
      case "CANCELED":
      case "CANCELLED":
        return "Đã huỷ";
      case "COMPLETED":
        return "Hoàn thành";
      case "REJECTED":
        return "Từ chối";
      default:
        return s || "-";
    }
  };

  const getBadgeClass = (s) => {
    switch (s) {
      case "APPROVED":
        return "bg-blue-100 text-blue-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELED":
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "REJECTED":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const roleLabel = (r) => {
    if (!r) return "-";
    if (r === "VOLUNTEER") return "Tình nguyện viên";
    if (r === "EVENT_MANAGER") return "Quản lý sự kiện";
    if (r === "ADMIN") return "Quản trị viên";
    return r;
  };

  if (loading) return <p className="text-center">Đang tải lịch sử...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;
  if (!activities || activities.length === 0) return <p className="text-center text-gray-500">Không có hoạt động.</p>;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FiClock /> {viewingOther ? `Hoạt động của ${user.fullName || 'người dùng'}` : 'Hoạt động của bạn'}
      </h2>

      <div className="flex flex-col gap-4">
        {activities.map((item) => {
          // support different shapes returned by backend; prefer explicit fields populated by backend
          const eventId = item.eventId || item.event?.id;
          const eventName = item.eventTitle || item.eventName || item.event?.title || `Sự kiện ${eventId}`;
          const eventDate = item.eventStartDate || item.eventDate || item.event?.startDate || null;
          const location = item.eventLocation || item.location || item.event?.location || "-";
          const status = item.status || (item.registrationStatus ? item.registrationStatus : null);
          const registeredAt = item.registeredAt || item.createdAt;
          const completedAt = item.completedAt || item.finishedAt;
          const certificateUrl = item.certificateUrl || item.certificateFile || null;
          const userRole = storedUser?.role;

          const eventStarted = eventDate ? new Date(eventDate) <= new Date() : false;
          const canCancel = status === "APPROVED" && !eventStarted;

          return (
            <div key={item.id} className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link to={`/events/${eventId}`} className="font-medium text-gray-800 hover:underline text-lg">
                      {eventName || `Sự kiện ${eventId}`}
                    </Link>
                    <div className="text-sm text-gray-500 mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1"><FiCalendar /> {eventDate ? new Date(eventDate).toLocaleDateString("vi-VN") : "-"}</span>
                      {location && <span className="flex items-center gap-1"><FiMapPin /> {location}</span>}
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Vai trò:</strong> {roleLabel(userRole)}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm ${getBadgeClass(status)}`}>{getStatusText(status)}</span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                  <div>
                    <div className="text-xs text-gray-400">Đăng ký lúc</div>
                    <div className="font-medium">{formatDateTime(registeredAt)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Hoàn thành lúc</div>
                    <div className="font-medium">{formatDateTime(completedAt)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Ghi chú</div>
                    <div className="font-medium">{item.role || item.note || "-"}</div>
                  </div>
                </div>

                {item.skills || item.experience ? (
                  <div className="mt-3 text-sm text-gray-700">
                    {item.skills ? <div><strong>Kỹ năng:</strong> {item.skills}</div> : null}
                    {item.experience ? <div><strong>Kinh nghiệm:</strong> {item.experience}</div> : null}
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col items-end gap-2 md:w-44">
                <div className="flex gap-2">
                  <Link to={`/events/${eventId}`} className="text-sm px-3 py-2 border rounded hover:bg-gray-50 flex items-center gap-2">
                    Chi tiết <FiChevronRight />
                  </Link>

                  {/* {certificateUrl && (
                    <button onClick={() => downloadCertificate(certificateUrl)} className="text-sm px-3 py-2 bg-blue-600 text-white rounded flex items-center gap-2">
                      <FiDownload /> Chứng nhận
                    </button>
                  )} */}
                </div>

                {canCancel && (
                  <button onClick={() => handleCancel(item.id)} className="text-sm px-3 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50">
                    Huỷ
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
