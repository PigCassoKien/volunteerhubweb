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

  const [detail, setDetail] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const viewDetail = async (id) => {
    try {
      const { data } = await axios.get(`/registrations/get/${id}`);
      setDetail(data);
      setShowDetail(true);
    } catch (err) {
      alert('Không tải được thông tin đăng ký');
    }
  };

  return (
    <>
      <div className="bg-white rounded p-4 shadow">
        <div className="md:flex md:gap-6">
          {/* Left: event selector / list */}
          <div className="md:w-1/3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Sự kiện</h4>
              <button
                onClick={() => { setSelected(null); setRegistrations([]); }}
                className="text-sm text-gray-500 hover:underline"
              >
                Bỏ chọn
              </button>
            </div>

            <select
              value={selected || ""}
              onChange={(e) => {
                const id = e.target.value || null;
                setSelected(id);
                if (id) loadRegs(id);
                else setRegistrations([]);
              }}
              className="w-full border rounded px-3 py-2 mb-3"
            >
              <option value="">-- Chọn sự kiện --</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.title} — {new Date(ev.startDate).toLocaleString()}</option>
              ))}
            </select>

            <div className="space-y-2">
              {events.length === 0 && (
                <div className="text-sm text-gray-500">Bạn chưa có sự kiện nào.</div>
              )}

              {selected ? (
                (() => {
                  const ev = events.find(e => String(e.id) === String(selected));
                  if (!ev) return <div className="text-sm text-gray-500">Sự kiện không tồn tại.</div>;
                  return (
                    <div key={ev.id} className={`p-2 rounded border border-emerald-600 bg-emerald-50`}>
                      <div className="font-medium text-sm">{ev.title}</div>
                      <div className="text-xs text-gray-500">{new Date(ev.startDate).toLocaleString()}</div>
                      <div className="mt-2 flex gap-2">
                        <button onClick={() => exportList(ev.id)} className="text-sm px-2 py-1 bg-blue-600 text-white rounded">Xuất</button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                events.slice(0, 6).map(ev => (
                  <div key={ev.id} className={`p-2 rounded border ${selected == ev.id ? 'border-emerald-600 bg-emerald-50' : 'border-gray-100'}`}>
                    <div className="font-medium text-sm">{ev.title}</div>
                    <div className="text-xs text-gray-500">{new Date(ev.startDate).toLocaleString()}</div>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => exportList(ev.id)} className="text-sm px-2 py-1 bg-blue-600 text-white rounded">Xuất</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: registrations */}
          <div className="md:w-2/3 mt-6 md:mt-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Danh sách đăng ký</h4>
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-600">{selected ? `Sự kiện: ${events.find(e => String(e.id) === String(selected))?.title || ''}` : 'Chưa chọn sự kiện'}</div>
                <button
                  onClick={() => selected && exportList(selected)}
                  disabled={!selected}
                  className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
                >
                  Xuất danh sách
                </button>
              </div>
            </div>

            {(!selected) ? (
              <div className="p-6 border rounded text-gray-500">Vui lòng chọn một sự kiện để xem danh sách đăng ký.</div>
            ) : (
              <div className="space-y-2">
                {registrations.length === 0 && (
                  <div className="p-4 border rounded text-gray-500">Chưa có đăng ký cho sự kiện này.</div>
                )}

                {registrations.map(r => (
                  <div key={r.id} className="border rounded p-3 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{r.fullName} {r.contactEmail ? `(${r.contactEmail})` : ''}</div>
                      <div className="text-sm text-gray-500">Trạng thái: {r.status}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => viewDetail(r.id)} className="px-3 py-1 border rounded text-sm">Xem</button>
                      {r.status !== "APPROVED" && <button onClick={() => approve(r.id)} className="px-3 py-1 bg-emerald-600 text-white rounded text-sm">Duyệt</button>}
                      {r.status === "APPROVED" && <button onClick={() => markComplete(r.id)} className="px-3 py-1 border rounded text-sm">Hoàn thành</button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <RegistrationDetailModal open={showDetail} onClose={() => setShowDetail(false)} registration={detail} />
    </>
  );
}

// Detail modal (rendered after component to keep top-level return small)
export function RegistrationDetailModal({ open, onClose, registration }) {
  if (!open || !registration) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white max-w-2xl w-full p-6 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Chi tiết đăng ký</h3>
          <button onClick={onClose} className="text-gray-600">Đóng</button>
        </div>
        <div className="space-y-2">
          <div><strong>Họ và tên:</strong> {registration.fullName}</div>
          <div><strong>Email liên hệ:</strong> {registration.contactEmail}</div>
          <div><strong>Phone:</strong> {registration.phone}</div>
          <div><strong>Giới tính:</strong> {registration.gender}</div>
          <div><strong>Ngày sinh:</strong> {registration.dateOfBirth || '-'}</div>
          <div><strong>Địa chỉ:</strong> {registration.address}</div>
          <div><strong>Nghề nghiệp:</strong> {registration.occupation}</div>
          <div><strong>Trường:</strong> {registration.school}</div>
          <div><strong>Giới thiệu:</strong> <div className="whitespace-pre-wrap">{registration.about}</div></div>
          <div><strong>Kinh nghiệm:</strong> <div className="whitespace-pre-wrap">{registration.experience}</div></div>
          <div><strong>Kỹ năng:</strong> <div className="whitespace-pre-wrap">{registration.skills}</div></div>
          <div><strong>Xác nhận:</strong> {registration.confirmation ? 'Có' : 'Không'}</div>
          {registration.cancellationReason && (
            <div><strong>Lý do huỷ:</strong> <div className="whitespace-pre-wrap">{registration.cancellationReason}</div></div>
          )}
          {registration.canceledAt && (
            <div><strong>Thời gian huỷ:</strong> {new Date(registration.canceledAt).toLocaleString()}</div>
          )}
          {registration.canceledByName && (
            <div><strong>Huỷ bởi:</strong> {registration.canceledByName}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// prop types
RegistrationsManager.propTypes = { events: PropTypes.array };
RegistrationDetailModal.propTypes = { open: PropTypes.bool, onClose: PropTypes.func, registration: PropTypes.object };