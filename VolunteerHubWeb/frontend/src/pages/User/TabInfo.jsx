import { FiEdit3 } from "react-icons/fi";
import axios from "axios";
import { useState } from "react";

export default function TabInfo({ user, setUser, saving, setSaving }) {
  const [editing, setEditing] = useState(false);

  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const handleSave = () => {
    setSaving(true);

    axios
      .put(
        `/api/users/update/${storedUser.id}`,
        {
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          address: user.address,
          publicProfile: user.publicProfile,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setSaving(false);
        setEditing(false);

        // CẬP NHẬT USER MỚI 
        const updatedUser = res.data;
        setUser(updatedUser);

        // CẬP NHẬT localStorage
        localStorage.setItem("user", JSON.stringify(updatedUser));

        window.dispatchEvent(new Event("auth-changed"));

        alert("Cập nhật thành công!");
      })
      .catch(() => {
        setSaving(false);
        alert("Có lỗi xảy ra!");
      });
  };

  return (
    <div>
      {/* Header + Button */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Thông tin cá nhân</h3>

        {editing ? (
          <button
            onClick={handleSave}
            className="bg-[#06C270] text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FiEdit3 />
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-[#06C270] border border-[#06C270] px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FiEdit3 /> Chỉnh sửa
          </button>
        )}
      </div>

      {/* GRID FORM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Họ tên */}
        <div>
          <label className="text-gray-600">Họ và tên</label>
          <input
            disabled={!editing}
            value={user.fullName}
            onChange={(e) =>
              setUser({ ...user, fullName: e.target.value })
            }
            className={`w-full mt-1 px-4 py-2 rounded-lg border ${editing ? "bg-white" : "bg-gray-100"
              }`}
          />
        </div>

        {/* Email */}
        <div>
          <label className="text-gray-600">Email</label>
          <input
            disabled
            value={user.email}
            className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 border"
          />
        </div>

        {/* Số điện thoại */}
        <div>
          <label className="text-gray-600">Số điện thoại</label>
          <input
            disabled={!editing}
            value={user.phoneNumber || ""}
            onChange={(e) =>
              setUser({ ...user, phoneNumber: e.target.value })
            }
            className={`w-full mt-1 px-4 py-2 rounded-lg border ${editing ? "bg-white" : "bg-gray-100"
              }`}
          />
        </div>

        {/* Địa chỉ */}
        <div>
          <label className="text-gray-600">Địa chỉ</label>
          <input
            disabled={!editing}
            value={user.address || ""}
            onChange={(e) =>
              setUser({ ...user, address: e.target.value })
            }
            className={`w-full mt-1 px-4 py-2 rounded-lg border ${editing ? "bg-white" : "bg-gray-100"
              }`}
          />
        </div>
      </div>

      {/* Giới thiệu */}
      <div className="mt-6">
        <label className="text-gray-600">Giới thiệu bản thân</label>
        <textarea
          disabled={!editing}
          value={user.publicProfile || ""}
          onChange={(e) =>
            setUser({ ...user, publicProfile: e.target.value })
          }
          rows={4}
          className={`w-full mt-1 px-4 py-2 rounded-lg border ${editing ? "bg-white" : "bg-gray-100"
            }`}
        />
      </div>
    </div>
  );
}
