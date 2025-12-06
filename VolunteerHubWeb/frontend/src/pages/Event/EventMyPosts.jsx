import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import PropTypes from "prop-types";
import { getFileUrl } from "../../utils/files";

export default function EventMyPosts({ eventId, onCloseParent }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // post being edited
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!eventId) return;
    loadPosts();
  }, [eventId]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/posts/event/${eventId}`);
      const data = Array.isArray(res.data) ? res.data : [];
      // keep only posts by current user
      const mine = data.filter(p => p.userId && storedUser && p.userId === storedUser.id);
      setPosts(mine);
    } catch (err) {
      console.error("Load my posts failed", err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (p) => {
    setEditing(p);
    setContent(p.content || "");
    setFiles([]);
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files || []).slice(0, 6));
  };

  const handleSave = async () => {
    if (!editing) return;
    try {
      const form = new FormData();
      form.append("content", content || "");
      files.forEach(f => form.append("mediaFiles", f));
      await axios.put(`/posts/update/${editing.id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEditing(null);
      setContent("");
      setFiles([]);
      await loadPosts();
      alert("Cập nhật bài viết thành công (nếu cần duyệt sẽ hiển thị sau khi duyệt).");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Cập nhật thất bại");
    }
  };

  const handleDelete = async (postId) => {
    if (!confirm("Bạn chắc chắn muốn xóa bài viết này?")) return;
    try {
      await axios.delete(`/posts/delete/${postId}`);
      setPosts(prev => prev.filter(p => p.id !== postId));
      alert("Đã xóa.");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Xóa thất bại");
    }
  };

  const handleRemoveExistingImage = async (postId, mediaPath) => {
    if (!confirm("Xóa ảnh này khỏi bài viết?")) return;
    try {
      await axios.delete(`/posts/${postId}/media`, { params: { file: mediaPath } });
      // reload posts
      await loadPosts();
      alert("Đã xóa ảnh");
    } catch (err) {
      alert(err.response?.data?.message || "Xóa ảnh thất bại");
    }
  };

  if (loading) return <p>Đang tải bài đăng của bạn...</p>;
  if (!posts || posts.length === 0) return <p className="text-gray-500">Bạn chưa có bài đăng nào cho sự kiện này.</p>;

  return (
    <div className="space-y-4">
      {posts.map(p => (
        <div key={p.id} className="border rounded-lg p-4 bg-white">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">{p.userFullName || "Bạn"}</div>
              <div className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleString("vi-VN")}</div>
            </div>
            <div>
              <span className={`px-2 py-1 rounded text-xs ${p.status === "APPROVED" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-800"}`}>
                {p.status || "PENDING"}
              </span>
            </div>
          </div>

          <p className="mt-3 whitespace-pre-wrap">{p.content}</p>

          {p.mediaFiles && p.mediaFiles.length > 0 && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
              {p.mediaFiles.map((m, i) => (
                <div key={i} className="relative">
                  <img src={getFileUrl(m)} alt="media" className="w-full h-32 object-cover rounded-md" />
                  <button onClick={() => handleRemoveExistingImage(p.id, m)} className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-red-600">×</button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <button onClick={() => startEdit(p)} className="px-3 py-1 bg-emerald-600 text-white rounded">Chỉnh sửa</button>
            <button onClick={() => handleDelete(p.id)} className="px-3 py-1 border text-red-600 rounded">Xóa</button>
          </div>
        </div>
      ))}

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6">
            <h3 className="text-lg font-semibold mb-3">Chỉnh sửa bài viết</h3>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5} className="w-full border p-3 rounded mb-3" />
            <div className="flex items-center gap-3 mb-3">
              <label className="cursor-pointer px-3 py-2 border rounded text-sm bg-white">
                Thêm ảnh
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
              </label>
              {files.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {files.map((f, idx) => <img key={idx} src={URL.createObjectURL(f)} alt="preview" className="w-20 h-20 object-cover rounded" />)}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setEditing(null)} className="px-4 py-2 border rounded">Hủy</button>
              <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 text-white rounded">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

EventMyPosts.propTypes = {
  eventId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onCloseParent: PropTypes.func,
};