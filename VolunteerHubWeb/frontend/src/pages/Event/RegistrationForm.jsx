import React, { useState } from "react";
import * as yup from "yup";

const RegistrationForm = ({ formData, setFormData, onClose, onSubmit }) => {
  const [errors, setErrors] = useState({});
  const schema = yup.object().shape({
    fullName: yup.string().trim().required("Không được để trống"),
    address: yup.string().trim().required("Không được để trống"),
    occupation: yup.string().trim().required("Không được để trống"),
    phone: yup
      .string()
      .trim()
      .required("Không được để trống")
      .matches(/^[0-9+()\-\s.]{6,}$/, "Số điện thoại không hợp lệ"),
    email: yup.string().trim().required("Không được để trống").email("Email không hợp lệ"),
    confirmation: yup.boolean().oneOf([true], "Bạn cần xác nhận thông tin"),
  });

  const validate = async () => {
    try {
      await schema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      const newErrors = {};
      if (err && err.inner && err.inner.length) {
        err.inner.forEach((e) => {
          if (e.path && !newErrors[e.path]) newErrors[e.path] = e.message;
        });
      } else if (err && err.path) {
        newErrors[err.path] = err.message;
      }
      setErrors(newErrors);
      return false;
    }
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div
        className="
          bg-white rounded-xl w-[520px] shadow-lg
          max-h-[90vh] overflow-y-auto
        "
      >
        {/* Header */}
        <div className="px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold">Thông tin đăng ký tham gia</h2>
          <p className="text-sm text-gray-500">
            Vui lòng điền đầy đủ thông tin bên dưới
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Họ tên + Giới tính */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full p-2 border rounded-lg outline-none
    ${errors.fullName ? "border-red-500" : "focus:ring-2 focus:ring-emerald-500"}
  `}
                value={formData.fullName}
                onChange={(e) => {
                  setFormData({ ...formData, fullName: e.target.value });
                  setErrors({ ...errors, fullName: null });
                }}
              />

              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Giới tính
              </label>
              <select
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
              >
                <option value="">Chọn</option>
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
                <option value="Other">Khác</option>
              </select>
            </div>
          </div>

          {/* Ngày sinh */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Ngày sinh
            </label>
            <input
              type="date"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={formData.dateOfBirth}
              onChange={(e) =>
                setFormData({ ...formData, dateOfBirth: e.target.value })
              }
            />
          </div>

          {/* Địa chỉ */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Địa chỉ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={formData.address}
              onChange={(e) => {
                setFormData({ ...formData, address: e.target.value })
                setErrors({ ...errors, address: null });
              }}
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>

          {/* Nghề nghiệp */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Nghề nghiệp <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={formData.occupation}
              onChange={(e) => {
                setFormData({ ...formData, occupation: e.target.value })
                setErrors({ ...errors, occupation: null });
              }}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Trường / Đơn vị */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Trường / Đơn vị
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={formData.school || ""}
              onChange={(e) =>
                setFormData({ ...formData, school: e.target.value })
              }
            />
          </div>

          {/* Kỹ năng */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Kỹ năng
            </label>
            <input
              type="text"
              placeholder="Ví dụ: sơ cứu, tổ chức, làm việc nhóm..."
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={formData.skills || ""}
              onChange={(e) =>
                setFormData({ ...formData, skills: e.target.value })
              }
            />
          </div>

          {/* Kinh nghiệm */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Kinh nghiệm / Ghi chú
            </label>
            <textarea
              rows={3}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={formData.experience || ""}
              onChange={(e) =>
                setFormData({ ...formData, experience: e.target.value })
              }
            />
          </div>

          {/* Giới thiệu */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Giới thiệu bản thân
            </label>
            <textarea
              rows={3}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={formData.about}
              onChange={(e) =>
                setFormData({ ...formData, about: e.target.value })
              }
            />
          </div>

          {/* Điện thoại */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value })
                setErrors({ ...errors, phone: null });
              }}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value })
                setErrors({ ...errors, email: null });
              }}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Xác nhận */}
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={Boolean(formData.confirmation)}
              onChange={(e) => {
                setFormData({ ...formData, confirmation: e.target.checked });
                setErrors({ ...errors, confirmation: null });
              }}
            />
            Tôi xác nhận thông tin trên là chính xác và đồng ý tham gia sự kiện
          </label>

          {errors.confirmation && (
            <p className="text-red-500 text-xs mt-1">{errors.confirmation}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t sticky bottom-0 bg-white flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            Hủy
          </button>

          <button
            onClick={async () => {
              if (!validate()) return;

              const success = await onSubmit();

              if (success) {
                onClose();
              }
            }}
            disabled={!formData.confirmation}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Gửi đăng ký
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
