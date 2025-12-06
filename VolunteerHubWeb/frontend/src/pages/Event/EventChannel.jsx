import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { FiSend, FiMessageCircle } from "react-icons/fi";
import PropTypes from "prop-types";
import { getFileUrl } from "../../utils/files";

const REACTION_EMOJI = {
  LIKE: "👍",
  LOVE: "❤️",
  HAHA: "😂",
  WOW: "😮",
  SAD: "😢",
  ANGRY: "😡",
};

export default function EventChannel({ eventId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [showComments, setShowComments] = useState({}); // postId -> bool
  const [commentInput, setCommentInput] = useState({}); // postId -> text
  const [commentsByPost, setCommentsByPost] = useState({}); // postId -> tree []
  const [reactionSummary, setReactionSummary] = useState({}); // postId -> {counts, userReactedType}
  const [animatingReact, setAnimatingReact] = useState({}); // postId -> bool
  const [eventInfo, setEventInfo] = useState(null);

  // NEW: track which comment we're replying to per post (postId -> parentCommentId)
  const [replyToByPost, setReplyToByPost] = useState({}); 

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!eventId) return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [evRes, postsRes] = await Promise.all([
        api.get(`/events/get/${eventId}`),
        api.get(`/posts/event/${eventId}`),
      ]);
      setEventInfo(evRes.data);
      const data = Array.isArray(postsRes.data) ? postsRes.data : [];
      setPosts(data.filter((p) => p.status === "APPROVED" || !p.status));
      data.forEach((p) => {
        fetchReactions(p.id);
      });
    } catch (err) {
      console.error("Lỗi tải kênh trao đổi:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReactions = async (postId) => {
    try {
      const res = await api.get(`/reactions/post/${postId}`);
      const list = Array.isArray(res.data) ? res.data : [];
      const counts = {};
      let userReactedType = null;
      list.forEach((r) => {
        const t = r.reactionType;
        counts[t] = (counts[t] || 0) + 1;
        if (user && r.userId === user.id) userReactedType = t;
      });
      setReactionSummary((s) => ({ ...s, [postId]: { counts, userReactedType } }));
    } catch (err) {
      console.error("Không thể tải reactions:", err);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const res = await api.get(`/comments/post/${postId}`);
      const flat = Array.isArray(res.data) ? res.data : [];
      const map = {};
      flat.forEach((c) => {
        map[c.id] = { ...c, children: [] };
      });
      const roots = [];
      flat.forEach((c) => {
        if (c.parentCommentId) {
          const parent = map[c.parentCommentId];
          if (parent) parent.children.push(map[c.id]);
          else roots.push(map[c.id]);
        } else {
          roots.push(map[c.id]);
        }
      });
      setCommentsByPost((s) => ({ ...s, [postId]: roots }));
    } catch (err) {
      console.error("Không thể tải bình luận:", err);
    }
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files || []).slice(0, 6));
  };

  const handleCreatePost = async () => {
    if (!content.trim() && files.length === 0) return alert("Nhập nội dung hoặc chọn hình ảnh");
    try {
      const form = new FormData();
      form.append("eventId", eventId);
      form.append("content", content || "");
      files.forEach((f) => form.append("mediaFiles", f));
      await api.post("/posts/create", form);
      setContent("");
      setFiles([]);
      await loadAll();
    } catch (err) {
      alert(err.response?.data?.message || "Gửi bài thất bại");
    }
  };

  const handleToggleComments = async (postId) => {
    setShowComments((s) => ({ ...s, [postId]: !s[postId] }));
    if (!commentsByPost[postId]) {
      await fetchComments(postId);
    }
  };

  const handleAddComment = async (postId, parentCommentId = null) => {
    const text = (commentInput[postId] || "").trim();
    if (!text) return;
    try {
      // prefer explicit parentCommentId, otherwise use replyToByPost[postId]
      const effectiveParent = parentCommentId || replyToByPost[postId] || null;
      await api.post("/comments/create", { postId, content: text, parentCommentId: effectiveParent });
      setCommentInput((s) => ({ ...s, [postId]: "" }));
      // clear reply target after sending
      setReplyToByPost((s) => ({ ...s, [postId]: null }));
      await fetchComments(postId);
    } catch (err) {
      alert(err.response?.data?.message || "Gửi bình luận thất bại");
    }
  };

  const handleReact = async (postId, reactionType) => {
    try {
      setAnimatingReact((s) => ({ ...s, [postId]: true }));
      setTimeout(() => setAnimatingReact((s) => ({ ...s, [postId]: false })), 450);
      await api.post("/reactions/create", { postId, reactionType });
      await fetchReactions(postId);
    } catch (err) {
      alert(err.response?.data?.message || "Không thể thực hiện cảm xúc");
    }
  };

  // manager moderation helpers (keep old features)
  const isManagerOfEvent = user && eventInfo && user.role === "EVENT_MANAGER" && user.id === eventInfo.createdById;
  const approvePost = async (postId) => {
    if (!confirm("Duyệt bài viết này?")) return;
    try {
      await api.put(`/posts/approve/${postId}`);
      await loadAll();
    } catch (err) {
      alert(err.response?.data?.message || "Duyệt thất bại");
    }
  };
  const rejectPost = async (postId) => {
    if (!confirm("Từ chối bài viết này?")) return;
    try {
      await api.put(`/posts/reject/${postId}`);
      await loadAll();
    } catch (err) {
      alert(err.response?.data?.message || "Từ chối thất bại");
    }
  };

  if (!token) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm text-center">
        <p className="text-gray-700 mb-3">Bạn cần đăng nhập để trao đổi trong kênh sự kiện.</p>
        <div className="flex justify-center gap-3">
          <a href="/login" className="px-4 py-2 bg-emerald-600 text-white rounded-lg">Đăng nhập</a>
          <a href="/register" className="px-4 py-2 border rounded-lg">Đăng ký</a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <FiMessageCircle /> Kênh trao đổi sự kiện
      </h2>

      {/* Create post */}
      <div className="mb-5">
        <textarea
          placeholder="Chia sẻ cảm nghĩ của bạn..."
          className="w-full border p-3 rounded-lg mb-3"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="flex items-center gap-3 mb-3">
          <label className="cursor-pointer px-3 py-2 border rounded-md text-sm bg-white hover:bg-gray-50">
            Chọn ảnh
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
          </label>

          {files.length > 0 && (
            <div className="flex gap-2 overflow-x-auto">
              {files.map((f, idx) => (
                <img key={idx} src={URL.createObjectURL(f)} alt="preview" className="w-20 h-20 object-cover rounded-md border" />
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button onClick={handleCreatePost} className="px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center gap-2">
            <FiSend /> Đăng
          </button>
        </div>
      </div>

      <hr className="my-4" />

      {/* Posts list */}
      {loading ? (
        <p>Đang tải bài viết...</p>
      ) : posts.length === 0 ? (
        <p className="text-gray-500">Chưa có bài viết nào.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((p) => {
            const reactions = reactionSummary[p.id]?.counts || {};
            const userReact = reactionSummary[p.id]?.userReactedType || null;
            const commentsTree = commentsByPost[p.id] || [];

            return (
              <div key={p.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{p.userFullName || `User ${p.userId}`}</div>
                    <div className="text-sm text-gray-500">{new Date(p.createdAt).toLocaleString("vi-VN")}</div>
                  </div>
                  {isManagerOfEvent && (
                    <div className="flex gap-2">
                      {p.status !== "APPROVED" && <button onClick={() => approvePost(p.id)} className="px-3 py-1 bg-emerald-600 text-white rounded">Duyệt</button>}
                      {p.status !== "REJECTED" && <button onClick={() => rejectPost(p.id)} className="px-3 py-1 border text-red-600 rounded">Từ chối</button>}
                    </div>
                  )}
                </div>

                <p className="mt-3 whitespace-pre-wrap">{p.content}</p>

                {p.mediaFiles && p.mediaFiles.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {p.mediaFiles.map((mf, i) => (
                      <a key={i} href={getFileUrl(mf)} target="_blank" rel="noreferrer">
                        <img src={getFileUrl(mf)} alt="media" className="w-full h-40 object-cover rounded-md" />
                      </a>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-2">
                    {Object.keys(REACTION_EMOJI).map((t) => (
                      <button
                        key={t}
                        onClick={() => handleReact(p.id, t)}
                        className={`px-3 py-1 rounded-full text-xs border flex items-center gap-2 transition ${userReact === t ? "bg-emerald-600 text-white border-emerald-600 scale-105" : "bg-white text-gray-700"}`}
                        style={animatingReact[p.id] ? { transform: "scale(1.12)", transition: "transform 180ms ease" } : {}}
                      >
                        <span className="text-sm">{REACTION_EMOJI[t]}</span>
                        <span className="text-xs text-gray-500">{reactions[t] || 0}</span>
                      </button>
                    ))}
                  </div>

                  <button onClick={() => handleToggleComments(p.id)} className="ml-2 px-3 py-1 rounded-full border text-sm">
                    Bình luận ({(commentsTree.reduce((acc, c) => acc + (countCommentsRecursive(c) || 0), 0)) || 0})
                  </button>
                </div>

                {/* Comments */}
                {showComments[p.id] && (
                  <div className="mt-4 border-t pt-4">
                    <div className="space-y-3">
                      {commentsTree.length === 0 ? (
                        <p className="text-gray-500">Chưa có bình luận.</p>
                      ) : (
                        commentsTree.map((c) => renderCommentNode(c, 0, commentInput, setCommentInput, handleAddComment, replyToByPost, setReplyToByPost))
                      )}
                    </div>

                    <div className="mt-3 flex gap-2">
                      <input
                        id={`comment-input-${p.id}`}
                        value={commentInput[p.id] || ""}
                        onChange={(e) => setCommentInput((s) => ({ ...s, [p.id]: e.target.value }))}
                        className="flex-1 border p-2 rounded-lg"
                        placeholder="Viết bình luận..."
                      />
                      <button onClick={() => handleAddComment(p.id)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg">Gửi</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// helper: count comments recursively
function countCommentsRecursive(node) {
  if (!node) return 0;
  let cnt = 1;
  if (node.children && node.children.length) {
    node.children.forEach((ch) => (cnt += countCommentsRecursive(ch)));
  }
  return cnt;
}

// helper render comment tree recursively
function renderCommentNode(node, depth = 0, commentInput = {}, setCommentInput = () => {}, handleAddComment = () => {}, replyToByPost = {}, setReplyToByPost = () => {}) {
   return (
     <div key={node.id} className="pl-0" style={{ marginLeft: depth * 12 }}>
       <div className="bg-white p-3 rounded-lg">
         <div className="flex justify-between">
           <div>
             <div className="text-sm font-medium">{node.userFullName || `User ${node.userId}`}</div>
             <div className="text-xs text-gray-400">{new Date(node.createdAt).toLocaleString("vi-VN")}</div>
           </div>
         </div>
         <p className="text-sm text-gray-700 mt-2">{node.content}</p>

         <div className="flex items-center gap-2 mt-2">
           <button
             onClick={() => {
               // set input text hint and mark this comment as the parent for the post
               setCommentInput((s) => ({ ...s, [node.postId]: (s[node.postId] || "") + `@${node.userFullName || ""} ` }));
               setReplyToByPost((s) => ({ ...s, [node.postId]: node.id }));
               // focus the input under the post if available
               setTimeout(() => document.getElementById(`comment-input-${node.postId}`)?.focus(), 50);
             }}
             className="text-xs text-gray-500"
           >
             Trả lời
           </button>
           <button
             onClick={() => handleAddComment(node.postId, node.id)}
             className="text-xs text-gray-500"
           >
             Gửi trả lời
           </button>
         </div>
       </div>

       {node.children && node.children.length > 0 && (
         <div className="mt-2 space-y-2">
           {node.children.map((ch) => renderCommentNode(ch, depth + 1, commentInput, setCommentInput, handleAddComment, replyToByPost, setReplyToByPost))}
         </div>
       )}
     </div>
   );
 }

EventChannel.propTypes = {
  eventId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
