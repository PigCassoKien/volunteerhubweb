import React from "react";

const RegistrationForm = ({ formData, setFormData, onClose, onSubmit }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-[500px] shadow-lg relative">

        <h2 className="text-xl font-bold mb-4">Thông tin đăng ký</h2>

        {/* Form */}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Họ và tên"
            className="w-full p-2 border rounded"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
          />

          <select
            className="w-full p-2 border rounded"
            value={formData.gender}
            onChange={(e) =>
              setFormData({ ...formData, gender: e.target.value })
            }
          >
            <option value="">Chọn giới tính</option>
            <option value="Male">Nam</option>
            <option value="Female">Nữ</option>
          </select>

          <input
            type="date"
            className="w-full p-2 border rounded"
            value={formData.dateOfBirth}
            onChange={(e) =>
              setFormData({ ...formData, dateOfBirth: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Địa chỉ"
            className="w-full p-2 border rounded"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Nghề nghiệp"
            className="w-full p-2 border rounded"
            value={formData.occupation}
            onChange={(e) =>
              setFormData({ ...formData, occupation: e.target.value })
            }
          />

          <textarea
            placeholder="Giới thiệu bản thân"
            className="w-full p-2 border rounded"
            value={formData.about}
            onChange={(e) =>
              setFormData({ ...formData, about: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Số điện thoại"
            className="w-full p-2 border rounded"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.confirmation}
              onChange={(e) =>
                setFormData({ ...formData, confirmation: e.target.checked })
              }
            />
            Tôi xác nhận đồng ý tham gia sự kiện
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-4 gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Hủy
          </button>

          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            Gửi đăng ký
          </button>
        </div>

      </div>
    </div>
  );
};

export default RegistrationForm;
