import React, { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function NotificationBell({ user, token }) {
  const notifyRef = useRef(null);
  const navigate = useNavigate();

  const [openNotify, setOpenNotify] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  const [selectedNotify, setSelectedNotify] = useState(null); // Popup chi tiết

  const MAX_DISPLAY = 6; // hiển thị tối đa 6 thông báo

  // Load danh sách thông báo
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications"); // backend should return user's notifications
      const list = Array.isArray(res.data) ? res.data : [];
      setNotifications(list);
      setUnread(list.filter((n) => !n.isRead).length);
    } catch (err) {
      console.error("Không tải được thông báo:", err);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnread(0);
    }
  }, [user, token]);

  // Đánh dấu tất cả đã đọc
  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/mark-all-read");
    } catch (err) {
      // ignore server error, still update UI optimistically
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
  };

  // Xóa thông báo
  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/delete/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      alert("Xóa thất bại");
    }
  };

  // Khi bấm một thông báo: mark as read (optimistic), reduce unread, điều hướng tới resource
  const handleClickNotification = async (notif) => {
    if (!notif) return;
    // optimistic UI update
    if (!notif.isRead) {
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)));
      setUnread((u) => Math.max(0, u - 1));
    }

    // try server-side mark-as-read (fallbacks allowed)
    try {
      // preferred endpoint
      await api.put(`/notifications/mark-as-read/${notif.id}`);
    } catch (err) {
      // fallback: try fetch/get to ensure server side sees it
      try {
        await api.get(`/notifications/get/${notif.id}`);
      } catch (_) {
        // ignore
      }
    }

    // navigate depending on relatedType
    try {
      const type = notif.relatedType;
      const id = notif.relatedId;
      if (type === "EVENT" && id) {
        navigate(`/events/${id}`);
        return;
      }
      if (type === "POST" && id) {
        // fetch post to get eventId
        try {
          const { data: post } = await api.get(`/posts/get/${id}`);
          if (post && post.eventId) {
            navigate(`/events/${post.eventId}?postId=${id}`);
            return;
          }
        } catch (err) {
          // ignore and try generic fallback
        }
      }
      if (type === "COMMENT" && id) {
        try {
          const { data: comment } = await api.get(`/comments/get/${id}`);
          if (comment && comment.postId) {
            const { data: post } = await api.get(`/posts/get/${comment.postId}`);
            if (post && post.eventId) {
              navigate(`/events/${post.eventId}?postId=${post.id}&commentId=${id}`);
              return;
            }
          }
        } catch (err) {
          // ignore
        }
      }
    } catch (err) {
      console.error("Navigate error:", err);
    }

    // default fallback
    navigate("/");
  };

  // Click ngoài → đóng dropdown
  useEffect(() => {
    const onDoc = (e) => {
      if (notifyRef.current && !notifyRef.current.contains(e.target)) {
        setOpenNotify(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={notifyRef}>
      <button
        onClick={() => {
          setOpenNotify((v) => !v);
          // refresh when opening
          if (!openNotify) fetchNotifications();
        }}
        className="relative p-2 rounded-full hover:bg-gray-100"
        aria-label="Thông báo"
      >
        <i className="fa-solid fa-bell text-green-600"></i>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {unread}
          </span>
        )}
      </button>

      {openNotify && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border p-3 z-50">
          <div className="flex justify-between items-center mb-2">
            <strong>Thông báo</strong>
            <div className="flex items-center gap-2">
              <button onClick={markAllAsRead} className="text-xs text-gray-500 hover:underline">Đánh dấu tất cả</button>
              <button onClick={() => { setOpenNotify(false); }} className="text-xs text-gray-400">✕</button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2">
            {notifications.length === 0 && <div className="text-gray-500 text-sm">Không có thông báo</div>}
            {notifications.slice(0, MAX_DISPLAY).map((n) => (
              <div
                key={n.id}
                onClick={() => handleClickNotification(n)}
                className={`cursor-pointer p-3 rounded-lg border ${n.isRead ? "bg-white" : "bg-emerald-50"} hover:shadow-sm`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className={`text-sm ${n.isRead ? "text-gray-700" : "text-gray-900 font-medium"}`}>
                      {n.content}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>

                  <div className="ml-2 text-right">
                    {!n.isRead && <span className="text-xs text-emerald-600">Mới</span>}
                    <div>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!confirm("Xóa thông báo này?")) return;
                          await deleteNotification(n.id);
                        }}
                        className="text-xs text-red-500 ml-2"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {notifications.length > MAX_DISPLAY && (
            <div className="text-center mt-3">
              <a href="/notifications" className="text-sm text-green-600 hover:underline">Xem tất cả</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
