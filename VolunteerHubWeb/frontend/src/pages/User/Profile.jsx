import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import { getFileUrl } from "../../utils/files";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiEdit3,
  FiCamera,
} from "react-icons/fi";

import TabInfo from "./TabInfo";
import TabActivity from "./TabActivity";
// import TabAchievement from "./TabAchievement";
import TabSettings from "./TabSettings";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [activeTab, setActiveTab] = useState("info");

  const fileInputRef = useRef();

  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const params = useParams();
  const viewingId = params?.id ? Number(params.id) : null;
  const isOwner = !viewingId || (storedUser && viewingId === storedUser.id);

  useEffect(() => {
    const targetId = viewingId || (storedUser ? storedUser.id : null);
    if (!targetId) {
      setLoading(false);
      return;
    }

    api.get(`/users/get/${targetId}`)
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [viewingId]);

  // UPLOAD AVATAR
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await api.post(
        `/users/upload-avatar/${storedUser.id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setUser({ ...user, avatarFile: res.data.fileName });
      alert("Cập nhật ảnh đại diện thành công!");
    } catch (err) {
      alert("Tải ảnh thất bại!");
    }
  };

  if (loading)
    return <div className="text-center p-10 text-xl">Đang tải thông tin...</div>;

  if (!user)
    return (
      <div className="text-center p-10 text-xl text-red-600">
        Không thể tải thông tin người dùng.
      </div>
    );

  const avatarUrl = user.avatarFile
    ? getFileUrl(user.avatarFile)
    : "https://i.pravatar.cc/200";

  return (
    <div className="bg-[#F0FDF4] min-h-screen p-5">

      {/* Breadcrumb */}
      <div className="w-full mb-6">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="text-gray-600 text-sm">
            <ol className="flex items-center space-x-2">
              <li>
                <a href="/" className="hover:text-gray-800">Trang chủ</a>
              </li>
              <li className="text-gray-400">/</li>
              <li className="font-semibold text-gray-800">Thông tin cá nhân</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[560px]">

        {/* LEFT CARD */}
        <div className="bg-white rounded-2xl shadow p-8 h-full">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <img
                src={avatarUrl}
                className="w-32 h-32 object-cover rounded-full"
              />

              {isOwner && (
                <>
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow"
                  >
                    <FiCamera className="text-gray-600" />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                  />
                </>
              )}
            </div>

            <h2 className="text-xl font-bold mt-4">{user.fullName}</h2>

            <span className="bg-[#D1FADF] text-[#027A48] px-4 py-1 rounded-full mt-2 text-sm">
              {user.role === "ADMIN" ? "Quản trị viên" : "Tình nguyện viên"}
            </span>

            <p className="text-gray-600 mt-4 px-2">
              {user.publicProfile ||
                "Tôi là một tình nguyện viên nhiệt huyết, luôn mong muốn đóng góp cho cộng đồng."}
            </p>

            <div className="mt-6 space-y-2 text-gray-700 text-sm">
              <p className="flex items-center gap-2">
                <FiMail /> {user.email}
              </p>
              <p className="flex items-center gap-2">
                <FiPhone /> {user.phoneNumber || "Chưa cập nhật"}
              </p>
              <p className="flex items-center gap-2">
                <FiMapPin /> {user.address || "Chưa cập nhật"}
              </p>
            </div>

            <p className="text-gray-500 text-sm mt-4">
              Tham gia từ:{" "}
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                : "Không rõ"}
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full">

          {/* TABS */}
          <div className="bg-white rounded-xl shadow flex p-3 gap-2 w-full">
            {[
              { key: "info", label: "Thông tin" },
              { key: "activity", label: "Hoạt động" },
              { key: "achievement", label: "Thành tích" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-6 py-2 rounded-lg font-semibold text-center transition
                  ${activeTab === tab.key
                    ? "bg-[#06C270] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}

            {/* Settings tab only for owner */}
            {isOwner && (
              <button
                onClick={() => setActiveTab("settings")}
                className={`flex-1 px-6 py-2 rounded-lg font-semibold text-center transition
                  ${activeTab === "settings"
                    ? "bg-[#06C270] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                  }
                `}
              >
                Cài đặt
              </button>
            )}
          </div>

          {/* CONTENT */}
          <div className="bg-white rounded-2xl shadow p-8 h-full">
            {activeTab === "info" && (
              <TabInfo user={user} setUser={setUser} saving={saving} setSaving={setSaving} isOwner={isOwner} />
            )}
            {activeTab === "activity" && <TabActivity user={user} />}
            {activeTab === "achievement" && (
              <div className="text-center text-gray-500">Tính năng đang phát triển.</div>
            )}
            {activeTab === "settings" && isOwner && <TabSettings user={user} />}
          </div>

        </div>
      </div>
    </div>
  );
}
