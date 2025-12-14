import React, { useState } from "react";
import axios from "../../../api/axios";
import { getFileUrl } from "../../../utils/files";

export default function WallTab({ posts, eventId, reload, approve, reject }) {
  const [postContent, setPostContent] = useState("");
  const [postFiles, setPostFiles] = useState([]);

  const submitPost = async () => {
    const form = new FormData();
    form.append("eventId", eventId);
    form.append("content", postContent);
    postFiles.forEach((f) => form.append("mediaFiles", f));

    await axios.post("/posts/create", form);
    setPostContent("");
    setPostFiles([]);
    reload();
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="font-semibold mb-3">Wall trao đổi</h3>

      {/* composer */}
      <div className="mb-4 border rounded p-3">
        <textarea
          rows={3}
          className="w-full border p-2 rounded"
          placeholder="Viết bài..."
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
        />

        <div className="flex justify-between mt-2">
          <input type="file" multiple accept="image/*" onChange={(e) => setPostFiles([...e.target.files])} />
          <button onClick={submitPost} className="px-3 py-1 bg-emerald-600 text-white rounded">
            Đăng bài
          </button>
        </div>
      </div>

      {/* list posts */}
      {posts.map((p) => (
        <div key={p.id} className="border rounded p-4 mb-3">
          <div className="font-medium">{p.userFullName}</div>
          <div className="mt-2">{p.content}</div>

          {p.mediaFiles?.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {p.mediaFiles.map((m, i) => (
                <img key={i} src={getFileUrl(m)} className="w-36 h-24 object-cover rounded" />
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
      ))}
    </div>
  );
}
