import React from "react";

export default function Pagination({ page = 1, totalPages = 1, onChange = () => {} }) {
  const prev = () => onChange(Math.max(1, page - 1));
  const next = () => onChange(Math.min(totalPages, page + 1));
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2">
      <button onClick={prev} disabled={page <= 1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
      <div className="text-sm text-gray-600">Trang {page} / {totalPages}</div>
      <button onClick={next} disabled={page >= totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
    </div>
  );
}