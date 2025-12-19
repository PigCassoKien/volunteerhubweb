import React from "react";

export default function Pagination({ page = 1, totalPages = 1, onChange = () => {} }) {
  const safeTotal = Math.max(Number(totalPages) || 1, 1);
  const current = Math.min(Math.max(Number(page) || 1, 1), safeTotal);
  if (safeTotal <= 1) return null;

  const go = (p) => onChange(Math.min(Math.max(p, 1), safeTotal));

  return (
    <div className="flex justify-center gap-2 py-3">
      <button
        onClick={() => go(current - 1)}
        disabled={current === 1}
        className="px-3 py-1 border rounded disabled:opacity-40"
      >
        ‹
      </button>

      {Array.from({ length: safeTotal }).map((_, i) => {
        const p = i + 1;
        return (
          <button
            key={p}
            onClick={() => go(p)}
            className={`px-3 py-1 border rounded ${p === current ? "bg-emerald-600 text-white" : ""}`}
          >
            {p}
          </button>
        );
      })}

      <button
        onClick={() => go(current + 1)}
        disabled={current === safeTotal}
        className="px-3 py-1 border rounded disabled:opacity-40"
      >
        ›
      </button>
    </div>
  );
}
