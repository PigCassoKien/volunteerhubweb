import { FiMail, FiPhone, FiMapPin, FiX } from "react-icons/fi";

export default function AdminUserModal({ user, onClose }) {
  if (!user) return null;

  const avatarUrl = user.avatarFile
    ? `/uploads/${user.avatarFile}`
    : "https://i.pravatar.cc/200";

  const statusLabel = {
    ACTIVE: "Hoạt động",
    INACTIVE: "Chưa kích hoạt",
    BANNED: "Bị khóa"
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-lg relative">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-bold">Thông tin tài khoản</h2>
          <button onClick={onClose}>
            <FiX size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* LEFT */}
          <div className="text-center">
            <img
              src={avatarUrl}
              className="w-32 h-32 rounded-full object-cover mx-auto"
            />

            <h3 className="font-bold text-lg mt-4">{user.fullName}</h3>

            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium
                ${user.status === "ACTIVE"
                  ? "bg-green-100 text-green-700"
                  : user.status === "INACTIVE"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
            >
              {statusLabel[user.status]}
            </span>
          </div>

          {/* RIGHT */}
          <div className="md:col-span-2 space-y-4 text-sm text-gray-700">
            <p className="flex items-center gap-2">
              <FiMail /> {user.email}
            </p>
            <p className="flex items-center gap-2">
              <FiPhone /> {user.phoneNumber || "Chưa cập nhật"}
            </p>
            <p className="flex items-center gap-2">
              <FiMapPin /> {user.address || "Chưa cập nhật"}
            </p>

            <p className="text-gray-500">
              Ngày tạo:{" "}
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                : "Không rõ"}
            </p>

            <p className="text-gray-500">
              Lần đăng nhập cuối:{" "}
              {user.lastLoginAt
                ? new Date(user.lastLoginAt).toLocaleString("vi-VN")
                : "Chưa từng"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
