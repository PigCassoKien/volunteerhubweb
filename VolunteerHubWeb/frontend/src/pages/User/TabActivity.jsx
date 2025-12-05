import { useEffect, useState } from "react";
import axios from "axios";
import { FiCalendar, FiClock } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function TabActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const fetchHistory = async () => {
      try {
        const res = await axios.post(
          "/api/registrations/history",
          {
            startDate: "2000-01-01",
            endDate: "2100-01-01",
            status: null,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setActivities(res.data);
      } catch (error) {
        console.error("Lỗi tải lịch sử:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [token]);

  const handleCancel = async (regId) => {
    try {
      const res = await axios.put(
        `/api/registrations/cancel/${regId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Đã hủy đăng ký!");
      setActivities(prev =>
        prev.map(a => (a.id === regId ? res.data : a))
      );
    } catch (err) {
      alert("Không thể hủy.");
    }
  };

  const getStatusText = (s) => {
    switch (s) {
      case "APPROVED": return "Đã đăng ký";
      case "CANCELLED": return "Đã hủy";
      case "COMPLETED": return "Hoàn thành";
      default: return s;
    }
  };

  const getBadge = (s) => {
    switch (s) {
      case "APPROVED": return "bg-blue-100 text-blue-700";
      case "CANCELLED": return "bg-red-100 text-red-700";
      case "COMPLETED": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) return <p className="text-center">Đang tải lịch sử...</p>;
  if (activities.length === 0) return <p className="text-center text-gray-500">Không có hoạt động.</p>;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FiClock /> Hoạt động gần đây
      </h2>

      <div className="flex flex-col gap-3">
        {activities.map((item) => {
          const eventStarted = new Date(item.eventDate) <= new Date();

          return (
            <div key={item.id} className="border rounded-xl p-4 flex justify-between items-center">
              <div>
                <Link to={`/events/${item.eventId}`}>
                  <p className="font-medium hover:underline cursor-pointer">
                    {item.eventName}
                  </p>
                </Link>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <FiCalendar /> {new Date(item.eventDate).toLocaleDateString("vi-VN")}
                </p>
              </div>

              <div className="flex gap-3 items-center">
                <span className={`px-3 py-1 rounded-lg text-sm ${getBadge(item.status)}`}>
                  {getStatusText(item.status)}
                </span>

                {item.status === "APPROVED" && !eventStarted && (
                  <button
                    onClick={() => handleCancel(item.id)}
                    className="px-3 py-1 text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
                  >
                    Hủy
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
