import React, { useState } from "react";
import axios from "../../api/axios";
import AdminLayout from "../../components/AdminLayout";

function download(filename, content, mime = "text/csv;charset=utf-8;") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function buildCSV(headers, rows, introLines = []) {
  // Prepend UTF-8 BOM so Excel/Office recognizes UTF-8 properly
  const BOM = "\uFEFF";

  const escString = (v) => {
    if (v === null || typeof v === "undefined") return "";
    const s = typeof v === "string" ? v : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };

  const escNumber = (v) => {
    if (v === null || typeof v === "undefined" || v === "") return "";
    const n = Number(v);
    return Number.isFinite(n) ? String(n) : escString(v);
  };

  // introLines: array of strings to appear as preamble (one cell wide)
  const introText = Array.isArray(introLines) && introLines.length
    ? introLines.map(l => escString(l)).join("\n") + "\n\n"
    : "";

  const headerLine = headers.map(h => escString(h.label)).join(",");

  const lines = rows.map(r => {
    return headers.map(h => {
      const raw = (typeof h.key === "function") ? h.key(r) : r[h.key];
      const type = h.type || "string";
      if (type === "number") return escNumber(raw);
      if (type === "date") return escString(raw == null ? "" : fmtDate(raw));
      // default to string
      return escString(raw);
    }).join(",");
  });

  return BOM + introText + headerLine + "\n" + lines.join("\n");
}

function fmtDate(v) {
  if (!v) return "";
  try {
    const d = new Date(v);
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`; // Excel-friendly
  } catch { return String(v); }
}

export default function AdminExport() {
  const [loading, setLoading] = useState(false);

  const timestamp = () => {
    const d = new Date();
    return d.toISOString().replace(/[:.]/g, "-");
  };

  const exportEvents = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/events/all");

      // JSON copy
      download(`events-${timestamp()}.json`, JSON.stringify(data, null, 2), "application/json;charset=utf-8;");

      // CSV with professional layout
      const headers = [
        { key: "id", label: "ID", type: "number" },
        { key: "title", label: "Tiêu đề" },
        { key: (r) => (r.category ? r.category.name : ""), label: "Danh mục" },
        { key: (r) => r.startDate, label: "Bắt đầu", type: "date" },
        { key: (r) => r.endDate, label: "Kết thúc", type: "date" },
        { key: "location", label: "Địa điểm" },
        { key: "status", label: "Trạng thái" },
        { key: (r) => (r.createdByFullName || ""), label: "Người tạo (Họ tên)" },
        { key: (r) => (r.createdById != null ? r.createdById : ""), label: "Người tạo (ID)", type: "number" },
        { key: (r) => (typeof r.registeredCount !== 'undefined' ? r.registeredCount : (Array.isArray(r.registrations) ? r.registrations.length : 0)), label: "Số đăng ký", type: "number" },
        { key: (r) => r.createdAt, label: "Ngày tạo", type: "date" },
        { key: "description", label: "Mô tả" }
      ];

      const rows = Array.isArray(data) ? data : [];
      const intro = [
        "Báo cáo xuất dữ liệu - Sự kiện",
        `Xuất lúc: ${fmtDate(new Date().toISOString())}`,
        `Tổng bản ghi: ${rows.length}`
      ];
      const csv = buildCSV(headers, rows, intro);
      download(`events-${timestamp()}.csv`, csv);
    } catch (err) {
      console.error(err);
      alert("Xuất thất bại");
    }
    setLoading(false);
  };

  const exportUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/users/all");

      download(`users-${timestamp()}.json`, JSON.stringify(data, null, 2), "application/json;charset=utf-8;");

      const headers = [
        { key: "id", label: "ID", type: "number" },
        { key: "fullName", label: "Họ và tên" },
        { key: "email", label: "Email" },
        { key: "role", label: "Vai trò" },
        { key: "status", label: "Trạng thái" },
        { key: "verificationStatus", label: "Xác thực" },
        { key: "phoneNumber", label: "Số điện thoại" },
        { key: "address", label: "Địa chỉ" },
        { key: "eventsCount", label: "Số sự kiện", type: "number" },
        { key: "hours", label: "Tổng giờ (giới hạn 8h/ngày)", type: "number" },
        { key: (u) => u.createdAt, label: "Ngày tạo", type: "date" },
        { key: "publicProfile", label: "Mô tả ngắn" }
      ];

      const rows = Array.isArray(data) ? data : [];
      const intro = [
        "Báo cáo xuất dữ liệu - Người dùng",
        `Xuất lúc: ${fmtDate(new Date().toISOString())}`,
        `Tổng bản ghi: ${rows.length}`
      ];
      const csv = buildCSV(headers, rows, intro);
      download(`users-${timestamp()}.csv`, csv);
    } catch (err) {
      console.error(err);
      alert("Xuất thất bại");
    }
    setLoading(false);
  };

  return (
    <AdminLayout title="Xuất dữ liệu">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Báo cáo dữ liệu</h3>
        <p className="text-sm text-gray-600 mb-4">Xuất dữ liệu dưới dạng JSON và CSV. CSV được mã hóa UTF-8 (BOM) để mở đẹp trên Excel. Các cột số được xuất dạng số để dễ lọc/wording.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button onClick={exportEvents} disabled={loading} className="w-full text-left px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700">
            Xuất sự kiện (JSON + CSV)
            <div className="text-xs text-blue-100 mt-1">Bao gồm mô tả, ngày, người tạo và số đăng ký</div>
          </button>

          <button onClick={exportUsers} disabled={loading} className="w-full text-left px-4 py-3 bg-emerald-600 text-white rounded hover:bg-emerald-700">
            Xuất người dùng (JSON + CSV)
            <div className="text-xs text-emerald-100 mt-1">Bao gồm tổng giờ, số sự kiện và thông tin liên hệ</div>
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}