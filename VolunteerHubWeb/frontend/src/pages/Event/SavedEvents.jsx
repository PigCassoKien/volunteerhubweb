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

  if (loading) return <div>Đang tải...</div>;
  if (!events.length) return <div className="text-center text-gray-500">Không có sự kiện đã lưu.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {events.map(ev => (
        <EventCard key={ev.id} event={ev} isFavorited={true} onToggleFavorite={toggleFavorite} />
      ))}
    </div>
  );
}