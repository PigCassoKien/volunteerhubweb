import React, { useState } from "react";
import axios from "../../api/axios";
import { Link } from "react-router-dom";
import EventCard from "../../components/EventCard";

export default function EventListManager({ events = [], onEdit, onRefresh }) {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa sự kiện?")) return;
    try {
      await axios.delete(`/events/delete/${id}`);
      onRefresh?.();
    } catch (err) {
      alert(err.response?.data?.message || "Xóa thất bại");
    }
  };

  const totalPages = Math.max(1, Math.ceil((events?.length || 0) / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const paged = events.slice(start, start + PAGE_SIZE);

  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h3 className="font-semibold mb-3">Danh sách sự kiện của bạn</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paged.map((ev) => (
          <div key={ev.id} className="flex flex-col">
            <EventCard event={ev} />

            <div className="mt-3 flex items-center justify-between gap-2">
              <Link to={`/manager/events/${ev.id}`} className="flex-1 px-3 py-2 text-center border rounded bg-white hover:bg-gray-50">Chi tiết</Link>
              <button onClick={() => onEdit(ev)} className="flex-1 px-3 py-2 border rounded bg-white hover:bg-gray-50">Sửa</button>
              <button onClick={() => handleDelete(ev.id)} className="flex-1 px-3 py-2 text-red-600 border rounded bg-white hover:bg-gray-50">Xóa</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
        <div className="text-sm text-gray-600">Trang {page} / {totalPages}</div>
        <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  );
}