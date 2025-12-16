import React, { useState } from "react";
import axios from "../../../api/axios";
import { getFileUrl } from "../../../utils/files";

export default function WallTab({ posts, eventId, reload }) {
  const [postContent, setPostContent] = useState("");
  const [postFiles, setPostFiles] = useState([]);

  const submitPost = async () => {
    if (!postContent.trim() && postFiles.length === 0) return;

    const form = new FormData();
    form.append("eventId", eventId);
    form.append("content", postContent);
    postFiles.forEach((f) => form.append("mediaFiles", f));

    await axios.post("/posts/create", form);
    setPostContent("");
    setPostFiles([]);
    reload();
  };

  const deletePost = async (postId) => {
    if (!confirm("Bạn chắc chắn muốn xoá bài viết này?")) return;

    try {
      await axios.delete(`/posts/${postId}`);
      reload();
    } catch {
      alert("Xoá bài viết thất bại");
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="font-semibold mb-3">Wall trao đổi</h3>

      {/* Composer */}
      <div className="mb-4 border rounded p-3">
        <textarea
          rows={3}
          className="w-full border p-2 rounded"
          placeholder="Viết bài..."
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
        />

        <div className="flex justify-between mt-2">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setPostFiles([...e.target.files])}
          />
          <button
            onClick={submitPost}
            className="px-3 py-1 bg-emerald-600 text-white rounded"
          >
            Đăng bài
          </button>
        </div>
      </div>

      {/* Posts */}
      {posts.length === 0 && (
        <div className="text-sm text-gray-500 text-center">
          Chưa có bài viết nào
        </div>
      )}

      {posts.map((p) => (
        <div key={p.id} className="border rounded p-4 mb-3">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium">{p.userFullName}</div>
              <div className="mt-2">{p.content}</div>
            </div>

            {/* Delete */}
            <button
              onClick={() => deletePost(p.id)}
              className="text-sm text-red-600 hover:underline"
            >
              Xoá
            </button>
          </div>

          {p.mediaFiles?.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {p.mediaFiles.map((m, i) => (
                <img
                  key={i}
                  src={getFileUrl(m)}
                  className="w-36 h-24 object-cover rounded"
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
