import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../../api/axios";
import EventChannel from "./EventChannel";
import RegistrationForm from "./RegistrationForm";
import EventMyPosts from "./EventMyPosts";
import { getFileUrl } from "../../utils/files";

/** Reusable Badge */
const Badge = ({ children, className = "" }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

/** Reusable StatItem */
const StatItem = ({ label, value, icon }) => (
  <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="font-semibold text-gray-800">{value}</div>
    </div>
  </div>
);

export default function EventDetail() {
  const { id } = useParams();
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [registrationId, setRegistrationId] = useState(null);
  const [approvedCount, setApprovedCount] = useState(0);
  const [activeTab, setActiveTab] = useState("info");

  // Prefill form
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    occupation: "",
    about: "",
    phone: "",
    email: "",
    school: "",
    experience: "",
    skills: "",
    confirmation: false,
  });

  /*Load event*/
  useEffect(() => {
    const loadEvent = async () => {
      try {
        const res = await axios.get(`/events/get/${id}`);
        setEvent(res.data);
      } catch (e) {
        console.error("Lỗi tải sự kiện:", e);
      } finally {
        setLoading(false);
      }
    };
    if (id) loadEvent();
  }, [id]);

  /*Load registration history*/
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    if (!token || !id) return;

    const fetchHistory = async () => {
      try {
        const res = await axios.post("/registrations/history", {
          startDate: "2000-01-01T00:00:00",
          endDate: "2100-01-01T00:00:00",
        });

        const regsForEvent = res.data.filter((r) => r.eventId === Number(id));

        if (regsForEvent.length) {
          const priority = { APPROVED: 3, PENDING: 2, COMPLETED: 1, CANCELED: 0, REJECTED: 0 };
          regsForEvent.sort(
            (a, b) =>
              priority[b.status] - priority[a.status] ||
              new Date(b.registeredAt) - new Date(a.registeredAt)
          );

          setRegistrationStatus(regsForEvent[0].status);
          setRegistrationId(regsForEvent[0].id);
        } else {
          setRegistrationStatus(null);
          setRegistrationId(null);
        }
      } catch (err) {
        console.error("Lỗi tải lịch sử đăng ký:", err);
      }
    };

    fetchHistory();
  }, [id]);

  /*Cancel registration*/
  const handleCancelRegistration = async () => {
    if (!registrationId) return;
    if (!confirm("Bạn có chắc muốn huỷ đăng ký?")) return;

    try {
      const res = await axios.put(`/registrations/cancel/${registrationId}`);
      alert("Đã huỷ đăng ký");
      setRegistrationStatus(res.data.status);

      const ev = await axios.get(`/events/get/${id}`);
      setEvent(ev.data);

      const { data: regs } = await axios.get(`/registrations/event/${id}`);
      setApprovedCount(regs.filter((r) => r.status === "APPROVED").length);
    } catch (err) {
      alert(err.response?.data?.message || "Huỷ đăng ký thất bại");
    }
  };

  /*Prefill user info*/
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.fullName) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.fullName,
        email: user.email,
        phone: user.phoneNumber,
        address: user.address,
      }));
    }
  }, []);

  /*Approved count*/
  useEffect(() => {
    const fetchApprovedCount = async () => {
      try {
        const res = await axios.get(`/registrations/count/${id}`, {
          params: { status: "APPROVED" },
        });
        setApprovedCount(res.data?.approved ?? res.data ?? 0);
      } catch {
        setApprovedCount(0);
      }
    };
    fetchApprovedCount();
  }, [id]);

  /*Submit Registration*/
  const submitRegistration = async () => {
    if (!formData.fullName || !formData.phone || !formData.email)
      return alert("Vui lòng điền họ tên, số điện thoại và email.");
    if (!formData.dateOfBirth) return alert("Vui lòng chọn ngày sinh.");
    if (!formData.confirmation) return alert("Bạn phải xác nhận tham gia.");

    try {
      setLoading(true);

      const dob = formData.dateOfBirth.split("T")[0];

      const payload = {
        ...formData,
        dateOfBirth: dob,
        confirmation: Boolean(formData.confirmation),
      };

      const { data } = await axios.post(
        `/registrations/register/${id}`,
        payload
      );

      setRegistrationStatus(data.status);
      setRegistrationId(data.id);
      alert("Đăng ký thành công");
    } catch (err) {
      alert(err.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  /*Render button*/
  const renderRegisterButton = () => {
    const eventStarted = event && new Date(event.startDate) <= new Date();

    if (registrationStatus === "APPROVED" && !eventStarted)
      return (
        <button
          onClick={handleCancelRegistration}
          className="px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          Huỷ đăng ký
        </button>
      );

    if (registrationStatus === "APPROVED")
      return (
        <button className="px-5 py-2.5 rounded-lg bg-blue-600 text-white">
          Đã đăng ký
        </button>
      );

    if (registrationStatus === "PENDING")
      return (
        <button className="px-5 py-2.5 rounded-lg bg-yellow-400 text-black">
          Đang chờ xác nhận
        </button>
      );

    return (
      <button
        onClick={() => setShowForm(true)}
        className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
      >
        Đăng ký tham gia
      </button>
    );
  };

  /*Rendering*/
  if (loading)
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200"></div>
        <div className="max-w-5xl mx-auto p-6 grid md:grid-cols-3 gap-6 -mt-10">
          <div className="md:col-span-2 bg-white rounded-xl h-40"></div>
          <div className="bg-white rounded-xl h-40"></div>
        </div>
      </div>
    );

  if (!event) return <div className="p-6 text-center">Không tìm thấy sự kiện.</div>;

  const imgSrc = getFileUrl(event?.imageFile);
  const capacity = event?.maxParticipants ?? 50;
  const progress = capacity > 0 ? Math.min(100, Math.max(0, (approvedCount / capacity) * 100)) : 0;

  const canAccessChannel =
    (event.status === "APPROVED" && registrationStatus === "APPROVED") ||
    (storedUser?.role === "EVENT_MANAGER" &&
      storedUser?.id === event.createdById) ||
    storedUser?.role === "ADMIN";

  /*BANNER đẹp giống EventList*/
  return (
    <div className="bg-gray-50 min-h-screen">

      {/* BANNER */}
      <div
        className="relative h-[280px] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${imgSrc})` }}
      >
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Breadcrumb */}
        <div className="absolute top-5 left-0 w-full z-20">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="text-white/90 text-sm">
              <ol className="flex items-center gap-2">
                <li>
                  <Link to="/" className="hover:text-white">
                    Trang chủ
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link to="/events" className="hover:text-white">
                    Danh sách sự kiện
                  </Link>
                </li>
                <li>/</li>
                <li className="font-semibold text-white">
                  {event.title}
                </li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl w-full mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl font-semibold">
                  {(event.title && event.title.charAt(0).toUpperCase()) || "V"}
                </div>
                <div>
                  <div className="text-sm text-white/90">{event.category?.name}</div>
                  <h1 className="text-3xl md:text-4xl font-bold leading-tight">{event.title}</h1>
                </div>
              </div>

              <div className="text-sm text-gray-200 mt-2">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-location-dot"></i>
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fa-regular fa-clock"></i>
                    <span>
                      {new Date(event.startDate).toLocaleString("vi-VN")} - {new Date(event.endDate).toLocaleString("vi-VN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-1 flex items-center justify-end">
              <div className="bg-white/90 rounded-2xl p-3 text-gray-800 shadow-md w-full md:w-auto">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Đã duyệt</div>
                    <div className="font-semibold text-lg">{approvedCount}/{capacity}</div>
                  </div>
                  <div className="w-20">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-2 bg-emerald-600 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex justify-center">
                  {renderRegisterButton()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-5xl mx-auto p-6 mt-6">

        <div className="grid md:grid-cols-3 gap-6">
          {/* LEFT: INFO */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm p-6">

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className="bg-emerald-100 text-emerald-700">
                {event.category?.name}
              </Badge>

              <Badge className="bg-blue-100 text-blue-700">
                {registrationStatus || "Chưa đăng ký"}
              </Badge>
            </div>

            <p className="text-gray-700 leading-relaxed">{event.description}</p>

            {/* PROGRESS */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Đã duyệt</span>
                <span>
                  {approvedCount}/{capacity}
                </span>
              </div>

              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-emerald-600 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <p className="text-sm text-gray-500 mt-2">
                Còn lại: {capacity - approvedCount}
              </p>
            </div>

            {/* ACTIONS */}
            <div className="mt-6">{renderRegisterButton()}</div>
          </div>

          {/* RIGHT: STATS */}
          <div className="space-y-3">
            <StatItem label="Địa điểm" value={event.location} icon={<i className="fa-solid fa-location-dot" />} />
            <StatItem
              label="Thời gian"
              value={new Date(event.startDate).toLocaleString("vi-VN")}
              icon={<i className="fa-regular fa-clock" />}
            />
            <StatItem label="Sức chứa" value={`${capacity} người`} icon={<i className="fa-solid fa-users" />} />
            <StatItem
              label="Người tạo"
              value={event.createdByFullName}
              icon={<i className="fa-regular fa-user" />}
            />
          </div>
        </div>

        {/* TABS */}
        <div className="mt-8">
          <div className="flex gap-3 border-b pb-2">
            <button
              className={`px-4 py-2 ${activeTab === "info"
                ? "border-b-2 border-emerald-600 text-emerald-600"
                : "text-gray-600"
                }`}
              onClick={() => setActiveTab("info")}
            >
              Thông tin
            </button>

            {event.status === "APPROVED" && (
              <button
                className={`px-4 py-2 ${activeTab === "channel"
                  ? "border-b-2 border-emerald-600 text-emerald-600"
                  : "text-gray-600"
                  }`}
                onClick={() => setActiveTab("channel")}
              >
                Kênh trao đổi
              </button>
            )}

            {storedUser && (
              <button
                className={`px-4 py-2 ${activeTab === "myposts"
                  ? "border-b-2 border-emerald-600 text-emerald-600"
                  : "text-gray-600"
                  }`}
                onClick={() => setActiveTab("myposts")}
              >
                Bài đăng của bạn
              </button>
            )}
          </div>

          <div className="mt-6">
            {activeTab === "info" && (
              <div className="text-gray-600 leading-relaxed">
                {event.description}
              </div>
            )}

            {activeTab === "channel" &&
              (canAccessChannel ? (
                <EventChannel eventId={id} />
              ) : (
                <p className="text-gray-500">
                  Bạn không có quyền truy cập kênh trao đổi.
                </p>
              ))}

            {activeTab === "myposts" && <EventMyPosts eventId={id} />}
          </div>
        </div>
      </div>

      {/* FORM ĐĂNG KÝ */}
      {showForm && (
        <RegistrationForm
          formData={formData}
          setFormData={setFormData}
          onClose={() => setShowForm(false)}
          onSubmit={submitRegistration}
        />
      )}
    </div>
  );
}
