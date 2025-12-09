import React, { useState } from "react";
import axios from "../../api/axios";
import AdminLayout from "../../components/AdminLayout";

function download(filename, content, mime="text/csv") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function toCSV(arr) {
  if (!arr.length) return "";
  const keys = Object.keys(arr[0]);
  const rows = arr.map(o => keys.map(k => `"${(o[k] ?? "").toString().replace(/"/g,'""')}"`).join(","));
  return keys.join(",") + "\n" + rows.join("\n");
}

export default function AdminExport() {
  const [loading, setLoading] = useState(false);

  const exportEvents = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/events/all");
      download("events.json", JSON.stringify(data, null, 2), "application/json");
      download("events.csv", toCSV(data));
    } catch (err) { alert("Xuất thất bại"); }
    setLoading(false);
  };

  const exportUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/users/all");
      download("users.json", JSON.stringify(data, null, 2), "application/json");
      download("users.csv", toCSV(data));
    } catch (err) { alert("Xuất thất bại"); }
    setLoading(false);
  };

  return (
    <AdminLayout title="Xuất dữ liệu">
      <div className="flex gap-3">
        <button onClick={exportEvents} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">Xuất sự kiện (JSON/CSV)</button>
        <button onClick={exportUsers} disabled={loading} className="px-4 py-2 bg-emerald-600 text-white rounded">Xuất người dùng (JSON/CSV)</button>
      </div>
    </AdminLayout>
  );
}