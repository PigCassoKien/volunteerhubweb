import React, { useEffect, useState } from "react";
import axios from "../../api/axios";

export default function TabSettings({ user }) {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [openMyEvents, setOpenMyEvents] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [msg, setMsg] = useState("");
  const [pendingRegs, setPendingRegs] = useState([]);
  const [approvedRegs, setApprovedRegs] = useState([]);

  const token = localStorage.getItem("token");

  // ĐỔI MẬT KHẨU
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || newPassword !== confirm) {
      setMsg("Vui lòng kiểm tra thông tin mật khẩu.");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/users/change-password", {
        oldPassword,
        newPassword,
      });
      setMsg("Đổi mật khẩu thành công.");
      setOldPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err) {
      setMsg(err.response?.data?.message || "Có lỗi khi đổi mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  // XOÁ TÀI KHOẢN
  const handleDeleteAccount = async () => {
    if (!window.confirm("Bạn chắc chắn muốn xóa tài khoản?")) return;
    setDeleting(true);
    try {
      await axios.delete("/users/delete-me");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth-changed"));
      window.location.href = "/";
    } catch (err) {
      alert(err.response?.data?.message || "Xóa tài khoản thất bại.");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const loadMyRegistrations = async () => {
    if (!token) return;
    try {
      const res = await axios.post("/registrations/history", {
        startDate: "2000-01-01T00:00:00",
        endDate: "2100-01-01T00:00:00",
        status: null,
        categoryId: null,
        sortBy: "dateDesc",
      });
      const regs = res.data || [];
      setPendingRegs(regs.filter((r) => r.status === "PENDING"));
      setApprovedRegs(regs.filter((r) => r.status === "APPROVED"));
    } catch (err) {
      console.error("Lỗi tải đăng ký:", err);
    }
  };

  useEffect(() => {
    loadMyRegistrations();
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Cài đặt tài khoản</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleChangePassword}
              disabled={loading}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg"
            >
              {loading ? "Đang..." : "Đổi mật khẩu"}
            </button>
          </div>
        </div>

        {msg && <p className="mt-3 text-sm text-red-600">{msg}</p>}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h4 className="text-lg font-semibold mb-3">Đăng ký sự kiện của tôi</h4>

        <div className="space-y-4">
          <div>
            <h5 className="font-medium">Đang chờ xác nhận</h5>
            <div className="space-y-2 mt-2">
              {pendingRegs.length === 0 ? (
                <p className="text-sm text-gray-500">Không có.</p>
              ) : (
                pendingRegs.map((r) => (
                  <div key={r.id} className="border p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{r.eventName}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(r.eventDate).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <div className="text-sm text-yellow-700">Chờ xác nhận</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h5 className="font-medium">Đã được duyệt</h5>
            <div className="space-y-2 mt-2">
              {approvedRegs.length === 0 ? (
                <p className="text-sm text-gray-500">Không có.</p>
              ) : (
                approvedRegs.map((r) => (
                  <div key={r.id} className="border p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{r.eventName}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(r.eventDate).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <div className="text-sm text-blue-700">Đã duyệt</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h4 className="text-lg font-semibold mb-3">Xóa tài khoản</h4>
        <p className="text-sm text-gray-500 mb-3">
          Hành động này là vĩnh viễn và không thể hoàn tác.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Xóa tài khoản
        </button>

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h5 className="text-lg font-semibold mb-3">
                Xác nhận xóa tài khoản
              </h5>
              <p className="text-sm text-gray-700 mb-4">
                Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn
                tác.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  {deleting ? "Đang xóa..." : "Xác nhận xóa"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
