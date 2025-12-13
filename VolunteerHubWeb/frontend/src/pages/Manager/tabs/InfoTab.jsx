import React, { useState } from "react";

export default function InfoTab({ event, registrations }) {
  const recipientsCount = registrations.filter((r) => r.status === "APPROVED").length;
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyContent, setNotifyContent] = useState("");
  const [notifyResult, setNotifyResult] = useState(null);
  const [notifyLoading, setNotifyLoading] = useState(false);
  const openNotifyModal = () => {
    setNotifyContent(`Thông báo từ ban tổ chức: ${event?.title || ""}\n\n`);
    setNotifyResult(null);
    setShowNotifyModal(true);
  };

  const sendCustomNotification = async () => {
    if (!notifyContent || !notifyContent.trim()) {
      setNotifyResult({ ok: false, msg: "Nội dung trống" });
      return;
    }
    if (!confirm(`Gửi thông báo tới ${recipientsCount} thành viên đã duyệt?`)) return;
    setNotifyLoading(true);
    setNotifyResult(null);
    try {
      await axios.post("/notifications/custom", { eventId: id, content: notifyContent.trim() });
      setNotifyResult({ ok: true, msg: `Đã gửi tới ${recipientsCount} người` });
      // auto close shortly
      setTimeout(() => {
        setShowNotifyModal(false);
        setNotifyContent("");
      }, 900);
    } catch (err) {
      console.error("Gửi thông báo thất bại", err);
      setNotifyResult({ ok: false, msg: err.response?.data?.message || "Gửi thất bại" });
    } finally {
      setNotifyLoading(false);
    }
  };
  return (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="font-semibold mb-3">Chi tiết sự kiện</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-500">Địa điểm</div>
          <div className="font-medium">{event.location}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Thời gian</div>
          <div className="font-medium">{new Date(event.startDate).toLocaleString()} - {new Date(event.endDate).toLocaleString()}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Danh mục</div>
          <div className="font-medium">{event.category?.name || "-"}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Số lượng tối đa</div>
          <div className="font-medium">{event.maxParticipants || "N/A"}</div>
        </div>
        <div className="md:col-span-2">
          <div className="text-sm text-gray-500">Người tạo</div>
          <div className="font-medium">{event.createdByFullName || "-"}</div>
        </div>

        <div>
          <div className="text-sm text-gray-500">Người nhận</div>
          <div className="font-medium">{recipientsCount} thành viên đã được duyệt</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openNotifyModal}
            className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Soạn & Gửi thông báo
          </button>
          <button
            onClick={() => { setNotifyContent(""); setNotifyResult(null); setShowNotifyModal(true); }}
            className="px-3 py-2 rounded border text-gray-700 bg-white"
          >
            Soạn nhanh
          </button>
        </div>

        {/* Notify modal */}
        {showNotifyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-30" onClick={() => setShowNotifyModal(false)} />
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl p-4 z-60">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">Gửi thông báo tới {recipientsCount} thành viên</h4>
                <button onClick={() => setShowNotifyModal(false)} className="text-gray-500">✕</button>
              </div>
              <textarea
                value={notifyContent}
                onChange={(e) => setNotifyContent(e.target.value)}
                rows={6}
                className="w-full border p-2 rounded mb-3"
                placeholder="Nhập nội dung thông báo..."
              />
              <div className="text-sm text-gray-500 mb-3">Xem trước:</div>
              <div className="border rounded p-3 mb-3 bg-gray-50 text-sm whitespace-pre-wrap">{notifyContent || <span className="text-gray-400">(chưa có nội dung)</span>}</div>
              {notifyResult && (
                <div className={`mb-3 text-sm ${notifyResult.ok ? "text-green-600" : "text-red-600"}`}>{notifyResult.msg}</div>
              )}
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowNotifyModal(false)} className="px-4 py-2 rounded border">Hủy</button>
                <button
                  onClick={sendCustomNotification}
                  disabled={notifyLoading || recipientsCount === 0}
                  className={`px-4 py-2 rounded ${notifyLoading ? "bg-gray-300 text-gray-700" : "bg-emerald-600 text-white"}`}
                >
                  {notifyLoading ? "Đang gửi..." : `Gửi (${recipientsCount})`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
