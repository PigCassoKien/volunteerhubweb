import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function NotificationBell({ user, token }) {
  const notifyRef = useRef(null);

  const [openNotify, setOpenNotify] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  const [selectedNotify, setSelectedNotify] = useState(null); // Popup chi tiết

  const MAX_DISPLAY = 6; // hiển thị tối đa 6 thông báo

  // Load danh sách thông báo
  const fetchNotifications = async () => {
    if (!user || !token) return;

    try {
      const res = await fetch(`/api/notifications/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const data = await res.json();
      setNotifications(data);

      const unreadCount = data.filter((n) => !n.isRead).length;
      setUnread(unreadCount);
    } catch (err) {
      console.error("Lỗi khi tải thông báo:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  // Đánh dấu tất cả đã đọc
  const markAllAsRead = async () => {
    try {
      const unreadList = notifications.filter((n) => !n.isRead);

      await Promise.all(
        unreadList.map((n) =>
          fetch(`/api/notifications/read/${n.id}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );

      fetchNotifications();
    } catch (err) {
      console.error("Lỗi đánh dấu đã đọc:", err);
    }
  };

  // Xóa thông báo
  const deleteNotification = async (id) => {
    try {
      await fetch(`/api/notifications/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setSelectedNotify(null);
      fetchNotifications();
    } catch (err) {
      console.error("Lỗi xóa thông báo:", err);
    }
  };

  // Click ngoài → đóng dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifyRef.current && !notifyRef.current.contains(e.target)) {
        setOpenNotify(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={notifyRef}>
      {/* Nút chuông */}
      <button
        onClick={() => setOpenNotify(!openNotify)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition"
      >
        <i className="fa-solid fa-bell text-2xl text-green-700"></i>

        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            {unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {openNotify && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl rounded-xl border z-50">

          {/* Header */}
          <div className="flex justify-between items-center px-3 py-2 border-b">
            <h3 className="font-semibold text-gray-700 text-lg">Thông báo</h3>

            {unread > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:underline"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          {/* Danh sách */}
          <div className="max-h-80 overflow-y-auto p-3 space-y-3">
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                Không có thông báo nào
              </p>
            ) : (
              <>
                {notifications.slice(0, MAX_DISPLAY).map((n) => (
                  <button
                    key={n.id}
                    onClick={() => setSelectedNotify(n)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border-b"
                  >
                    <p className={`text-sm ${n.isRead ? "text-gray-600" : "text-gray-900 font-semibold"}`}>
                      {n.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </button>
                ))}

                {notifications.length > MAX_DISPLAY && (
                  <Link
                    to="/notifications"
                    className="block text-center text-blue-600 hover:underline py-2"
                  >
                    Xem tất cả thông báo
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/*POPUP CHI TIẾT THÔNG BÁO*/}
      {selectedNotify && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[200]">
          <div className="bg-white w-[400px] rounded-xl shadow-xl p-5">
            <h2 className="text-xl font-semibold mb-3">Chi tiết thông báo</h2>

            <p className="text-gray-800 text-sm whitespace-pre-line">
              {selectedNotify.content}
            </p>

            <p className="text-xs text-gray-400 mt-3">
              Thời gian: {new Date(selectedNotify.createdAt).toLocaleString()}
            </p>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setSelectedNotify(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Đóng
              </button>

              <button
                onClick={() => deleteNotification(selectedNotify.id)}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                Xóa thông báo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
