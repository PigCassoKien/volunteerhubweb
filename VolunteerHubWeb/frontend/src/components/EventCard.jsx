import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { getFileUrl } from "../utils/files";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const EventCard = ({ event, status, isFavorited = false, onToggleFavorite = () => { } }) => {
  const {
    id, title, location, imageFile, startDate, endDate,
    maxParticipants, status: eventStatus, category, createdByFullName
  } = event;

  const [approvedCount, setApprovedCount] = useState(0);
  const [localStatus, setLocalStatus] = useState(() => {
    if (!status) return null;
    return typeof status === "string" ? status : status?.status;
  });

  useEffect(() => {
    const fetchApprovedCount = async () => {
      try {
        const [approvedRes, completedRes] = await Promise.all([
          axios.get(`/registrations/count/${id}`, { params: { status: "APPROVED" } }).catch(() => ({ data: 0 })),
          axios.get(`/registrations/count/${id}`, { params: { status: "COMPLETED" } }).catch(() => ({ data: 0 }))
        ]);
        const approved = Number(approvedRes?.data ?? 0);
        const completed = Number(completedRes?.data ?? 0);
        setApprovedCount(approved + completed);
      } catch (e) {
        setApprovedCount(0);
      }
    };
    if (id) fetchApprovedCount();
  }, [id]);

  const capacity = maxParticipants ?? 50;
  const progress = capacity > 0 ? Math.min(100, (approvedCount / capacity) * 100) : 0;

  const date = startDate ? new Date(startDate).toLocaleDateString("vi-VN") : "";
  const time = startDate && endDate
    ? `${new Date(startDate).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - ${new Date(endDate).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`
    : "";

  // derive status string and registration id (if any)
  const statusStr = typeof status === "string" ? status : status?.status || localStatus;
  const regId = typeof status === "object" ? status?.regId : null;

  // compute realtime time state
  const nowMs = Date.now();
  const startMs = startDate ? new Date(startDate).getTime() : null;
  const endMs = endDate ? new Date(endDate).getTime() : null;
  let timeState = "upcoming"; // upcoming | ongoing | ended
  if (startMs && endMs) {
    if (nowMs < startMs) timeState = "upcoming";
    else if (nowMs >= startMs && nowMs <= endMs) timeState = "ongoing";
    else timeState = "ended";
  } else if (endMs) {
    timeState = nowMs <= endMs ? "ongoing" : "ended";
  }

  const renderButton = () => {
    // On cards/lists: don't provide cancel action. If user is APPROVED and event not ended,
    // show a blue "Đã đăng ký" link to detail. If approved but ended, show neutral label.
    const regStatus = localStatus || statusStr;
    if (regStatus === "APPROVED") {
      if (timeState !== "ended") {
        return (
          <Link to={`/events/${id}`} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            Đã đăng ký
          </Link>
        );
      }
      return (
        <Link to={`/events/${id}`} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-600">
          Đã đăng ký
        </Link>
      );
    }

    if ((localStatus || statusStr) === "PENDING") {
      return (
        <Link to={`/events/${id}`} className="px-4 py-2 rounded-lg bg-yellow-400 text-black hover:bg-yellow-500">
          Đang chờ xác nhận
        </Link>
      );
    }

    // If event is not APPROVED or already started/ended -> disable register
    const canRegister = eventStatus === "APPROVED" && timeState === "upcoming";
    if (!canRegister) {
      return (
        <button className="w-full px-4 py-2 rounded-lg bg-gray-200 text-gray-500 cursor-not-allowed text-center" title={eventStatus !== "APPROVED" ? "Sự kiện chưa mở đăng ký" : timeState === "ongoing" ? "Sự kiện đang diễn ra" : "Sự kiện đã kết thúc"}>
          Đăng ký
        </button>
      );
    }

    return (
      <Link
        to={`/events/${id}`}
        className="w-full px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-center"
      >
        Đăng ký
      </Link>
    );
  };

    // keep handler available but card won't render cancel UI; cancellation happens in EventDetail
    async function handleCancelRegistration(e) {
      e.stopPropagation();
      const targetRegId = regId;
      if (!targetRegId) {
        if (window.confirm("Không tìm thấy đăng ký. Muốn mở chi tiết sự kiện?")) {
          window.location.href = `/events/${id}`;
        }
        return;
      }

      if (!window.confirm("Bạn có chắc muốn hủy đăng ký?")) return;

      try {
        await axios.put(`/registrations/cancel/${targetRegId}`);
        setLocalStatus("CANCELED");
        setApprovedCount((c) => Math.max(0, c - 1));
      } catch (err) {
        console.error("Hủy đăng ký thất bại", err);
        alert("Hủy đăng ký thất bại. Vui lòng thử lại.");
      }
    }

  const imgSrc = getFileUrl(imageFile);

  const handleHeart = async (e) => {
    e.stopPropagation();
    try {
      await onToggleFavorite(id);
    } catch (err) {
      console.error("Toggle favorite failed", err);
    }
  };

  return (
    <div className="border rounded-2xl overflow-hidden bg-white shadow-sm">
      <div className="relative">
        <img src={imgSrc} alt={title} className="w-full h-52 object-cover" />

        <span
          className={`absolute top-3 left-3 text-white text-sm px-3 py-1 rounded-full
            ${eventStatus === "APPROVED" ? "bg-emerald-600"
              : eventStatus === "PENDING" ? "bg-orange-500"
                : eventStatus === "REJECTED" ? "bg-gray-500"
                  : eventStatus === "COMPLETED" ? "bg-gray-600"
                    : eventStatus === "CANCELED" ? "bg-red-600"
                      : "bg-emerald-600"}`}
        >
          {eventStatus === "APPROVED" ? "Đã phê duyệt"
            : eventStatus === "PENDING" ? "Đang xử lý"
              : eventStatus === "REJECTED" ? "Đã từ chối"
                : eventStatus === "COMPLETED" ? "Đã hoàn thành"
                  : eventStatus === "CANCELED" ? "Đã hủy"
                    : "Sự kiện"}
        </span>

        <span className="absolute top-3 right-3 bg-white/80 text-emerald-700 text-xs px-3 py-1 rounded-full">
          {category?.name || "Khác"}
        </span>

        {(localStatus || statusStr) === "APPROVED" && timeState !== "ended" && (
          <span className="absolute bottom-3 left-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
            Đã đăng ký
          </span>
        )}
        {(localStatus || statusStr) === "PENDING" && (
          <span className="absolute bottom-3 left-3 bg-yellow-400 text-yellow-900 text-xs px-3 py-1 rounded-full">
            Đang chờ xác nhận
          </span>
        )}

        {/* realtime time state badge */}
        {timeState === "upcoming" && (
          <span className="absolute top-12 left-3 bg-sky-600 text-white text-xs px-3 py-1 rounded-full">Chưa diễn ra</span>
        )}
        {timeState === "ongoing" && (
          <span className="absolute top-12 left-3 bg-amber-600 text-white text-xs px-3 py-1 rounded-full">Đang diễn ra</span>
        )}
        {timeState === "ended" && (
          <span className="absolute top-12 left-3 bg-gray-600 text-white text-xs px-3 py-1 rounded-full">Đã kết thúc</span>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
        <p className="text-gray-600 text-sm mt-1">
          Người tạo: <b>{createdByFullName || "Tình nguyện viên"}</b>
        </p>

        <div className="flex items-center text-gray-500 text-sm mt-3 gap-2">
          <span>{date} · {time}</span>
        </div>
        <div className="flex items-center text-gray-500 text-sm mt-1 gap-2">
          <span>{location}</span>
        </div>

        {/* Chỉ đếm APPROVED */}
        <div className="mt-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Đã duyệt</span>
            <span>{approvedCount}/{capacity}</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
            <div className="h-2 bg-emerald-600 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {renderButton()}
          <Link to={`/events/${id}`} className="w-16 h-10 flex items-center justify-center border rounded-md hover:bg-gray-100">
            <i className="fa-regular fa-eye text-gray-600"></i>
          </Link>
          <button
            onClick={handleHeart}
            className="w-16 h-10 flex items-center justify-center border rounded-md hover:bg-gray-100"
          >
            {isFavorited ? <FaHeart className="text-red-500" /> : <FaRegHeart className="text-gray-600" />}
          </button>
        </div>
      </div>
    </div>
  );
};

EventCard.propTypes = {
  event: PropTypes.object.isRequired,
  status: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  isFavorited: PropTypes.bool,
  onToggleFavorite: PropTypes.func,
};

export default EventCard;
