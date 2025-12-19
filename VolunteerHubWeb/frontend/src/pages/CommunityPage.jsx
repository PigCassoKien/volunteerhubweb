import { FiHome, FiUsers, FiMapPin, FiHeart, FiClock, FiSearch } from "react-icons/fi";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { toast } from "react-toastify";
import { getFileUrl } from "../utils/files";

const sampleVolunteers = [
  {
    id: 1,
    fullName: "Nguyễn Thị Mai",
    role: "Tình nguyện viên tích cực",
    location: "Hà Nội",
    avatar: "/images/avatar1.jpg",
    events: 24,
    hours: 156,
    description:
      "Đam mê hoạt động tình nguyện, đặc biệt là các dự án giáo dục cho trẻ em vùng cao.",
    tags: ["Giáo dục", "Môi trường", "Y tế"],
    email: "mai@example.com",
  },
  {
    id: 2,
    fullName: "Trần Văn Hùng",
    role: "Quản lý dự án",
    location: "TP. Hồ Chí Minh",
    avatar: "/images/avatar2.jpg",
    events: 32,
    hours: 248,
    description: "Có kinh nghiệm tổ chức và quản lý các dự án tình nguyện quy mô lớn.",
    tags: ["Quản lý", "Tổ chức", "Lãnh đạo"],
    email: "hung@example.com",
  },
  {
    id: 3,
    fullName: "Lê Thị Hoa",
    role: "Sinh viên tình nguyện",
    location: "Đà Nẵng",
    avatar: "/images/avatar3.jpg",
    events: 15,
    hours: 98,
    description: "Sinh viên năm 3, yêu thích các hoạt động cộng đồng và phát triển bản thân.",
    tags: ["Truyền thông", "Thiết kế", "Sáng tạo"],
    email: "hoa@example.com",
  },
];

// Manual testimonials (static UI-only)
const testimonials = [
  {
    id: 1,
    text: "Tham gia Volunteer Hub đã thay đổi cuộc sống của tôi. Tôi đã gặp được nhiều người bạn tuyệt vời và cùng nhau tạo ra những đóng góp tích cực cho cộng đồng.",
    author: "Người dùng ẩn danh",
    avatar: "/images/default-avatar.jpg",
    events: 12,
    hours: 84,
  },
  {
    id: 2,
    text: "Hoạt động tại đây giúp tôi phát triển kỹ năng lãnh đạo và giao tiếp — mỗi dự án là một thử thách bổ ích.",
    author: "Nguyễn Văn B",
    avatar: "/images/default-avatar.jpg",
    events: 8,
    hours: 56,
  },
  {
    id: 3,
    text: "Môi trường ấm áp và nhiệt huyết, tôi luôn muốn đóng góp nhiều hơn cho cộng đồng.",
    author: "Trần Thị C",
    avatar: "/images/default-avatar.jpg",
    events: 5,
    hours: 30,
  },
];

const CommunityPage = () => {
  const [tab, setTab] = useState("volunteers");
  const [volunteers, setVolunteers] = useState(sampleVolunteers);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);
  const [topVolunteers, setTopVolunteers] = useState([]);
  const [messageModal, setMessageModal] = useState({ open: false, target: null, text: "" });
  const searchTimer = useRef(null);

  useEffect(() => {
    // load stats and top volunteers once
    const loadMeta = async () => {
      try {
        const [sRes, topRes] = await Promise.all([
          axios.get("/users/community/stats").catch(() => null),
          axios.get("/users/volunteers/top?limit=10").catch(() => null),
        ]);
        if (sRes && sRes.data) setStats(sRes.data);
        if (topRes && topRes.data) {
          const arr = topRes.data || [];
          const onlyVolunteers = arr.filter((u) => {
            if (!u) return false;
            // Accept when role is missing (backwards-compatible) or explicitly VOLUNTEER
            if (!u.role && !u.userRole) return true;
            const roleVal = (u.role || u.userRole || "").toString().toUpperCase();
            return roleVal === "VOLUNTEER";
          });
          setTopVolunteers(onlyVolunteers.slice(0, 3));
        }
      } catch (e) {
        // ignore
      }
    };
    loadMeta();
  }, []);

  useEffect(() => {
    // debounce search and load paged volunteers
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      (async () => {
        setLoading(true);
        try {
          const res = await axios.get("/users/volunteers", { params: { q: search || undefined, page, size } });
          // spring Page<T> -> { content, totalPages, totalElements, number }
          const body = res.data;
          let items = [];
          if (Array.isArray(body)) items = body;
          else if (body && body.content) items = body.content;

          const mapped = (items || []).map((u) => ({
            id: u.id,
            fullName: u.fullName || u.email,
            role: (u.role || u.userRole || "").toString(),
            location: u.address || "",
            avatar: u.avatarFile || "/images/default-avatar.jpg",
            events: u.eventsCount || u.registrations || 0,
            hours: u.hours || 0,
            description: u.publicProfile || "",
            tags: (u.skills || []).slice(0, 5),
            email: u.email,
          }));

          // Keep only users whose role is explicitly VOLUNTEER
          const onlyVolunteers = mapped.filter((m) => (m.role || "").toUpperCase() === "VOLUNTEER");

          setVolunteers(onlyVolunteers.length ? onlyVolunteers : sampleVolunteers);
          if (body && typeof body.totalPages !== "undefined") setTotalPages(body.totalPages);
          if (body && typeof body.totalElements !== "undefined") setTotal(body.totalElements);
        } catch (e) {
          // fallback to sample data
        } finally {
          setLoading(false);
        }
      })();
    }, 300);

    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [search, page, size]);

  const filtered = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return volunteers;
    return volunteers.filter((v) => {
      return (
        (v.fullName || "").toLowerCase().includes(q) ||
        (v.location || "").toLowerCase().includes(q) ||
        (v.tags || []).some((t) => t.toLowerCase().includes(q)) ||
        (v.role || "").toLowerCase().includes(q)
      );
    });
  }, [volunteers, search]);

  // Use static/manual testimonials for UI (no DB required)
  const testimonialsToShow = testimonials;

  const navigate = useNavigate();

  const openMessage = (v) => setMessageModal({ open: true, target: v, text: "" });

  const ConnectButton = ({ v }) => {
    return (
      <button
        onClick={() => {
          // Navigate to user's profile page (view-only if possible)
          const targetId = v?.id ?? v?.userId;
          if (targetId) {
            navigate(`/profile/${targetId}`);
            return;
          }
          if (v?.email) {
            // fallback: open mail client
            window.location.href = `mailto:${v.email}`;
            return;
          }
          toast.info("Không có thông tin liên hệ của người này.");
        }}
        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition flex justify-center gap-2"
      >
        <FiUsers /> Kết nối
      </button>
    );
  };

  const closeMessage = () => setMessageModal({ open: false, target: null, text: "" });

  const sendMessage = async () => {
    if (!messageModal.target) return closeMessage();
    const payload = { eventId: null, content: messageModal.text || "Xin chào", includeSender: false };
    try {
      await axios.post("/notifications/custom", payload);
      toast.success("Đã gửi tin nhắn (nếu bạn có quyền gửi). kiểm tra thông báo.");
    } catch (err) {
      if (err?.response?.status === 401) {
        toast.error("Vui lòng đăng nhập để gửi tin nhắn.");
      } else if (err?.response?.status === 403) {
        toast.error("Tính năng gửi thông báo chỉ dành cho quản trị / quản lý sự kiện.");
      } else {
        toast.error("Không thể gửi tin nhắn ngay bây giờ.");
      }
    } finally {
      closeMessage();
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Banner */}
      <div
        className="relative h-[280px] bg-cover bg-center flex items-center justify-center text-center"
        style={{ backgroundImage: `url('/images/community-banner.jpg')` }}
      >
        <div className="absolute inset-0 bg-emerald-800/50"></div>

        <div className="absolute top-5 left-0 w-full z-20">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="text-white/90 text-sm">
              <ol className="flex items-center space-x-2">
                <li>
                  <a href="/" className="hover:text-white">Trang chủ</a>
                </li>
                <li>/</li>
                <li className="font-semibold text-white">Cộng đồng</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Title */}
        <div className="relative z-10 text-white">
          <h1 className="text-5xl font-bold">Cộng đồng tình nguyện viên</h1>
          <p className="mt-3 text-lg">Kết nối với hàng nghìn tình nguyện viên nhiệt huyết trên khắp cả nước</p>
        </div>
      </div>

      {/* Stats */}
      <div className="relative -mt-12 max-w-7xl mx-auto z-20">
        <div className="bg-white rounded-2xl shadow-lg p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-3">
              <FiUsers className="text-green-600" size={24} />
            </div>
            <p className="text-2xl font-bold">12,458</p>
            <p className="text-gray-600">Tình nguyện viên</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-3">
              <FiMapPin className="text-blue-600" size={24} />
            </div>
            <p className="text-2xl font-bold">63</p>
            <p className="text-gray-600">Tỉnh thành</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-purple-100 flex items-center justify-center mb-3">
              <FiHeart className="text-purple-600" size={24} />
            </div>
            <p className="text-2xl font-bold">1,245</p>
            <p className="text-gray-600">Dự án hoàn thành</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-orange-100 flex items-center justify-center mb-3">
              <FiClock className="text-orange-600" size={24} />
            </div>
            <p className="text-2xl font-bold">98,456</p>
            <p className="text-gray-600">Giờ tình nguyện</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex border rounded-xl bg-white overflow-hidden shadow-sm">
          <button
            onClick={() => setTab("volunteers")}
            className={`flex-1 py-3 font-medium ${tab === "volunteers" ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
            Tình nguyện viên
          </button>

          <button
            onClick={() => setTab("stories")}
            className={`flex-1 py-3 ${tab === "stories" ? "bg-green-50 text-gray-800" : "text-gray-600 hover:bg-gray-100"}`}>
            Câu chuyện
          </button>

          <button
            onClick={() => setTab("ranking")}
            className={`flex-1 py-3 ${tab === "ranking" ? "bg-green-50 text-gray-800" : "text-gray-600 hover:bg-gray-100"}`}>
            Bảng xếp hạng
          </button>
        </div>
      </div>

      {/* Search box */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="relative bg-white shadow-sm rounded-xl p-4 flex items-center border">
          <FiSearch className="text-gray-400 mr-3" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none text-gray-700"
            placeholder="Tìm kiếm tình nguyện viên theo tên, địa điểm hoặc kỹ năng..."
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 mt-10">
        {tab === "volunteers" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full p-10 text-center">Đang tải...</div>
            ) : filtered.length === 0 ? (
              <div className="col-span-full p-6 text-center text-gray-500">Không tìm thấy tình nguyện viên phù hợp.</div>
            ) : (
              filtered.map((v) => (
                <div key={v.id} className="bg-white rounded-2xl p-6 shadow-md">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative">
                      <img src={getFileUrl(v.avatar)} alt="avatar" className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-md" />
                      <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
                    </div>

                    <h3 className="text-xl font-semibold mt-4">{v.fullName}</h3>
                    <p className="text-green-600 font-medium">{v.role}</p>

                    <p className="text-gray-500 text-sm flex items-center gap-1 mt-1"><FiMapPin /> {v.location}</p>
                  </div>

                    <div className="rounded-xl p-4 flex justify-between mt-5 bg-gray-50">
                    <div className="text-center">
                      <p className="text-xl font-bold">{v.events}</p>
                      <p className="text-gray-600 text-sm">Sự kiện</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold">{v.hours}</p>
                      <p className="text-gray-600 text-sm">Giờ</p>
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm mt-4">{v.description}</p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {(v.tags || []).map((t, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{t}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-6">
                    <ConnectButton v={v} />

                    <button onClick={() => openMessage(v)} className="ml-3 w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100">💬</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "stories" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonialsToShow.map((t) => (
              <div key={t.id} className="bg-white rounded-xl p-6 shadow-sm flex gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                  <img src={getFileUrl(t.avatar || "/images/default-avatar.jpg")} alt="av" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-gray-800">“{t.text}”</p>
                  <div className="mt-3 text-sm text-gray-600 font-medium">— {t.author}</div>
                  <div className="mt-2 text-xs text-gray-500">{t.events ?? 0} sự kiện · {t.hours ?? 0} giờ</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "ranking" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Top tình nguyện viên theo số đăng ký</h3>
              {topVolunteers.length === 0 ? (
                <p className="text-gray-500">Không có dữ liệu.</p>
              ) : (
                <ol className="space-y-3">
                  {topVolunteers.map((t, i) => (
                    <li key={t.userId} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img src={getFileUrl(t.avatarFile || "/images/default-avatar.jpg")} alt="av" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{t.fullName}</div>
                        <div className="text-xs text-gray-500">{t.registrations} đăng ký</div>
                      </div>
                      <div className="text-sm text-gray-600">#{i + 1}</div>
                    </li>
                  ))}
                </ol>
              )}
                {/* Testimonials under top volunteers */}
                <div className="mt-6">
                  <h4 className="text-sm font-semibold mb-3">Lời chia sẻ tiêu biểu</h4>
                  <div className="space-y-3">
                    {testimonialsToShow.slice(0, 3).map((tt) => (
                      <div key={tt.id} className="p-3 bg-gray-50 rounded flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          <img src={getFileUrl(tt.avatar || "/images/default-avatar.jpg")} alt="av" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-800">{tt.text}</p>
                          <div className="mt-1 text-xs text-gray-600">— {tt.author} · {tt.events ?? 0} sự kiện · {tt.hours ?? 0} giờ</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Thống kê cộng đồng</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-700"><span>Tổng tình nguyện viên</span><span>{stats?.totalVolunteers ?? "-"}</span></div>
                <div className="flex justify-between text-sm text-gray-700"><span>Số tỉnh/thành</span><span>{stats?.provincesCount ?? "-"}</span></div>
                <div className="flex justify-between text-sm text-gray-700"><span>Tổng sự kiện</span><span>{stats?.totalEvents ?? "-"}</span></div>
                <div className="flex justify-between text-sm text-gray-700"><span>Tổng đăng ký</span><span>{stats?.totalRegistrations ?? "-"}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pagination for volunteers */}
      {tab === "volunteers" && totalPages > 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-6 flex justify-center items-center gap-3">
          <button disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))} className="px-3 py-1 border rounded">Trước</button>
          <div className="text-sm text-gray-600">Trang {page + 1} / {Math.max(1, totalPages)}</div>
          <button disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border rounded">Tiếp</button>
        </div>
      )}

      {/* Message Modal */}
      {messageModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg bg-white rounded-xl p-6">
            <h3 className="text-lg font-semibold">Gửi tin nhắn tới {messageModal.target?.fullName}</h3>
            <textarea
              value={messageModal.text}
              onChange={(e) => setMessageModal((m) => ({ ...m, text: e.target.value }))}
              className="w-full mt-4 p-3 border rounded-md h-36"
              placeholder="Viết tin nhắn..."
            />

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={closeMessage} className="px-4 py-2 rounded-md border">Hủy</button>
              <button onClick={sendMessage} className="px-4 py-2 rounded-md bg-emerald-600 text-white">Gửi</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CommunityPage;
