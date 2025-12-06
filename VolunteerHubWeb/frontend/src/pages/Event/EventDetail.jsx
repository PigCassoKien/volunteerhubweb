import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../api/axios";
import EventChannel from "./EventChannel";
import RegistrationForm from "./RegistrationForm";
import EventMyPosts from "./EventMyPosts"; // new
import { getFileUrl } from "../../utils/files";

const Badge = ({ children, className = "" }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-medium ${className}`}>{children}</span>
);

const StatItem = ({ label, value, icon }) => (
  <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">{icon}</div>
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="font-semibold text-gray-800">{value}</div>
    </div>
  </div>
);

export default function EventDetail() {
  const { id } = useParams();
  // khai báo storedUser để dùng trong component
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [registrationId, setRegistrationId] = useState(null);
  const [approvedCount, setApprovedCount] = useState(0);
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
  const [activeTab, setActiveTab] = useState("info");

  // Load event
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

  // Check my registration for this event
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    if (!token || !id) return;

    const fetchHistory = async () => {
      try {
        const res = await axios.post("/registrations/history", {
          startDate: "2000-01-01T00:00:00",
          endDate: "2100-01-01T00:00:00",
          status: null,
          categoryId: null,
          sortBy: "dateDesc",
        });
        const regsForEvent = (res.data || []).filter(r => r.eventId === Number(id));
        if (regsForEvent.length) {
          const priority = { APPROVED: 3, PENDING: 2, COMPLETED: 1, CANCELED: 0, REJECTED: 0 };
          regsForEvent.sort((a, b) =>
            (priority[b.status] - priority[a.status]) ||
            (new Date(b.registeredAt) - new Date(a.registeredAt))
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

  // Cancel registration before event starts
  const handleCancelRegistration = async () => {
    if (!registrationId) return;
    if (!confirm("Bạn có chắc muốn huỷ đăng ký?")) return;
    try {
      const res = await axios.put(`/registrations/cancel/${registrationId}`);
      alert("Đã huỷ đăng ký");
      // refresh local status
      setRegistrationStatus(res.data.status);
      // reload counts / event info
      const ev = await axios.get(`/events/get/${id}`);
      setEvent(ev.data);
      // refresh approved count
      const { data: regs } = await axios.get(`/registrations/event/${id}`);
      setApprovedCount(regs.filter(r => r.status === "APPROVED").length);
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || "Huỷ đăng ký thất bại");
    }
  };

  // Prefill form
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user && user.fullName) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || "",
        email: user.email || "",
        address: user.address || "",
        phone: user.phoneNumber || "",
      }));
    }
  }, []);

  // Approved count cho progress
  useEffect(() => {
    const fetchApprovedCount = async () => {
      if (!id) return;
      try {
        const res = await axios.get(`/registrations/count/${id}`, { params: { status: "APPROVED" } });
        setApprovedCount(typeof res.data === "number" ? res.data : (res.data?.approved ?? 0));
      } catch {
        // fallback nếu endpoint khác tên
        try {
          const res2 = await axios.get(`/registrations/count/approved/${id}`);
          setApprovedCount(typeof res2.data === "number" ? res2.data : (res2.data?.approved ?? 0));
        } catch {
          setApprovedCount(0);
        }
      }
    };
    fetchApprovedCount();
  }, [id]);

  const submitRegistration = async () => {
    // minimal client-side validation and ensure payload shape matches EventRegistrationRequestDTO
    if (!formData.fullName || !formData.phone || !formData.email) {
      return alert("Vui lòng điền họ tên, số điện thoại và email.");
    }
    if (!formData.dateOfBirth) return alert("Vui lòng chọn ngày sinh.");
    if (!formData.confirmation) return alert("Bạn phải xác nhận tham gia.");

    try {
      setLoading(true);

      // normalize dateOfBirth -> yyyy-MM-dd
      let dob = formData.dateOfBirth;
      if (dob && dob.includes("T")) dob = dob.split("T")[0];

      const payload = {
        fullName: formData.fullName || "",
        gender: formData.gender || "Other",
        dateOfBirth: dob, // LocalDate expected: "yyyy-MM-dd"
        address: formData.address || "",
        occupation: formData.occupation || "",
        about: formData.about || "",
        phone: formData.phone || "",
        email: formData.email || "",
        school: formData.school || null,
        experience: formData.experience || null,
        skills: formData.skills || null,
        confirmation: Boolean(formData.confirmation),
      };

      // debug: log payload to Network console before sending
      console.debug("Register payload:", payload);

      const { data } = await axios.post(`/registrations/register/${id}`, payload);
      // success: update UI
      setRegistrationStatus(data.status);
      setRegistrationId(data.id);
      alert("Đăng ký thành công");
    } catch (err) {
      console.error("Đăng ký thất bại:", err.response?.data || err);
      alert(err.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  const renderRegisterButton = () => {
    // if approved and event not started -> show cancel
    const eventStarted = event && new Date(event.startDate) <= new Date();
    if (registrationStatus === "APPROVED" && !eventStarted) {
      return (
        <div className="flex gap-2">
          <button onClick={handleCancelRegistration} className="px-4 py-2 bg-red-600 text-white rounded-lg">
            Huỷ đăng ký
          </button>
        </div>
      );
    }
    if (registrationStatus === "APPROVED") {
      return (
        <button className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
          Đã đăng ký
        </button>
      );
    }
    if (registrationStatus === "PENDING") {
      return (
        <button className="px-5 py-2.5 rounded-lg bg-yellow-400 text-black hover:bg-yellow-500 transition">
          Đang chờ xác nhận
        </button>
      );
    }
    return (
      <button
        onClick={() => setShowForm(true)}
        className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
      >
        Đăng ký tham gia
      </button>
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200"></div>
        <div className="max-w-5xl mx-auto p-6 grid md:grid-cols-3 gap-6 -mt-10">
          <div className="md:col-span-2 bg-white rounded-xl h-40"></div>
          <div className="bg-white rounded-xl h-40"></div>
        </div>
      </div>
    );
  }

  if (!event) return <div className="p-6 text-center">Không tìm thấy sự kiện.</div>;

  const capacity = event.maxParticipants || 50;
  const progress = capacity > 0 ? Math.min(100, (approvedCount / capacity) * 100) : 0;
  const imgSrc = getFileUrl(event?.imageFile);

  const statusBadge =
    registrationStatus === "APPROVED" ? "bg-blue-100 text-blue-700" :
    registrationStatus === "PENDING" ? "bg-yellow-100 text-yellow-800" :
    "bg-emerald-100 text-emerald-700";

  const canAccessChannel =
    event &&
    (
      // approved participants AND approved event
      (event.status === "APPROVED" && registrationStatus === "APPROVED")
      // OR event creator (manager) can always access channel for their event
      || (storedUser && storedUser.role === "EVENT_MANAGER" && storedUser.id === event.createdById)
      // OR admins (if needed)
      || (storedUser && (storedUser.role === "ADMIN"))
    );

  return (
    <>
      <div className="bg-gray-50">
        <div className="relative h-64 md:h-80 w-full">
          <img src={imgSrc} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-full max-w-5xl px-6">
            <div className="flex flex-wrap items-center justify-between">
              <div>
                <h1 className="text-white text-2xl md:text-3xl font-bold">{event.title}</h1>
                <p className="text-gray-200">{event.location}</p>
                <p className="text-gray-300 text-sm">
                  {new Date(event.startDate).toLocaleString("vi-VN")} - {new Date(event.endDate).toLocaleString("vi-VN")}
                </p>
              </div>
              <Badge className={`${statusBadge} shadow`}>
                {registrationStatus === "APPROVED" ? "Bạn đã đăng ký"
                  : registrationStatus === "PENDING" ? "Chờ xác nhận"
                  : "Chưa đăng ký"}
              </Badge>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto p-6 -mt-10">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Left: Detail card */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow-sm p-6">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge className="bg-emerald-100 text-emerald-700">
                  {event.category?.name || "Khác"}
                </Badge>
                <Badge className={
                  event.status === "APPROVED" ? "bg-green-100 text-green-700" :
                  event.status === "PENDING" ? "bg-orange-100 text-orange-700" :
                  event.status === "COMPLETED" ? "bg-gray-200 text-gray-700" :
                  event.status === "CANCELED" ? "bg-red-100 text-red-700" :
                  "bg-gray-100 text-gray-700"
                }>
                  Trạng thái: {event.status}
                </Badge>
              </div>

              <p className="text-gray-700 leading-relaxed">
                {event.description || "Sự kiện cộng đồng."}
              </p>

              {/* Progress */}
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Đã duyệt</span>
                  <span>{approvedCount}/{capacity}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-emerald-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-sm text-gray-500 mt-2">Còn lại: {Math.max(0, capacity - approvedCount)}</p>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {renderRegisterButton()}
              </div>
            </div>

            {/* Right: Stats */}
            <div className="space-y-3">
              <StatItem
                label="Địa điểm"
                value={event.location}
                icon={<i className="fa-solid fa-location-dot" />}
              />
              <StatItem
                label="Thời gian bắt đầu"
                value={new Date(event.startDate).toLocaleString("vi-VN")}
                icon={<i className="fa-regular fa-clock" />}
              />
              <StatItem
                label="Sức chứa"
                value={`${capacity} người`}
                icon={<i className="fa-solid fa-users" />}
              />
              <StatItem
                label="Người tạo"
                value={event.createdByFullName || "Quản lý sự kiện"}
                icon={<i className="fa-regular fa-user" />}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="max-w-6xl mx-auto px-4 mt-6">
            <div className="flex gap-3 border-b pb-3">
              <button
                className={`px-4 py-2 -mb-px ${activeTab === "info" ? "border-b-2 border-emerald-600 text-emerald-600" : "text-gray-600"}`}
                onClick={() => setActiveTab("info")}
              >
                Thông tin
              </button>

              {event?.status === "APPROVED" && (
                <button
                  className={`px-4 py-2 -mb-px ${activeTab === "channel" ? "border-b-2 border-emerald-600 text-emerald-600" : "text-gray-600"}`}
                  onClick={() => setActiveTab("channel")}
                >
                  Kênh trao đổi
                </button>
              )}

              {storedUser && (
                <button
                  className={`px-4 py-2 -mb-px ${activeTab === "myposts" ? "border-b-2 border-emerald-600 text-emerald-600" : "text-gray-600"}`}
                  onClick={() => setActiveTab("myposts")}
                >
                  Bài đăng của bạn
                </button>
              )}

              {/* show channel tab also if creator/manager */}
              {canAccessChannel && event?.status !== "APPROVED" && (
                <button
                  className={`px-4 py-2 -mb-px ${activeTab === "channel" ? "border-b-2 border-emerald-600 text-emerald-600" : "text-gray-600"}`}
                  onClick={() => setActiveTab("channel")}
                >
                  Kênh trao đổi
                </button>
              )}
            </div>

            <div className="mt-6">
              {activeTab === "info" && (
                <>
                  {/* ...existing EventDetail info rendering ... */}
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Left: Detail card */}
                    <div className="md:col-span-2 bg-white rounded-2xl shadow-sm p-6">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <Badge className="bg-emerald-100 text-emerald-700">
                          {event.category?.name || "Khác"}
                        </Badge>
                        <Badge className={
                          event.status === "APPROVED" ? "bg-green-100 text-green-700" :
                          event.status === "PENDING" ? "bg-orange-100 text-orange-700" :
                          event.status === "COMPLETED" ? "bg-gray-200 text-gray-700" :
                          event.status === "CANCELED" ? "bg-red-100 text-red-700" :
                          "bg-gray-100 text-gray-700"
                        }>
                          Trạng thái: {event.status}
                        </Badge>
                      </div>

                      <p className="text-gray-700 leading-relaxed">
                        {event.description || "Sự kiện cộng đồng."}
                      </p>

                      {/* Progress */}
                      <div className="mt-6">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Đã duyệt</span>
                          <span>{approvedCount}/{capacity}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full">
                          <div className="h-2 bg-emerald-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Còn lại: {Math.max(0, capacity - approvedCount)}</p>
                      </div>

                      {/* Actions */}
                      <div className="mt-6 flex flex-wrap items-center gap-3">
                        {renderRegisterButton()}
                      </div>
                    </div>

                    {/* Right: Stats */}
                    <div className="space-y-3">
                      <StatItem
                        label="Địa điểm"
                        value={event.location}
                        icon={<i className="fa-solid fa-location-dot" />}
                      />
                      <StatItem
                        label="Thời gian bắt đầu"
                        value={new Date(event.startDate).toLocaleString("vi-VN")}
                        icon={<i className="fa-regular fa-clock" />}
                      />
                      <StatItem
                        label="Sức chứa"
                        value={`${capacity} người`}
                        icon={<i className="fa-solid fa-users" />}
                      />
                      <StatItem
                        label="Người tạo"
                        value={event.createdByFullName || "Quản lý sự kiện"}
                        icon={<i className="fa-regular fa-user" />}
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === "channel" && canAccessChannel && (
                <EventChannel eventId={id} />
              )}

              {activeTab === "channel" && !canAccessChannel && (
                <p className="text-gray-500">Bạn không có quyền truy cập kênh trao đổi của sự kiện này.</p>
              )}

              {activeTab === "myposts" && (
                <EventMyPosts eventId={id} />
              )}
            </div>
          </div>
        </div>

        {/* Form đăng ký */}
        {showForm && (
          <RegistrationForm
            formData={formData}
            setFormData={setFormData}
            onClose={() => setShowForm(false)}
            onSubmit={submitRegistration}
          />
        )}
      </div>
    </>
  );
}