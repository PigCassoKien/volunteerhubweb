import { useState } from "react";
import axios from "axios";
import { FiLock, FiShield, FiTrash2 } from "react-icons/fi";

export default function TabSettings({ user }) {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [msg, setMsg] = useState("");

  const token = localStorage.getItem("token");

  // ĐỔI MẬT KHẨU
  const handleChangePassword = async () => {
    if (newPassword !== confirm) {
      setMsg("Mật khẩu mới không trùng khớp!");
      return;
    }

    try {
      setLoading(true);
      setMsg("");

      await axios.put(
        "/api/users/change-password",
        { oldPassword, newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMsg("Đổi mật khẩu thành công!");
      setTimeout(() => setShowModal(false), 1000);
    } catch {
      setMsg("Mật khẩu cũ không chính xác!");
    } finally {
      setLoading(false);
    }
  };

  // XOÁ TÀI KHOẢN
  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);

      await axios.delete(`/api/users/delete/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Logout
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      alert("Tài khoản đã xoá vĩnh viễn.");
      window.location.href = "/";
    } catch (err) {
      alert("Không thể xoá tài khoản!");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-6">Cài đặt tài khoản</h3>

      {/*QUYỀN RIÊNG TƯ*/}
      <div className="bg-gray-50 p-5 rounded-xl mb-6">
        <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <FiShield className="text-green-600" /> Quyền riêng tư
        </h4>

        <div className="flex justify-between items-center py-2">
          <span>Hiển thị thông tin công khai</span>
          <input type="checkbox" className="toggle-switch" defaultChecked />
        </div>

        <div className="flex justify-between items-center py-2">
          <span>Nhận thông báo email</span>
          <input type="checkbox" className="toggle-switch" defaultChecked />
        </div>
      </div>

      {/*BẢO MẬT*/}
      <div className="bg-gray-50 p-5 rounded-xl mb-6">
        <h4 className="font-semibold text-gray-700 mb-3 flex gap-2 items-center">
          <FiLock /> Bảo mật
        </h4>

        {/* Hai nút một hàng */}
        <div className="flex justify-center gap-4">

          <button
            onClick={() => setShowModal(true)}
            className="w-1/3 border border-green-500 rounded-lg p-3 text-center text-green-600"
          >
            Đổi mật khẩu
          </button>

          <button className="w-1/3 border border-green-500 rounded-lg p-3 text-center text-green-600">
            Xác thực tài khoản
          </button>

        </div>

        {/* Nút xoá tài khoản */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-1/2 border border-red-500 rounded-lg p-3 text-center text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
          >
            <FiTrash2 /> Xoá tài khoản
          </button>
        </div>
      </div>

      {/*MODAL ĐỔI MẬT KHẨU*/}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Đổi mật khẩu</h3>

            <div className="mb-3">
              <label className="text-sm font-medium">Mật khẩu hiện tại</label>
              <input
                type="password"
                className="w-full border rounded-lg p-2 mt-1"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="text-sm font-medium">Mật khẩu mới</label>
              <input
                type="password"
                className="w-full border rounded-lg p-2 mt-1"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium">Nhập lại mật khẩu mới</label>
              <input
                type="password"
                className="w-full border rounded-lg p-2 mt-1"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>

            {msg && <p className="text-red-500 text-sm mb-3">{msg}</p>}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border"
              >
                Hủy
              </button>

              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-green-600 text-white"
              >
                {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/*MODAL XOÁ TÀI KHOẢN */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-red-600">
              Xác nhận xoá tài khoản
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              Bạn có chắc chắn muốn xoá tài khoản?
              <b>Hành động này không thể hoàn tác.</b>
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg border"
              >
                Hủy
              </button>

              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white"
              >
                {deleting ? "Đang xoá..." : "Xoá vĩnh viễn"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
