export default function RegistrationsTab({ registrations, approve, reject, complete }) {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="font-semibold mb-3">Danh sách đăng ký ({registrations.length})</h3>

      {registrations.length === 0 ? (
        <p className="text-gray-500">Chưa có đăng ký.</p>
      ) : (
        <div className="space-y-3">
          {registrations.map((r) => (
            <div key={r.id} className="border rounded p-3 flex justify-between">
              <div>
                <div className="font-medium">{r.fullName}</div>
                <div className="text-xs mt-1">Trạng thái: {r.status}</div>
              </div>

              <div className="flex flex-col gap-2">
                {r.status === "PENDING" && (
                  <button onClick={() => approve(r.id)} className="px-3 py-1 bg-emerald-600 text-white rounded">
                    Duyệt
                  </button>
                )}

                {r.status !== "REJECTED" && (
                  <button onClick={() => reject(r.id)} className="px-3 py-1 border text-red-600 rounded">
                    Từ chối
                  </button>
                )}

                {r.status === "APPROVED" && (
                  <button onClick={() => complete(r.id)} className="px-3 py-1 border rounded">
                    Hoàn thành
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
