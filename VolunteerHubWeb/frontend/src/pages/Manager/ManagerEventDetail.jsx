import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { getFileUrl } from "../../utils/files";

/**
 * ManagerEventDetail
 * - 4 tabs:
 *   1) Info: event details
 *   2) Registrations: list + approve/reject/complete
 *   3) Wall: posts feed (manager can post and moderate inline)
 *   4) Pending: only pending posts for quick moderation
 *
 * Reuses existing backend endpoints:
 *  - GET /events/get/{id}
 *  - GET /registrations/event/{id}
 *  - PUT /registrations/approve/{id}
 *  - PUT /registrations/cancel/{id}
 *  - PUT /registrations/complete/{id}
 *  - GET /posts/event/{id}
 *  - PUT /posts/approve/{id}
 *  - PUT /posts/reject/{id}
 *  - POST /posts/create (multipart) or JSON createPost endpoint
 *
 * This file is self-contained UI. Split into components if needed later.
 */

export default function ManagerEventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("info"); // info | regs | wall | pending
  const [refreshKey, setRefreshKey] = useState(0);

  // post composer (for manager)
  const [postContent, setPostContent] = useState("");
  const [postFiles, setPostFiles] = useState([]);
  const [notifyLoading, setNotifyLoading] = useState(false);
  // new: modal & notify content
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyContent, setNotifyContent] = useState("");
  const [notifyResult, setNotifyResult] = useState(null);
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, refreshKey]);

  const reload = () => setRefreshKey((k) => k + 1);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [evRes, regsRes, postsRes] = await Promise.all([
        axios.get(`/events/get/${id}`),
        axios.get(`/registrations/event/${id}`),
        axios.get(`/posts/event/${id}`),
      ]);
      setEvent(evRes.data);
      setRegistrations(Array.isArray(regsRes.data) ? regsRes.data : []);
      setPosts(Array.isArray(postsRes.data) ? postsRes.data : []);
    } catch (err) {
      console.error("Load manager event detail failed", err);
      alert(err.response?.data?.message || "Không thể tải dữ liệu sự kiện");
      // if unauthorized or not found, go back to manager home
      if (err.response?.status === 403 || err.response?.status === 404) {
        navigate("/manager");
      }
    } finally {
      setLoading(false);
    }
  };

  // Registrations actions
  const approveRegistration = async (regId) => {
    if (!confirm("Duyệt đăng ký này?")) return;
    try {
      await axios.put(`/registrations/approve/${regId}`);
      reload();
    } catch (err) {
      alert(err.response?.data?.message || "Duyệt thất bại");
    }
  };

  const rejectRegistration = async (regId) => {
    if (!confirm("Từ chối đăng ký này?")) return;
    try {
      await axios.put(`/registrations/cancel/${regId}`);
      reload();
    } catch (err) {
      alert(err.response?.data?.message || "Từ chối thất bại");
    }
  };

  const completeRegistration = async (regId) => {
    if (!confirm("Đánh dấu hoàn thành cho tình nguyện viên này?")) return;
    try {
      await axios.put(`/registrations/complete/${regId}`);
      reload();
    } catch (err) {
      alert(err.response?.data?.message || "Cập nhật thất bại");
    }
  };

  // Delete a registration (allowed after it's been REJECTED)
  const deleteRegistration = async (regId) => {
    if (!confirm("Xóa đăng ký này khỏi danh sách?")) return;
    try {
      await axios.delete(`/registrations/delete/${regId}`);
      // remove from local state immediately for fast UI feedback
      setRegistrations((prev) => prev.filter((r) => String(r.id) !== String(regId)));
    } catch (err) {
      console.error("deleteRegistration failed", err);
      alert(err?.response?.data?.message || "Xóa đăng ký thất bại");
    }
  };

  // Post moderation
  const approvePost = async (postId) => {
    if (!confirm("Duyệt bài viết này?")) return;
    try {
      await axios.put(`/posts/approve/${postId}`);
      reload();
    } catch (err) {
      alert(err.response?.data?.message || "Duyệt thất bại");
    }
  };

  const rejectPost = async (postId) => {
    if (!confirm("Từ chối bài viết này?")) return;
    try {
      await axios.put(`/posts/reject/${postId}`);
      reload();
    } catch (err) {
      alert(err.response?.data?.message || "Từ chối thất bại");
    }
  };

  // Manager create post (auto approved by backend because manager of event)
  const onPostFilesChange = (e) => {
    setPostFiles(Array.from(e.target.files || []));
  };

  const submitPost = async () => {
    if (!postContent.trim() && postFiles.length === 0) return alert("Nhập nội dung hoặc chọn ảnh");
    try {
      const form = new FormData();
      form.append("eventId", id);
      form.append("content", postContent.trim());
      postFiles.forEach((f) => form.append("mediaFiles", f));
      await axios.post("/posts/create", form);
      setPostContent("");
      setPostFiles([]);
      reload();
      setTab("wall");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Đăng bài thất bại");
    }
  };

  // open modal to compose & send a notification to approved registrants
  const recipientsCount = registrations.filter((r) => r.status === "APPROVED").length;

  const openNotifyModal = () => {
    // Prefill with template including event title in parentheses.
    // The preview will render the event title in bold.
    const prefix = `Ban tổ chức sự kiện tình nguyện (${event?.title || ""}) xin thông báo: `;
    setNotifyContent(prefix);
    setShowNotifyModal(true);
  };

  const sendCustomNotification = async () => {
    if (!notifyContent || !notifyContent.trim()) {
      alert("Nhập nội dung thông báo");
      return;
    }
    setNotifyLoading(true);
    try {
      const payload = {
        eventId: event.id,
        content: notifyContent,
        includeSender: true // <-- đảm bảo gửi về cho người gửi (preview)
      };
      console.log("[manager] sending custom notification payload:", payload);
      const res = await axios.post("/notifications/custom", payload);
      setNotifyResult({ ok: true });
      alert("Gửi thành công");
    } catch (err) {
      console.error("sendCustomNotification failed", err);
      setNotifyResult({ ok: false, error: err.response?.data || err.message });
      alert("Gửi thất bại: " + (err.response?.data?.message || err.message));
    } finally {
      setNotifyLoading(false);
    }
  };

  // Open/close registration detail modal (fix ReferenceError)
  const openRegistrationDetail = (reg) => {
    setSelectedRegistration(reg);
  };
  const closeRegistrationDetail = () => setSelectedRegistration(null);

  // helpers
  const pendingPosts = posts.filter((p) => p.status === "PENDING");
  const approvedPosts = posts.filter((p) => p.status === "APPROVED");

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (!event) return <div className="p-6 text-red-600">Sự kiện không tồn tại hoặc không có quyền truy cập.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-start gap-6">
        <img src={getFileUrl(event?.imageFile)} alt={event.title} className="w-48 h-32 object-cover rounded-md border" />
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{event.title}</h1>
          <p className="text-sm text-gray-600 mt-1">{event.location} · {new Date(event.startDate).toLocaleString()}</p>
          <p className="mt-3 text-gray-700">{event.description}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Trạng thái</div>
          <div className="font-semibold mt-1">{event.status}</div>
        </div>
      </div>

      <div className="mt-6 border-b">
        <nav className="flex gap-2">
          <button onClick={() => setTab("info")} className={`px-4 py-2 ${tab === "info" ? "border-b-2 border-emerald-600 text-emerald-600" : "text-gray-600"}`}>Thông tin</button>
          <button onClick={() => setTab("regs")} className={`px-4 py-2 ${tab === "regs" ? "border-b-2 border-emerald-600 text-emerald-600" : "text-gray-600"}`}>Đăng ký ({registrations.length})</button>
          <button onClick={() => setTab("wall")} className={`px-4 py-2 ${tab === "wall" ? "border-b-2 border-emerald-600 text-emerald-600" : "text-gray-600"}`}>Wall trao đổi</button>
          <button onClick={() => setTab("pending")} className={`px-4 py-2 ${tab === "pending" ? "border-b-2 border-emerald-600 text-emerald-600" : "text-gray-600"}`}>Bài chờ xét duyệt ({pendingPosts.length})</button>
          <div className="ml-auto">
            <Link to="/manager" className="text-sm text-gray-500 hover:text-gray-700">Quay lại quản lý</Link>
          </div>
        </nav>
      </div>

      <div className="mt-6">
        {tab === "info" && (
          <div className="bg-white p-6 rounded shadow">
            <h3 className="font-semibold mb-3">Chi tiết sự kiện</h3>
            <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="text-sm text-gray-500">Người nhận</div>
                <div className="font-medium">{recipientsCount} thành viên đã được duyệt</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={openNotifyModal}
                  className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Soạn & Gửi thông báo
                </button>
                <button
                  onClick={() => { setNotifyContent(""); setNotifyResult(null); setShowNotifyModal(true); }}
                  className="px-3 py-2 rounded border text-gray-700 bg-white"
                >
                  Soạn nhanh
                </button>
              </div>
            </div>
            {/* Notify modal */}
            {showNotifyModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black opacity-30" onClick={() => setShowNotifyModal(false)} />
                <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl p-4 z-60">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold">Gửi thông báo tới {recipientsCount} thành viên</h4>
                    <button onClick={() => setShowNotifyModal(false)} className="text-gray-500">✕</button>
                  </div>
                  <textarea
                    value={notifyContent}
                    onChange={(e) => setNotifyContent(e.target.value)}
                    rows={6}
                    className="w-full border p-2 rounded mb-3"
                    placeholder="Nhập nội dung thông báo..."
                  />
                  <div className="text-sm text-gray-500 mb-3">Xem trước:</div>
                  <div className="border rounded p-3 mb-3 bg-gray-50 text-sm">
                    {(() => {
                      if (!notifyContent) return <span className="text-gray-400">(chưa có nội dung)</span>;
                      // Try to parse the template: "Ban tổ chức sự kiện tình nguyện (eventTitle) xin thông báo: rest..."
                      const re = /^Ban tổ chức sự kiện tình nguyện \((.*?)\) xin thông báo: ?([\s\S]*)$/;
                      const m = notifyContent.match(re);
                      if (m) {
                        const titlePart = m[1];
                        const rest = m[2] || "";
                        return (
                          <div className="whitespace-pre-wrap">
                            <span>Ban tổ chức sự kiện tình nguyện (</span>
                            <strong>{titlePart}</strong>
                            <span>) xin thông báo: </span>
                            <span>{rest}</span>
                          </div>
                        );
                      }
                      // fallback: render raw content
                      return <div className="whitespace-pre-wrap">{notifyContent}</div>;
                    })()}
                  </div>
                  {notifyResult && (
                    <div className={`mb-3 text-sm ${notifyResult.ok ? "text-green-600" : "text-red-600"}`}>{notifyResult.msg}</div>
                  )}
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowNotifyModal(false)} className="px-4 py-2 rounded border">Hủy</button>
                    <button
                      onClick={sendCustomNotification}
                      disabled={notifyLoading || recipientsCount === 0}
                      className={`px-4 py-2 rounded ${notifyLoading ? "bg-gray-300 text-gray-700" : "bg-emerald-600 text-white"}`}
                    >
                      {notifyLoading ? "Đang gửi..." : `Gửi (${recipientsCount})`}
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Địa điểm</div>
                <div className="font-medium">{event.location}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Thời gian</div>
                <div className="font-medium">{new Date(event.startDate).toLocaleString()} - {new Date(event.endDate).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Danh mục</div>
                <div className="font-medium">{event.category?.name || "-"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Số lượng tối đa</div>
                <div className="font-medium">{event.maxParticipants || "N/A"}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-sm text-gray-500">Người tạo</div>
                <div className="font-medium">{event.createdByFullName || "-"}</div>
              </div>
            </div>
          </div>
        )}

        {tab === "regs" && (
          <div className="bg-white p-6 rounded shadow">
            <h3 className="font-semibold mb-3">Danh sách đăng ký ({registrations.length})</h3>
            {registrations.length === 0 ? (
              <p className="text-gray-500">Chưa có đăng ký.</p>
            ) : (
              <div className="space-y-3">
                {registrations.map((r) => (
                  <div key={r.id} className="border rounded p-3 flex justify-between items-start gap-4">
                    <div>
                      <div className="font-medium">{r.fullName} {r.contactEmail ? `(${r.contactEmail})` : ""}</div>
                      <div className="text-sm text-gray-500">{r.phone || ""}</div>
                      <div className="text-xs text-gray-600 mt-2">Trạng thái: <span className="font-semibold">{r.status}</span></div>
                      <div className="text-xs text-gray-700 mt-2">{r.about ? r.about.substring(0, 240) : ""}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {r.status === "PENDING" && <button onClick={() => approveRegistration(r.id)} className="px-3 py-1 bg-emerald-600 text-white rounded">Duyệt</button>}
                      {r.status !== "REJECTED" && <button onClick={() => rejectRegistration(r.id)} className="px-3 py-1 border text-red-600 rounded">Từ chối</button>}
                      {r.status === "REJECTED" && <button onClick={() => deleteRegistration(r.id)} className="px-3 py-1 border text-red-600 rounded">Xóa</button>}
                      <button onClick={() => openRegistrationDetail(r)} className="px-3 py-1 border text-gray-700 rounded">Xem</button>
                      {r.status === "APPROVED" && <button onClick={() => completeRegistration(r.id)} className="px-3 py-1 border rounded">Đánh dấu hoàn thành</button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "wall" && (
          <div className="bg-white p-6 rounded shadow">
            <h3 className="font-semibold mb-3">Wall trao đổi</h3>

            {/* Composer for manager */}
            <div className="mb-4 border rounded p-3">
              <textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} placeholder="Viết bài..." className="w-full border p-2 rounded mb-2" rows={3} />
              <div className="flex items-center justify-between gap-3">
                <input type="file" multiple accept="image/*" onChange={onPostFilesChange} />
                <div className="flex gap-2">
                  <button onClick={() => { setPostContent(""); setPostFiles([]); }} className="px-3 py-1 border rounded">Xóa</button>
                  <button onClick={submitPost} className="px-3 py-1 bg-emerald-600 text-white rounded">Đăng bài</button>
                </div>
              </div>
            </div>

            {/* Posts */}
            {approvedPosts.length === 0 ? (
              <p className="text-gray-500">Chưa có bài viết nào.</p>
            ) : (
              <div className="space-y-4">
                {approvedPosts.map((p) => (
                  <div key={p.id} className="border rounded p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{p.userFullName}</div>
                        <div className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700">{p.status}</div>
                    </div>
                    <div className="mt-3">{p.content}</div>
                    {p.mediaFiles && p.mediaFiles.length > 0 && (
                      <div className="mt-3 flex gap-2 flex-wrap">
                        {p.mediaFiles.map((m, i) => (
                          <img key={i} src={getFileUrl(m)} alt="media" className="w-36 h-24 object-cover rounded-md border" />
                        ))}
                      </div>
                    )}
                    {/* manager moderation inline for any post (optional) */}
                    <div className="mt-3 flex gap-2 justify-end">
                      {p.status !== "APPROVED" && <button onClick={() => approvePost(p.id)} className="px-3 py-1 bg-emerald-600 text-white rounded">Duyệt</button>}
                      {p.status !== "REJECTED" && <button onClick={() => rejectPost(p.id)} className="px-3 py-1 border text-red-600 rounded">Từ chối</button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "pending" && (
          <div className="bg-white p-6 rounded shadow">
            <h3 className="font-semibold mb-3">Bài viết đang chờ xét duyệt ({pendingPosts.length})</h3>
            {pendingPosts.length === 0 ? (
              <p className="text-gray-500">Không có bài viết chờ.</p>
            ) : (
              <div className="space-y-3">
                {pendingPosts.map((p) => (
                  <div key={p.id} className="border rounded p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{p.userFullName}</div>
                        <div className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="text-xs px-2 py-1 rounded bg-yellow-50 text-yellow-800">{p.status}</div>
                    </div>
                    <div className="mt-2 text-gray-800">{p.content}</div>
                    {p.mediaFiles && p.mediaFiles.length > 0 && (
                      <div className="mt-2 flex gap-2">
                        {p.mediaFiles.map((m, i) => (
                          <img key={i} src={getFileUrl(m)} alt="media" className="w-28 h-20 object-cover rounded-md border" />
                        ))}
                      </div>
                    )}
                    <div className="mt-3 flex gap-2 justify-end">
                      <button onClick={() => approvePost(p.id)} className="px-3 py-1 bg-emerald-600 text-white rounded">Duyệt</button>
                      <button onClick={() => rejectPost(p.id)} className="px-3 py-1 border text-red-600 rounded">Từ chối</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Registration detail modal */}
      {selectedRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-30" onClick={closeRegistrationDetail} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl p-4 z-60">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold">Chi tiết đăng ký: {selectedRegistration.fullName}</h4>
              <button onClick={closeRegistrationDetail} className="text-gray-500">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div><div className="text-xs text-gray-500">Họ và tên</div><div className="font-medium">{selectedRegistration.fullName}</div></div>
              <div><div className="text-xs text-gray-500">Email</div><div className="font-medium">{selectedRegistration.contactEmail}</div></div>
              <div><div className="text-xs text-gray-500">Số điện thoại</div><div className="font-medium">{selectedRegistration.phone}</div></div>
              <div><div className="text-xs text-gray-500">Giới tính</div><div className="font-medium">{selectedRegistration.gender}</div></div>
              <div><div className="text-xs text-gray-500">Ngày sinh</div><div className="font-medium">{selectedRegistration.dateOfBirth ? new Date(selectedRegistration.dateOfBirth).toLocaleDateString() : ""}</div></div>
              <div><div className="text-xs text-gray-500">Địa chỉ</div><div className="font-medium">{selectedRegistration.address}</div></div>
              <div><div className="text-xs text-gray-500">Nghề nghiệp</div><div className="font-medium">{selectedRegistration.occupation}</div></div>
              <div className="md:col-span-2"><div className="text-xs text-gray-500">Giới thiệu / Kinh nghiệm</div><div className="font-medium whitespace-pre-wrap">{selectedRegistration.about || selectedRegistration.experience}</div></div>
              <div className="md:col-span-2"><div className="text-xs text-gray-500">Kỹ năng</div><div className="font-medium">{selectedRegistration.skills}</div></div>
              <div><div className="text-xs text-gray-500">Trạng thái</div><div className="font-medium">{selectedRegistration.status}</div></div>
              <div><div className="text-xs text-gray-500">Đăng ký lúc</div><div className="font-medium">{selectedRegistration.registeredAt ? new Date(selectedRegistration.registeredAt).toLocaleString() : ""}</div></div>
            </div>

            <div className="mt-4 text-right">
              <button onClick={closeRegistrationDetail} className="px-4 py-2 rounded border">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}