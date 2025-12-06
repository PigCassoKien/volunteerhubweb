import React, { useState } from "react";
import axios from "../../api/axios";
import PropTypes from "prop-types";

export default function RegistrationsManager({ events = [] }) {
  const [selected, setSelected] = useState(null);
  const [registrations, setRegistrations] = useState([]);

  const loadRegs = async (eventId) => {
    try {
      const { data } = await axios.get(`/registrations/event/${eventId}`);
      setRegistrations(data || []);
    } catch (err) {
      alert("Không tải được đăng ký");
    }
  };

  const approve = async (id) => {
    try {
      await axios.put(`/registrations/approve/${id}`);
      if (selected) loadRegs(selected);
    } catch (err) { alert("Duyệt thất bại"); }
  };

  const markComplete = async (id) => {
    try {
      await axios.put(`/registrations/complete/${id}`);
      if (selected) loadRegs(selected);
    } catch (err) { alert("Cập nhật thất bại"); }
  };

  const exportList = async (eventId) => {
    try {
      const res = await axios.get(`/reports/export-participants/${eventId}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `participants_event_${eventId}.xlsx`;
      a.click();
    } catch (err) { alert("Xuất thất bại"); }
  };

  return (
    <div>
      <select className="border p-2 rounded w-full mb-3" onChange={(e) => { const id = e.target.value; setSelected(id); if (id) loadRegs(id); }}>
        <option value="">Chọn sự kiện</option>
        {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
      </select>

      {selected && (
        <>
          <div className="flex justify-end gap-2 mb-3">
            <button onClick={() => exportList(selected)} className="px-3 py-1 bg-blue-600 text-white rounded">Xuất danh sách</button>
          </div>

          <div className="space-y-2">
            {registrations.map(r => (
              <div key={r.id} className="border rounded p-3 flex justify-between items-center">
                <div>
                  <div className="font-medium">{r.fullName} ({r.contactEmail})</div>
                  <div className="text-sm text-gray-500">Trạng thái: {r.status}</div>
                </div>
                <div className="flex gap-2">
                  {r.status !== "APPROVED" && <button onClick={() => approve(r.id)} className="px-3 py-1 bg-emerald-600 text-white rounded">Duyệt</button>}
                  {r.status === "APPROVED" && <button onClick={() => markComplete(r.id)} className="px-3 py-1 border rounded">Hoàn thành</button>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

RegistrationsManager.propTypes = { events: PropTypes.array };