import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingAll, setProcessingAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await axios.get("/notifications");
        if (!mounted) return;
        setNotifications(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Load notifications failed", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.put(`/notifications/read/${id}`);
      setNotifications((prev) => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Mark read failed", err);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    if (!unread.length) return;
    if (!confirm(`Đánh dấu ${unread.length} thông báo là đã đọc?`)) return;
    setProcessingAll(true);
    try {
      // backend no "read-all" endpoint guaranteed — mark one by one
      await Promise.all(unread.map(n => axios.put(`/notifications/read/${n.id}`)));
      setNotifications((prev) => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Mark all read failed", err);
    } finally {
      setProcessingAll(false);
    }
  };

  const handleClick = async (n) => {
    if (!n.isRead) {
      markAsRead(n.id); // optimistic
    }

    try {
      // If notification directly related to an event
      if (n.relatedType === "EVENT" && n.relatedId) {
        navigate(`/events/${n.relatedId}`);
        return;
      }

      // If notification relates to a post -> fetch post to get eventId
      if (n.relatedType === "POST" && n.relatedId) {
        try {
          const res = await axios.get(`/posts/get/${n.relatedId}`);
          const post = res.data;
          const eventId = post?.eventId;
          if (eventId) {
            navigate(`/events/${eventId}?postId=${n.relatedId}`);
            return;
          }
        } catch (err) {
          // fallback to try direct post route or homepage below
        }
      }

      // If notification relates to a comment -> fetch comment to get postId, then post to get eventId
      if (n.relatedType === "COMMENT" && n.relatedId) {
        try {
          const cres = await axios.get(`/comments/get/${n.relatedId}`);
          const comment = cres.data;
          const postId = comment?.postId;
          if (postId) {
            const pres = await axios.get(`/posts/get/${postId}`);
            const post = pres.data;
            const eventId = post?.eventId;
            if (eventId) {
              navigate(`/events/${eventId}?postId=${postId}&commentId=${n.relatedId}`);
              return;
            }
          }
        } catch (err) {
          // ignore and fallback
        }
      }
    } catch (_) {}

    // fallback
    navigate("/");
  };

  if (loading) return <div className="p-6">Đang tải thông báo...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Thông báo của bạn</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            disabled={processingAll}
            className="px-3 py-1 bg-emerald-600 text-white rounded disabled:opacity-60"
          >
            {processingAll ? "Đang xử lý..." : "Đánh dấu tất cả đã đọc"}
          </button>
        </div>
      </div>

      {notifications.length === 0 && (
        <div className="text-center text-gray-500">Chưa có thông báo.</div>
      )}

      <div className="space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => handleClick(n)}
            className={
              "p-3 rounded cursor-pointer transition " +
              (n.isRead ? "bg-white" : "bg-emerald-50 border-l-4 border-emerald-400")
            }
          >
            <div className="flex justify-between items-start">
              <div>
                <div className={`text-sm ${n.isRead ? "text-gray-700" : "text-gray-900 font-medium"}`}>
                  {n.content}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {n.type ? n.type : ""} · {n.createdAt ? new Date(n.createdAt).toLocaleString("vi-VN") : ""}
                </div>
              </div>

              {!n.isRead && (
                <button
                  onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                  className="text-xs text-emerald-600 border px-2 py-1 rounded"
                >
                  Đánh dấu đã đọc
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}