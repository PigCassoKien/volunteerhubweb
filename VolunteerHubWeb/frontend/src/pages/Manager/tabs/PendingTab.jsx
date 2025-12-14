import { getFileUrl } from "../../../utils/files";

export default function PendingTab({ pending, approve, reject }) {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="font-semibold mb-3">Bài chờ xét duyệt ({pending.length})</h3>

      {pending.length === 0 ? (
        <p className="text-gray-500">Không có bài viết chờ.</p>
      ) : (
        pending.map((p) => (
          <div key={p.id} className="border rounded p-3 mb-3">
            <div className="font-medium">{p.userFullName}</div>
            <div className="mt-2">{p.content}</div>

            {p.mediaFiles?.length > 0 && (
              <div className="flex gap-2 mt-2">
                {p.mediaFiles.map((m, i) => (
                  <img key={i} src={getFileUrl(m)} className="w-28 h-20 object-cover rounded" />
                ))}
              </div>
            )}

            <div className="flex gap-2 justify-end mt-3">
              <button onClick={() => approve(p.id)} className="px-3 py-1 bg-emerald-600 text-white rounded">
                Duyệt
              </button>
              <button onClick={() => reject(p.id)} className="px-3 py-1 border text-red-600 rounded">
                Từ chối
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
