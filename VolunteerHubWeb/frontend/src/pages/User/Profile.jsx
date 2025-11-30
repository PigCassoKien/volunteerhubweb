import { useEffect, useState } from "react";
import axios from "axios";
import { FiEdit, FiUser, FiMail, FiPhone, FiMapPin, FiLock } from "react-icons/fi";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/users/get/1", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setForm(res.data);
      } catch (err) {
        console.error("Lỗi tải thông tin người dùng:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await axios.put(
        `http://localhost:8080/api/users/update/${user.id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(form);
      setEditMode(false);
      alert("Cập nhật thông tin thành công!");
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
      alert("Không thể cập nhật thông tin.");
    }
  };

  if (loading) return <p className="text-center mt-10">Đang tải thông tin...</p>;

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="bg-white shadow-lg rounded-xl p-8">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <img
              src={user.avatarFile || "/images/default-avatar.png"}
              alt="Avatar"
              className="w-32 h-32 rounded-full object-cover border-4 border-emerald-500"
            />

            <label
              htmlFor="avatar-upload"
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white text-sm rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition"
            >
              Đổi ảnh
            </label>

            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const formData = new FormData();
                formData.append("file", file);
                try {
                  const res = await axios.post(
                    `http://localhost:8443/api/users/upload-avatar/${user.id}`,
                    formData,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                      },
                    }
                  );
                  setUser({ ...user, avatarFile: res.data });
                  alert("Cập nhật ảnh thành công!");
                } catch (err) {
                  console.error("Lỗi upload ảnh:", err);
                  alert("Không thể upload ảnh.");
                }
              }}
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{user.fullName}</h2>
            <p className="text-gray-500">{user.role}</p>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className="ml-auto px-4 py-2 flex items-center gap-2 border border-emerald-600 text-emerald-600 rounded-full hover:bg-emerald-50 transition"
          >
            <FiEdit /> {editMode ? "Huỷ" : "Chỉnh sửa"}
          </button>
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-3">
            <FiMail className="text-emerald-600" />
            <input
              name="email"
              disabled
              value={form.email}
              className="flex-1 border-none bg-transparent text-gray-600"
            />
          </div>

          <div className="flex items-center gap-3">
            <FiUser className="text-emerald-600" />
            <input
              name="fullName"
              disabled={!editMode}
              value={form.fullName}
              onChange={handleChange}
              className={`flex-1 p-2 rounded-md ${
                editMode ? "border border-gray-300" : "border-none bg-transparent text-gray-600"
              }`}
            />
          </div>

          <div className="flex items-center gap-3">
            <FiPhone className="text-emerald-600" />
            <input
              name="phoneNumber"
              disabled={!editMode}
              value={form.phoneNumber}
              onChange={handleChange}
              className={`flex-1 p-2 rounded-md ${
                editMode ? "border border-gray-300" : "border-none bg-transparent text-gray-600"
              }`}
            />
          </div>

          <div className="flex items-center gap-3">
            <FiMapPin className="text-emerald-600" />
            <input
              name="address"
              disabled={!editMode}
              value={form.address}
              onChange={handleChange}
              className={`flex-1 p-2 rounded-md ${
                editMode ? "border border-gray-300" : "border-none bg-transparent text-gray-600"
              }`}
            />
          </div>

          {editMode && (
            <div className="pt-4">
              <button
                onClick={handleSave}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
              >
                Lưu thay đổi
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-white shadow-lg rounded-xl p-8">
        <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <FiLock className="text-emerald-600" /> Đổi mật khẩu
        </h3>
        <ChangePasswordForm />
      </div>
    </div>
  );
};

//đổi mật khẩu
const ChangePasswordForm = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const token = localStorage.getItem("token");

  const handleChangePassword = async () => {
    try {
      await axios.put(
        "http://localhost:8080/api/users/change-password",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Đổi mật khẩu thành công!");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      console.error("Lỗi khi đổi mật khẩu:", err);
      alert("Không thể đổi mật khẩu.");
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="password"
        placeholder="Mật khẩu cũ"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
        className="w-full border border-gray-300 rounded-md p-2"
      />
      <input
        type="password"
        placeholder="Mật khẩu mới"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full border border-gray-300 rounded-md p-2"
      />
      <button
        onClick={handleChangePassword}
        className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 transition"
      >
        Cập nhật mật khẩu
      </button>
    </div>
  );
};

export default Profile;
