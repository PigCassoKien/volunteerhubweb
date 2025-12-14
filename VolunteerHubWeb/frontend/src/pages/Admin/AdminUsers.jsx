import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import AdminLayout from "../../components/AdminLayout";
import AdminUserModal from "../../components/AdminUserModal";
import Pagination from "../../components/Pagination";

const PAGE_SIZE = 8;

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);

  const load = async () => {
    try {
      const { data } = await axios.get("/users/all");
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      if (err?.response?.status === 403) {
        alert("Bạn không có quyền xem trang này. Đăng nhập bằng tài khoản ADMIN.");
        navigate("/", { replace: true });
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    setPage(1);
  }, [users.length]);

  const lock = async (id) => {
    if (!confirm("Khóa tài khoản này?")) return;
    try {
      await axios.post(`/users/lock/${id}`);
      setUsers(prev =>
        prev.map(u => u.id === id ? { ...u, status: "BANNED" } : u)
      );
    } catch {
      alert("Khóa thất bại");
    }
  };

  const unlock = async (id) => {
    try {
      await axios.post(`/users/unlock/${id}`);
      setUsers(prev =>
        prev.map(u => u.id === id ? { ...u, status: "ACTIVE" } : u)
      );
    } catch {
      alert("Mở khóa thất bại");
    }
  };

  /*Pagination */
  const totalPages = Math.ceil(users.length / PAGE_SIZE);

  const pagedUsers = users.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  if (loading) {
    return (
      <AdminLayout title="Quản lý người dùng">
        <div>Đang tải người dùng...</div>
      </AdminLayout>
    );
  }

  if (!users.length) {
    return (
      <AdminLayout title="Quản lý người dùng">
        <div className="text-center text-gray-500">Chưa có người dùng</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Quản lý người dùng">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-500">
          Tổng cộng <span className="font-medium text-gray-700">{users.length}</span> người dùng
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr] px-4 py-3 bg-green-100 text-sm font-medium text-gray-600">
          <div className="text-left">Người dùng</div>
          <div className="text-center">Vai trò</div>
          <div className="text-center">Trạng thái</div>
          <div className="text-right">Hành động</div>
        </div>

        {/* Rows */}
        <div className="divide-y">
          {pagedUsers.map((u) => {
            const statusStyle = {
              ACTIVE: "bg-emerald-100 text-emerald-700",
              BANNED: "bg-red-100 text-red-700",
            }[u.status] || "bg-gray-100 text-gray-600";

            const roleStyle = {
              ADMIN: "bg-purple-100 text-purple-700",
              EVENT_MANAGER: "bg-blue-100 text-blue-700",
              VOLUNTEER: "bg-gray-100 text-gray-700",
            }[u.role];

            return (
              <div
                key={u.id}
                className="grid grid-cols-[2fr_1.2fr_1fr_1fr] px-4 py-4 items-center hover:bg-gray-50 transition"
              >
                {/* User info */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center font-medium text-gray-600">
                    {u.fullName?.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">
                      {u.fullName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {u.email}
                    </div>
                  </div>
                </div>

                {/* Role */}
                <div className="flex justify-center">
                  <select
                    className={`px-2 py-1 text-sm rounded-md border ${roleStyle}`}
                    value={u.role}
                    onChange={async (e) => {
                      const newRole = e.target.value;
                      if (!confirm(`Thay đổi vai trò của ${u.fullName} sang ${newRole}?`)) {
                        e.target.value = u.role;
                        return;
                      }
                      try {
                        const payload = { userId: u.id, role: newRole };
                        const res = await axios.post("/users/assign-role", payload);
                        setUsers(prev =>
                          prev.map(x =>
                            x.id === u.id ? { ...x, role: res.data.role } : x
                          )
                        );
                      } catch (err) {
                        alert(err.response?.data?.message || "Cập nhật vai trò thất bại");
                        e.target.value = u.role;
                      }
                    }}
                  >
                    <option value="VOLUNTEER">VOLUNTEER</option>
                    <option value="EVENT_MANAGER">EVENT_MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                {/* Status */}
                <div className="flex justify-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium
      ${u.verificationStatus === "VERIFIED"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                      }`}
                  >
                    {u.verificationStatus === "VERIFIED"
                      ? "Đã xác thực"
                      : "Chưa xác thực"}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  {/* View detail */}
                  <button
                    onClick={() => setSelectedUser(u)}
                    className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
                  >
                    Xem
                  </button>

                  {u.status !== "BANNED" ? (
                    <button
                      onClick={() => lock(u.id)}
                      className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-md hover:bg-red-50"
                    >
                      Khóa
                    </button>
                  ) : (
                    <button
                      onClick={() => unlock(u.id)}
                      className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                    >
                      Mở khóa
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6">
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={setPage}
        />
      </div>

      {selectedUser && (
        <AdminUserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </AdminLayout>
  );
}
