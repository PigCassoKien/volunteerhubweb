import PropTypes from "prop-types";
import { FiMapPin, FiCalendar } from "react-icons/fi";
import { Link } from "react-router-dom";

const EventCard = ({ event }) => {
  const {
    id,
    title,
    location,
    imageFile,
    startDate,
    endDate,
    maxParticipants,
    category,
    status,
    createdById,
  } = event;

  // Người tạo: vì backend chỉ trả id
  const creatorName = `User #${createdById}`;

  // Tiến độ tạm thời (vì DTO không trả registeredCount)
  const current = event.registeredCount ?? 0;
  const capacity = maxParticipants ?? 0;
  const progress = capacity > 0 ? (current / capacity) * 100 : 0;

  // Format ngày giờ
  const start = new Date(startDate);
  const end = new Date(endDate);

  const date = start.toLocaleDateString("vi-VN");
  const time = `${start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - 
                ${end.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;

  return (
    <Link to={`/events/${id}`}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden cursor-pointer">

        {/* Ảnh */}
        <div className="relative">
          <img
            src={imageFile || "/images/default-event.jpg"}
            alt={title}
            className="w-full h-52 object-cover"
          />

          {/* Trạng thái */}
          <span
            className={`absolute top-3 left-3 text-white text-sm px-3 py-1 rounded-full
              ${status === "ALMOST_FULL"
                ? "bg-orange-500"
                : status === "FULL"
                  ? "bg-gray-500"
                  : "bg-emerald-600"}`}
          >
            {status === "OPEN"
              ? "Đang mở"
              : status === "ALMOST_FULL"
                ? "Sắp đầy"
                : status === "FULL"
                  ? "Hết chỗ"
                  : status}
          </span>

          {/* Category */}
          <span className="absolute top-3 right-3 bg-white/80 text-emerald-700 text-xs px-3 py-1 rounded-full">
            {category?.name || "Khác"}
          </span>
        </div>

        {/* Nội dung */}
        <div className="p-5">
          <h3 className="font-semibold text-lg text-gray-800">{title}</h3>

          <p className="text-gray-600 text-sm mt-1">
            Người tạo: <b>{creatorName}</b>
          </p>

          <div className="flex items-center text-gray-500 text-sm mt-3 gap-2">
            <FiCalendar className="text-emerald-600" />
            <span>{date} · {time}</span>
          </div>

          <div className="flex items-center text-gray-500 text-sm mt-1 gap-2">
            <FiMapPin className="text-emerald-600" />
            <span>{location}</span>
          </div>

          {/* Thanh tiến độ */}
          <div className="mt-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Đã đăng ký</span>
              <span>{current}/{capacity}</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
              <div
                className="h-2 bg-emerald-600 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-4 flex gap-2">
            <button className="flex-1 bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700 text-sm">
              Đăng ký
            </button>

            <button className="w-10 h-10 flex items-center justify-center border rounded-md hover:bg-gray-100">
              <i className="fa-regular fa-eye text-gray-600"></i>
            </button>

            <button className="w-10 h-10 flex items-center justify-center border rounded-md hover:bg-gray-100">
              <i className="fa-regular fa-heart text-gray-600"></i>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

EventCard.propTypes = {
  event: PropTypes.object.isRequired,
};

export default EventCard;
