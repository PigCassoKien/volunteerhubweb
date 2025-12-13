import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import EventCard from "../../components/EventCard";

export default function SavedEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get("/favorites/my");
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleFavorite = async (eventId) => {
    await axios.post(`/favorites/toggle/${eventId}`);
    setEvents(prev => prev.filter(e => String(e.id) !== String(eventId)));
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">

      {/* Breadcrumb  */}
      <div className="absolute top-5 left-0 w-full z-20">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="text-gray-700 text-sm">
            <ol className="flex items-center space-x-2">
              <li>
                <a href="/" className="hover:text-gray-900">
                  Trang chủ
                </a>
              </li>
              <li>/</li>
              <li className="font-semibold text-gray-900">
                Sự kiện đã lưu
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/*Banner*/}
      <div
        className="relative h-[280px] bg-cover bg-center flex items-center justify-center text-center"
        style={{ backgroundImage: `url('/images/about-banner.jpg')` }}
      >
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]"></div>

        <div className="relative z-10 px-4">
          <h1 className="text-5xl font-bold text-emerald-900">Sự kiện đã lưu</h1>
          <p className="text-emerald-900 mt-4 text-lg max-w-3xl mx-auto leading-relaxed font-medium">
            Danh sách các sự kiện bạn đã yêu thích
          </p>
        </div>
      </div>

      {/*Content*/}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {loading && (
          <div className="text-center text-gray-600">Đang tải...</div>
        )}

        {!loading && events.length === 0 && (
          <div className="text-center text-gray-500 py-20 text-lg">
            Bạn chưa lưu sự kiện nào.
          </div>
        )}

        {!loading && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map(ev => (
              <EventCard
                key={ev.id}
                event={ev}
                isFavorited={true}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
