import React from "react";
import axios from "../../api/axios";
import { Link } from "react-router-dom";

export default function EventListManager({ events = [], onEdit, onRefresh }) {
  const handleDelete = async (id) => {
    if (!confirm("Xóa sự kiện?")) return;
    try {
      await axios.delete(`/events/delete/${id}`);
      onRefresh?.();
    } catch (err) {
      alert(err.response?.data?.message || "Xóa thất bại");
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h3 className="font-semibold mb-3">Danh sách sự kiện của bạn</h3>
      <div className="space-y-3">
        {events.map((ev) => (
          <div key={ev.id} className="flex justify-between items-center border rounded p-3">
            <div>
              <div className="font-medium">{ev.title}</div>
              <div className="text-sm text-gray-500">{ev.location} · {new Date(ev.startDate).toLocaleString()}</div>
            </div>
            <div className="flex gap-2">
              <Link to={`/manager/events/${ev.id}`} className="px-3 py-1 border rounded">Chi tiết</Link>
              <button onClick={() => onEdit(ev)} className="px-3 py-1 border rounded">Sửa</button>
              <button onClick={() => handleDelete(ev.id)} className="px-3 py-1 text-red-600 border rounded">Xóa</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}