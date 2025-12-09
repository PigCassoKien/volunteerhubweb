import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import AdminLayout from "../../components/AdminLayout";

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const lock = async (id) => {
    if (!confirm("Khóa tài khoản này?")) return;
    try {
      await axios.post(`/users/lock/${id}`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: "BANNED" } : u));
    } catch (err) { alert("Khóa thất bại"); }
  };

  const unlock = async (id) => {
    try {
      await axios.post(`/users/unlock/${id}`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: "ACTIVE" } : u));
    } catch (err) { alert("Mở khóa thất bại"); }
  };

  if (loading) return <div>Đang tải người dùng...</div>;
  if (!users.length) return <AdminLayout title="Quản lý người dùng"><div className="text-center text-gray-500">Chưa có người dùng</div></AdminLayout>;

  return (
    <AdminLayout title="Quản lý người dùng">
      <div className="space-y-2">
        {users.map(u => (
          <div key={u.id} className="bg-white p-3 rounded flex justify-between items-center">
            <div>
              <div className="font-medium">{u.fullName} <span className="text-sm text-gray-500">({u.email})</span></div>
              <div className="text-sm text-gray-500">Quyền:
                <select
                  className="ml-2 border rounded px-2 py-1 text-sm"
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
                      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: res.data.role } : x));
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
                <span className="ml-3">· Trạng thái: {u.status}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {u.status !== "BANNED" ? (
                <button onClick={() => lock(u.id)} className="px-3 py-1 border text-red-600 rounded">Khóa</button>
              ) : (
                <button onClick={() => unlock(u.id)} className="px-3 py-1 bg-emerald-600 text-white rounded">Mở khóa</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}