import { useEffect, useState } from "react";
import axios from "axios";

export default function EventChannel({ eventId }) {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // Load danh sách bài viết
  useEffect(() => {
    if (!token || !eventId) return;

    const fetchPosts = async () => {
      try {
        const res = await axios.get(`/api/posts/event/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPosts(res.data);
      } catch (err) {
        console.log("Lỗi tải bài viết", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [eventId, token]);

  // Xử lý đăng bài
  const handleCreatePost = async () => {
    if (!content.trim()) {
      return alert("Bạn chưa nhập nội dung!");
    }

    try {
      await axios.post(
        "/api/posts/create",
        {
          content,
          eventId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Bài viết đã gửi chờ duyệt!");
      setContent("");

    } catch (err) {
      alert("Không thể đăng bài");
    }
  };

  if (!token)
    return <p className="text-center text-gray-500">Hãy đăng nhập để trao đổi.</p>;

  return (
    <div className="mt-6 bg-white p-5 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Kênh trao đổi sự kiện</h2>

      {/* Form đăng bài */}
      <textarea
        className="w-full border p-3 rounded-lg"
        placeholder="Chia sẻ cảm nghĩ của bạn..."
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <button
        onClick={handleCreatePost}
        className="mt-3 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
      >
        Đăng bài
      </button>

      <hr className="my-5" />

      {/* Danh sách bài viết */}
      {loading ? (
        <p>Đang tải bài viết...</p>
      ) : posts.length === 0 ? (
        <p className="text-gray-500">Chưa có bài viết nào.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((p) => (
            <div key={p.id} className="border rounded-lg p-4 bg-gray-50">
              <p className="font-semibold">Người đăng: {p.userId}</p>
              <p>{p.content}</p>
              <p className="text-sm text-gray-500">
                {new Date(p.createdAt).toLocaleString("vi-VN")}
              </p>
              {p.status !== "APPROVED" && (
                <p className="text-xs text-yellow-600 mt-1">(Chờ duyệt)</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
