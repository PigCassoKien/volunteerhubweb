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

  // Demo số người đăng ký (backend bạn sẽ có API riêng sau)
  const registered = Math.floor(Math.random() * (maxParticipants || 50));
  const capacity = maxParticipants || 50;
  const progress = (registered / capacity) * 100;

  // Xử lý ngày giờ hiển thị
  const start = new Date(startDate);
  const end = new Date(endDate);
  const date = start.toLocaleDateString("vi-VN");
  const time = `${start.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })} - ${end.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  // Hàm xử lý click để ngăn chặn lan tỏa nếu click vào nút
  const handleButtonClick = (e) => {
    e.stopPropagation();
    // (đăng ký hoặc yêu thích)
  };

  return (
    <Link to={`/events/${id}`}>
      <div
        className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden cursor-pointer"
        onClick={() => { } /* Không cần onClick vì Link đã xử lý */}
      >
        {/* Ảnh + trạng thái */}
        <div className="relative">
          <img
            src={imageFile || "/images/default-event.jpg"}
            alt={title}
            className="w-full h-52 object-cover"
          />
          <span
            className={`absolute top-3 left-3 text-white text-sm px-3 py-1 rounded-full ${status === "ALMOST_FULL"
              ? "bg-orange-500"
              : status === "FULL"
                ? "bg-gray-500"
                : "bg-emerald-600"
              }`}
          >
            {status || "Đang mở"}
          </span>
          <span className="absolute top-3 right-3 bg-white/80 text-emerald-700 text-xs px-3 py-1 rounded-full">
            {category?.name || "Khác"}
          </span>
        </div>

        {/* Nội dung */}
        <div className="p-5">
          <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
          <p className="text-gray-600 text-sm mt-1">
            Người tạo ID: {createdById || "Ẩn danh"}
          </p>

          <div className="flex items-center text-gray-500 text-sm mt-3 gap-2">
            <FiCalendar className="text-emerald-600" />
            <span>
              {date} · {time}
            </span>
          </div>

          <div className="flex items-center text-gray-500 text-sm mt-1 gap-2">
            <FiMapPin className="text-emerald-600" />
            <span>{location}</span>
          </div>

          {/* Thanh tiến độ */}
          <div className="mt-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Đã đăng ký</span>
              <span>
                {registered}/{capacity}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
              <div
                className="h-2 bg-emerald-600 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="mt-4 flex gap-2" onClick={handleButtonClick}>
            <button
              className="flex-1 bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700 text-sm"
              onClick={handleButtonClick} // Ngăn chặn navigate khi click nút
            >
              Đăng ký
            </button>
            <button
              className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-100"
              onClick={handleButtonClick} // Ngăn chặn navigate khi click nút
            >
              <i className="fa-regular fa-eye text-gray-600"></i>
            </button>
            <button
              className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-100"
              onClick={handleButtonClick} // Ngăn chặn navigate khi click nút
            >
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