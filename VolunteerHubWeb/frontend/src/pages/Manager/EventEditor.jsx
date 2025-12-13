import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "../../api/axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { getFileUrl } from "../../utils/files";

const schema = yup.object({
  title: yup.string().required("Tên sự kiện là bắt buộc").min(3),
  description: yup.string().required("Mô tả là bắt buộc").min(10),
  location: yup.string().required("Địa điểm là bắt buộc"),
  startDate: yup.string().required("Ngày bắt đầu là bắt buộc"),
  endDate: yup.string().required("Ngày kết thúc là bắt buộc"),
  maxParticipants: yup.number().typeError("Nhập số hợp lệ").required("Bắt buộc"),
});

// helper: convert various incoming date representations -> value for <input type="datetime-local">
const toInputValue = (v) => {
  if (!v) return "";
  try {
    const d = typeof v === "string" ? new Date(v) : v;
    if (isNaN(d)) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
};

// helper: format value from datetime-local or any date string -> "yyyy-MM-dd'T'HH:mm:ss"
const formatForBackend = (v) => {
  if (!v) return null;
  try {
    // if already like "2025-12-13T01:14" add seconds
    if (typeof v === "string" && v.includes("T")) {
      return v.length === 16 ? `${v}:00` : v;
    }
    const d = typeof v === "string" ? new Date(v) : v;
    if (isNaN(d)) throw new Error("Invalid date");
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  } catch (err) {
    throw new Error("Invalid date: " + v);
  }
};

export default function EventEditor({ event, onClose, onSaved }) {
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: event?.title || "",
      description: event?.description || "",
      location: event?.location || "",
      startDate: toInputValue(event?.startDate),
      endDate: toInputValue(event?.endDate),
      categoryId: event?.category?.id || "",
      maxParticipants: event?.maxParticipants ?? "",
    },
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(event?.imageFile ? getFileUrl(event.imageFile) : null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    reset({
      title: event?.title || "",
      description: event?.description || "",
      location: event?.location || "",
      startDate: toInputValue(event?.startDate),
      endDate: toInputValue(event?.endDate),
      categoryId: event?.category?.id || "",
      maxParticipants: event?.maxParticipants ?? "",
    });
    setPreview(event?.imageFile ? getFileUrl(event.imageFile) : null);
    loadCategories();
  }, [event]);

  const loadCategories = async () => {
    try {
      const res = await axios.get("/categories/all");
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Load categories failed", err);
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    setImageFile(f || null);
    setPreview(f ? URL.createObjectURL(f) : (event?.imageFile ? getFileUrl(event.imageFile) : null));
  };

  const onSubmit = async (data) => {
    try {
      // prepare dates in backend-friendly format
      let start, end;
      try {
        start = formatForBackend(data.startDate);
        end = formatForBackend(data.endDate);
      } catch (err) {
        return alert("Định dạng ngày không hợp lệ. Vui lòng chọn lại ngày/giờ.");
      }

      // maxParticipants normalization
      const maxP = data.maxParticipants ? parseInt(data.maxParticipants, 10) : null;

      if (imageFile) {
        const form = new FormData();
        form.append("title", data.title);
        form.append("description", data.description);
        form.append("location", data.location);
        form.append("startDate", start);
        form.append("endDate", end);
        if (data.categoryId) form.append("categoryId", data.categoryId);
        if (maxP !== null) form.append("maxParticipants", String(maxP));
        form.append("imageFile", imageFile);

        if (event && event.id) {
          await axios.put(`/events/update/${event.id}`, form); // backend handles multipart
        } else {
          await axios.post("/events/create", form);
        }
      } else {
        const payload = {
          title: data.title,
          description: data.description,
          location: data.location,
          startDate: start,
          endDate: end,
          maxParticipants: maxP,
        };
        if (data.categoryId) payload.category = { id: Number(data.categoryId) };

        if (event && event.id) {
          await axios.put(`/events/update/${event.id}`, payload);
        } else {
          await axios.post("/events/create", payload);
        }
      }

      onSaved?.();
    } catch (err) {
      alert(err.response?.data?.message || "Lưu sự kiện thất bại");
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden"; // khóa cuộn nền
    return () => {
      document.body.style.overflow = "auto"; // mở lại khi đóng modal
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{event ? "Chỉnh sửa sự kiện" : "Tạo sự kiện mới"}</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(onSubmit)(); }} className="space-y-3">
          <input {...register("title")} placeholder="Tiêu đề" className="w-full border p-2 rounded" />
          <p className="text-xs text-red-600">{errors.title?.message}</p>

          <textarea {...register("description")} placeholder="Mô tả" className="w-full border p-2 rounded" rows={4} />
          <p className="text-xs text-red-600">{errors.description?.message}</p>

          <input {...register("location")} placeholder="Địa điểm" className="w-full border p-2 rounded" />
          <p className="text-xs text-red-600">{errors.location?.message}</p>

          {/* Category select */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Danh mục</label>
            <select {...register("categoryId")} className="w-full border p-2 rounded">
              <option value="">-- Chọn danh mục --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Max participants */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Số lượng tối đa</label>
            <input {...register("maxParticipants")} type="number" min={1} placeholder="Số tình nguyện viên tối đa" className="w-full border p-2 rounded" />
            <p className="text-xs text-red-600">{errors.maxParticipants?.message}</p>
          </div>

          {/* Image upload */}
          <div className="mt-2">
            <label className="block text-sm text-gray-600 mb-1">Ảnh sự kiện (tùy chọn)</label>
            <div className="flex items-center gap-3">
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {preview && <img src={preview} alt="preview" className="w-24 h-24 object-cover rounded-md border" />}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input type="datetime-local" {...register("startDate")} className="border p-2 rounded" />
            <input type="datetime-local" {...register("endDate")} className="border p-2 rounded" />
          </div>
          <p className="text-xs text-red-600">{errors.startDate?.message || errors.endDate?.message}</p>

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Hủy</button>
            <button disabled={isSubmitting} type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded">{isSubmitting ? "Đang lưu..." : "Lưu"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

EventEditor.propTypes = {
  event: PropTypes.object,
  onClose: PropTypes.func,
  onSaved: PropTypes.func,
};