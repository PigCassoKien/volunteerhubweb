import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import axios from "../../api/axios";
import { getFileUrl } from "../../utils/files";
import { useSearchParams } from "react-router-dom";
import {
  FiHeart,
  FiMessageCircle,
  FiCamera,
  FiPaperclip,
  FiSend,
  FiX,
  FiSmile,
} from "react-icons/fi";

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
  const [composerText, setComposerText] = useState("");
  const [composerFiles, setComposerFiles] = useState([]);
  const [reactionSummary, setReactionSummary] = useState({}); // keys: post_{id} or comment_{id} -> { counts:{}, myType }
  const [commentsByPost, setCommentsByPost] = useState({}); // postId -> nested comments
  const [openComments, setOpenComments] = useState({}); // postId -> bool (preserve across polling)
  const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });
  const [replyContext, setReplyContext] = useState({});
  const pollRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [showAllAnnouncements, setShowAllAnnouncements] = useState(false);
  const [eventNotifications, setEventNotifications] = useState([]); // <-- added

  const [searchParams] = useSearchParams();
  const focusPostId = searchParams.get("post");

  // Lọc các post là THÔNG BÁO (announcement=true), sắp xếp mới nhất trước
  // merge manager notifications (Notification entity) + posts marked announcement
  const announcementPosts = useMemo(() => {
    const postAnnouncements = (posts || []).filter((p) => p.announcement);
    const notifAsPosts = (eventNotifications || []).map((n) => ({
      id: `notif-${n.id}`,
      userFullName: "Ban tổ chức",
      createdAt: n.createdAt,
      content: n.content,
      mediaFiles: [],
      status: "ANNOUNCEMENT",
      isNotification: true,
    }));
    return [...notifAsPosts, ...postAnnouncements].sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }, [posts, eventNotifications]);

  const visibleAnnouncements = showAllAnnouncements
    ? announcementPosts
    : announcementPosts.slice(0, 3);

  useEffect(() => {
    if (!eventId) return;
    loadPosts(true);
    pollRef.current = setInterval(() => loadPosts(false), 5000);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  // load event-specific notifications (manager-sent)
  useEffect(() => {
    let mounted = true;
    const loadNotifs = async () => {
      try {
        const res = await axios.get(`/notifications/event/${eventId}`);
        if (!mounted) return;
        setEventNotifications(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        // ignore
      }
    };
    if (eventId) loadNotifs();
    return () => { mounted = false; };
  }, [eventId]);

  const loadPosts = async (initial = false) => {
    if (initial) setLoading(true);
    try {
      const { data } = await axios.get(`/posts/event/${eventId}`);
      const arr = Array.isArray(data) ? data : [];
      arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // merge to preserve already loaded comment trees and open panels
      setPosts((prev) => {
        const prevMap = new Map((prev || []).map((p) => [String(p.id), p]));
        return arr.map((p) => (prevMap.has(String(p.id)) ? { ...prevMap.get(String(p.id)), ...p } : p));
      });

      // update reactions & comment counts; only fetch comments if panel is open and not loaded
      await Promise.all(
        arr.map(async (p) => {
          await fetchReactionsForPost(p.id);
          await fetchCommentCountForPost(p.id);
          if (openComments[p.id] && !commentsByPost[p.id]) await fetchComments(p.id);
        })
      );
    } catch (err) {
      console.error("Load posts failed", err);
    } finally {
      if (initial) setLoading(false);
    }
  };

  const fetchReactionsForPost = async (postId) => {
    try {
      const res = await axios.get(`/reactions/post/${postId}`);
      const list = Array.isArray(res.data) ? res.data : [];
      const counts = {};
      let myType = null;
      list.forEach((r) => {
        const t = String(r.reactionType);
        counts[t] = (counts[t] || 0) + 1;
        if (user && r.userId === user.id) myType = t;
      });
      setReactionSummary((s) => ({ ...s, [`post_${postId}`]: { counts, myType } }));
    } catch (err) {
      console.error("fetchReactionsForPost", err);
    }
  };

  const fetchReactionsForComment = async (commentId) => {
    try {
      const res = await axios.get(`/reactions/comment/${commentId}`);
      const list = Array.isArray(res.data) ? res.data : [];
      const counts = {};
      let myType = null;
      list.forEach((r) => {
        const t = String(r.reactionType);
        counts[t] = (counts[t] || 0) + 1;
        if (user && r.userId === user.id) myType = t;
      });
      setReactionSummary((s) => ({ ...s, [`comment_${commentId}`]: { counts, myType } }));
    } catch (err) {
      console.error("fetchReactionsForComment", err);
    }
  };

  const fetchCommentCountForPost = async (postId) => {
    try {
      const res = await axios.get(`/comments/post/${postId}`);
      const arr = Array.isArray(res.data) ? res.data : [];
      const total = arr.length;
      setPosts((prev) => prev.map((p) => (String(p.id) === String(postId) ? { ...p, commentCount: total } : p)));
    } catch (err) {
      console.error("fetchCommentCountForPost", err);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 6);
    setComposerFiles((prev) => [...prev, ...files].slice(0, 6));
  };
  const removeComposerFile = (idx) => setComposerFiles((prev) => prev.filter((_, i) => i !== idx));

  const submitPost = async () => {
    if (!composerText.trim() && composerFiles.length === 0) return alert("Nhập nội dung hoặc chọn ảnh");
    const form = new FormData();
    form.append("eventId", eventId);
    form.append("content", composerText.trim());
    composerFiles.forEach((f) => form.append("mediaFiles", f));
    try {
      const res = await axios.post("/posts/create", form, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data) setPosts((p) => [res.data, ...p]);
      setComposerText("");
      setComposerFiles([]);
      if (res.data?.id) await fetchReactionsForPost(res.data.id);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Tạo bài viết thất bại");
    }
  };

  const openLightbox = (images, idx = 0) => setLightbox({ open: true, images, index: idx });
  const closeLightbox = () => setLightbox({ open: false, images: [], index: 0 });

  // facebook-like reaction: toggles reaction for post or comment
  const handleReact = async ({ postId = null, commentId = null, reactionType }) => {
    const key = commentId ? `comment_${commentId}` : `post_${postId}`;
    // optimistic update: ensure counts map and myType exist
    setReactionSummary((s) => {
      const cur = s[key] || { counts: {}, myType: null };
      const counts = { ...(cur.counts || {}) };
      const prev = cur.myType;
      if (prev === reactionType) {
        // remove reaction
        counts[reactionType] = Math.max(0, (counts[reactionType] || 1) - 1);
        cur.myType = null;
      } else {
        if (prev) counts[prev] = Math.max(0, (counts[prev] || 1) - 1);
        counts[reactionType] = (counts[reactionType] || 0) + 1;
        cur.myType = reactionType;
      }
      // cleanup zero entries
      Object.keys(counts).forEach((k) => { if (!counts[k]) delete counts[k]; });
      return { ...s, [key]: { counts, myType: cur.myType } };
    });

    try {
      await axios.post("/reactions/create", { postId, commentId, reactionType });
      // backend enforces uniqueness; next poll will sync precise state
    } catch (err) {
      console.error("React API failed", err);
      // revert by re-fetching target reactions
      if (commentId) await fetchReactionsForComment(commentId);
      else await fetchReactionsForPost(postId);
    }
  };

  // comments
  const toggleComments = async (postId) => {
    setOpenComments((o) => {
      const next = { ...o, [postId]: !o[postId] };
      if (next[postId] && !commentsByPost[postId]) fetchComments(postId);
      return next;
    });
  };

  const fetchComments = async (postId) => {
    try {
      const res = await axios.get(`/comments/post/${postId}`);
      const flat = Array.isArray(res.data) ? res.data : [];
      const byId = {};
      flat.forEach((c) => (byId[c.id] = { ...c, children: [] }));
      const roots = [];
      flat.forEach((c) => {
        if (c.parentCommentId) {
          const parent = byId[c.parentCommentId];
          if (parent) {
            byId[c.id].parentFullName = parent.userFullName;
            parent.children.push(byId[c.id]);
          } else roots.push(byId[c.id]);
        } else roots.push(byId[c.id]);
      });
      setCommentsByPost((s) => ({ ...s, [postId]: roots }));
      // fetch reactions for each comment
      await Promise.all(flat.map((c) => fetchReactionsForComment(c.id)));
      // update commentCount (including replies)
      setPosts((prev) => prev.map((p) => (String(p.id) === String(postId) ? { ...p, commentCount: flat.length } : p)));
    } catch (err) {
      console.error("Load comments failed", err);
    }
  };

  const addComment = async (postId, content, parentCommentId = null) => {
    if (!content || !content.trim()) return;
    try {
      await axios.post("/comments/create", { postId, content, parentCommentId });
      await fetchComments(postId);
      // keep comments panel open
      setOpenComments((o) => ({ ...o, [postId]: true }));
    } catch (err) {
      console.error("Add comment failed", err);
      alert("Gửi bình luận thất bại");
    }
  };

  const removePost = async (postId) => {
    if (!confirm("Xóa bài viết?")) return;
    try {
      await axios.delete(`/posts/delete/${postId}`);
      setPosts((p) => p.filter((x) => x.id !== postId));
    } catch (err) {
      console.error(err);
      alert("Xóa thất bại");
    }
  };

  // reply helpers: set/clear replyContext (do not prefill input with @name to avoid duplicate @ in render)
  const setReplyTo = (postId, parentId, parentName) => {
    setReplyContext((s) => ({ ...s, [postId]: { parentId, parentName, draftText: "" } }));
    setOpenComments((o) => ({ ...o, [postId]: true }));
  };
  const clearReplyFor = (postId) => setReplyContext((s) => { const n = { ...s }; delete n[postId]; return n; });
  const submitReplyFor = async (postId) => {
    const ctx = replyContext[postId];
    const content = (ctx?.draftText || "").trim();
    if (!content) return alert("Nhập nội dung");
    await addComment(postId, content, ctx?.parentId ?? null);
    clearReplyFor(postId);
  };

  useEffect(() => {
    if (!focusPostId) return;
    setTimeout(() => {
      const el = document.getElementById(`post-${focusPostId}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  }, [focusPostId, posts]);

  if (!eventId) return null;
  if (loading) return <div className="p-4 text-center">Đang tải kênh trao đổi...</div>;

  return (
    <div className="space-y-4">
      {/* THÔNG BÁO từ Manager – hiển thị nổi bật, tối đa 3 nếu không bấm "Xem tất cả" */}
      {announcementPosts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-bullhorn text-amber-600"></i>
              <span className="font-semibold text-amber-800 text-sm">
                Thông báo từ Quản lý sự kiện
              </span>
            </div>
            {announcementPosts.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAllAnnouncements((v) => !v)}
                className="text-xs text-emerald-700 hover:underline"
              >
                {showAllAnnouncements
                  ? "Ẩn bớt thông báo"
                  : `Xem tất cả (${announcementPosts.length})`}
              </button>
            )}
          </div>

          <div className="space-y-2">
            {visibleAnnouncements.map((p) => (
              <div
                key={p.id}
                className="border-l-4 border-amber-500 bg-white/80 rounded-lg px-3 py-2 text-sm"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase text-amber-700">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    Thông báo
                  </span>
                  {p.createdAt && (
                    <span className="text-[11px] text-gray-500">
                      {new Date(p.createdAt).toLocaleString("vi-VN", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  )}
                </div>
                <div
                  className="text-gray-800 text-sm prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: p.content || "" }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Composer */}
      <div className="bg-white rounded-xl p-4 shadow">
        <div className="flex gap-3">
          <img src={user?.avatarFile ? getFileUrl(user.avatarFile) : "https://i.pravatar.cc/48"} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
          <div className="flex-1">
            <textarea
              className="w-full border rounded-md p-3 resize-none min-h-[80px] focus:ring-2 focus:ring-emerald-200"
              placeholder="Chia sẻ thông tin, hỏi đáp, đăng ảnh..."
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
            />
            {composerFiles.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {composerFiles.map((f, i) => {
                  const url = URL.createObjectURL(f);
                  return (
                    <div key={i} className="relative group">
                      <img src={url} alt={f.name} className="w-full h-24 object-cover rounded" />
                      <button onClick={() => removeComposerFile(i)} className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100">
                        <FiX />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <label className="inline-flex items-center gap-2 cursor-pointer px-3 py-2 border rounded text-gray-700">
                  <FiCamera /> <span>Ảnh</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer px-3 py-2 border rounded text-gray-700">
                  <FiPaperclip /> <span>Tệp</span>
                  <input type="file" className="hidden" onChange={handleFileChange} />
                </label>
                <button type="button" className="inline-flex items-center gap-2 px-3 py-2 border rounded text-gray-700">
                  <FiSmile /> Emoji
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => { setComposerText(""); setComposerFiles([]); }} className="px-3 py-2 text-sm border rounded">Hủy</button>
                <button onClick={submitPost} className="px-4 py-2 bg-emerald-600 text-white rounded flex items-center gap-2">
                  <FiSend /> Đăng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="grid grid-cols-1 gap-4">
        {posts.map((p) => {
          const imgs = Array.isArray(p.mediaFiles) ? p.mediaFiles : [];
          const reaction = reactionSummary[`post_${p.id}`] || { counts: {}, myType: null };
          const counts = reaction.counts || {};
          const totalReacts = Object.values(counts).reduce((a, b) => a + b, 0);
          const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);

          return (
            <div
              key={p.id}
              id={`post-${p.id}`}
              className={`bg-white rounded-xl p-4 shadow-sm transition
    ${String(p.id) === focusPostId ? "ring-2 ring-emerald-400 bg-emerald-50" : ""}
  `}
            >
              <div className="flex gap-3">
                <img src={p.userAvatar ? getFileUrl(p.userAvatar) : (p.userAvatarFile ? getFileUrl(p.userAvatarFile) : "https://i.pravatar.cc/48")} alt="avatar" className="w-11 h-11 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{p.userFullName || p.userName || "Người dùng"}</div>
                      <div className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleString()}</div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      {p.canDelete && (
                        <button onClick={() => removePost(p.id)} className="text-red-500 text-sm">Xóa</button>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 text-gray-800 whitespace-pre-line">{p.content}</div>

                  {imgs.length > 0 && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {imgs.map((img, idx) => (
                        <button key={idx} onClick={() => openLightbox(imgs, idx)} className="block">
                          <img src={getFileUrl(img)} alt={`img-${idx}`} className="w-full h-44 object-cover rounded" />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        {top.map((k) => <span key={k} className="text-lg">{REACTION_EMOJI[k]}</span>)}
                        <div className="text-sm text-gray-500 ml-2">{totalReacts ? totalReacts : ""}</div>
                      </div>

                      <div className="relative">
                        <ReactionPicker
                          onSelect={(type) => handleReact({ postId: p.id, reactionType: type })}
                          current={reaction.myType}
                          onQuick={() => handleReact({ postId: p.id, reactionType: "LIKE" })}
                        />
                      </div>

                      <button onClick={() => toggleComments(p.id)} className="flex items-center gap-2">
                        <FiMessageCircle /> Bình luận ({p.commentCount ?? 0})
                      </button>
                    </div>

                    <div className="text-xs text-gray-400"> {/* no IDs shown */} </div>
                  </div>

                  {/* Comments panel (single input only, parent-controlled) */}
                  {openComments[p.id] && (
                    <div className="mt-3 border-t pt-3">
                      <CommentsBlock
                        postId={p.id}
                        comments={commentsByPost[p.id] || []}
                        onAddComment={addComment}
                        onReply={(parentId, parentName) => setReplyTo(p.id, parentId, parentName)}
                        fetchReactionsForComment={fetchReactionsForComment}
                        reactionSummary={reactionSummary}
                        onReact={handleReact}
                      />

                      <div className="mt-3">
                        <div className="flex gap-2">
                          <img src={user?.avatarFile ? getFileUrl(user.avatarFile) : "https://i.pravatar.cc/40"} alt="me" className="w-8 h-8 rounded-full" />
                          <div className="flex-1">
                            <input
                              value={replyContext[p.id]?.draftText ?? ""}
                              onChange={(e) => setReplyContext((s) => ({ ...s, [p.id]: { ...(s[p.id] || {}), draftText: e.target.value } }))}
                              placeholder={replyContext[p.id] ? `Trả lời @${replyContext[p.id].parentName}...` : "Viết bình luận..."}
                              className="w-full border p-2 rounded"
                            />
                            <div className="flex gap-2 mt-2">
                              {replyContext[p.id] && <button onClick={() => clearReplyFor(p.id)} className="px-3 py-1 border rounded">Hủy</button>}
                              <button onClick={() => submitReplyFor(p.id)} className="px-3 py-1 bg-emerald-600 text-white rounded">Gửi</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      {lightbox.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={closeLightbox}>
          <div className="max-w-4xl w-full p-4" onClick={(e) => e.stopPropagation()}>
            <img src={getFileUrl(lightbox.images[lightbox.index])} alt="preview" className="w-full h-auto rounded" />
            <div className="flex justify-between mt-3">
              <div className="text-white">{lightbox.index + 1} / {lightbox.images.length}</div>
              <button onClick={closeLightbox} className="text-white bg-black/40 px-3 py-1 rounded">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ReactionPicker with hover-stay delay */
function ReactionPicker({ onSelect, current, onQuick }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);

  const openNow = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    setOpen(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 300);
  };

  return (
    <div className="inline-flex items-center relative" onMouseEnter={openNow} onMouseLeave={scheduleClose}>
      <button onClick={() => onQuick && onQuick()} className={`flex items-center gap-2 px-3 py-1 rounded ${current ? "text-emerald-600 font-medium" : ""}`}>
        <FiHeart /> Thích
      </button>

      {open && (
        <div className="absolute -top-12 left-0 bg-white rounded-full px-3 py-2 shadow-lg flex items-center gap-2 z-50">
          {Object.entries(REACTION_EMOJI).map(([k, e]) => (
            <button key={k} onClick={() => onSelect(k)} className="text-xl leading-none hover:scale-110 transition" aria-label={k}>
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

ReactionPicker.propTypes = {
  onSelect: PropTypes.func.isRequired,
  current: PropTypes.string,
  onQuick: PropTypes.func,
};

/* CommentsBlock: display only; replies & input handled by parent */
function CommentsBlock({ postId, comments = [], onAddComment, onReply, fetchReactionsForComment, reactionSummary, onReact }) {
  const renderComment = (c) => {
    const reaction = reactionSummary ? reactionSummary[`comment_${c.id}`] || { counts: {}, myType: null } : { counts: {}, myType: null };
    const counts = reaction.counts || {};
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => k);

    return (
      <div key={c.id} className="flex gap-3">
        <img src={c.userAvatar ? getFileUrl(c.userAvatar) : "https://i.pravatar.cc/40"} alt="a" className="w-8 h-8 rounded-full object-cover" />
        <div className="flex-1">
          <div className="bg-gray-100 p-2 rounded">
            <div className="text-sm font-medium">{c.userFullName || "Người dùng"}</div>
            <div className="text-sm text-gray-700 whitespace-pre-line">
              {c.parentFullName && <strong className="mr-1">@{c.parentFullName}</strong>}
              <span>{c.content}</span>
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-1 flex gap-3 items-center">
            <div className="flex items-center gap-2">
              {top.map((k) => <span key={k} className="text-sm">{REACTION_EMOJI[k]}</span>)}
              <span>{total ? total : ""}</span>
            </div>

            <ReactionPicker
              onSelect={(type) => onReact({ commentId: c.id, reactionType: type })}
              current={reaction.myType}
              onQuick={() => onReact({ commentId: c.id, reactionType: "LIKE" })}
            />

            <button onClick={() => { onReply(c.id, c.userFullName); }} className="hover:underline">Trả lời</button>
            {c.canDelete && (
              <button onClick={() => deleteComment(c.id)} className="text-red-500 hover:underline text-xs">Xóa</button>
            )}
            <div>{new Date(c.createdAt).toLocaleString()}</div>
          </div>

          {c.children && c.children.length > 0 && (
            <div className="mt-2 ml-6 space-y-2">
              {c.children.map(renderComment)}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="space-y-3">
        {comments.map(renderComment)}
        {!comments.length && <div className="text-sm text-gray-500">Chưa có bình luận.</div>}
      </div>
    </div>
  );
}

CommentsBlock.propTypes = {
  postId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  comments: PropTypes.array,
  onAddComment: PropTypes.func,
  onReply: PropTypes.func,
  fetchReactionsForComment: PropTypes.func,
  reactionSummary: PropTypes.object,
  onReact: PropTypes.func,
};
