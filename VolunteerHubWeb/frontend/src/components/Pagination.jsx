export default function Pagination({ page, totalPages, onChange }) {
  const safeTotal = Math.max(totalPages, 1);

  return (
    <div className="flex justify-center gap-2 py-3">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1 border rounded disabled:opacity-40"
      >
        ‹
      </button>

      {Array.from({ length: safeTotal }).map((_, i) => {
        const p = i + 1;
        return (
          <button
            key={p}
            onClick={() => onChange(p)}
            disabled={safeTotal === 1}
            className={`px-3 py-1 border rounded ${p === page ? "bg-emerald-600 text-white" : ""
              }`}
          >
            {p}
          </button>
        );
      })}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === safeTotal}
        className="px-3 py-1 border rounded disabled:opacity-40"
      >
        ›
      </button>
    </div>
  );
}
