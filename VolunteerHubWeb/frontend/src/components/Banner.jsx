import heroImg from "../assets/Banner.jpg";
import { useState } from "react";

function Banner({ onStart }) {
  const [showVideo, setShowVideo] = useState(false);

  const openVideo = () => setShowVideo(true);
  const closeVideo = () => setShowVideo(false);

  return (
    <section
      className="relative bg-cover bg-center bg-no-repeat h-[90vh] flex items-center justify-center"
      style={{ backgroundImage: `url(${heroImg})` }}
    >
      <div className="absolute inset-0 bg-green-900 bg-opacity-70"></div>

      {/* Nội dung chính */}
      <div className="relative text-center text-white px-6 max-w-3xl">
        {/* Tagline */}
        <div className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
          <i className="fa-solid fa-heart text-green-300"></i>
          <span>Cộng đồng tình nguyện #1 Việt Nam</span>
        </div>

        {/* Tiêu đề */}
        <h1 className="text-5xl md:text-7xl font-bold mb-2">Kết nối</h1>
        <h2 className="text-5xl md:text-7xl font-semibold text-green-300 mb-6">
          Trái tim yêu thương
        </h2>

        {/* Mô tả */}
        <p className="text-lg text-gray-100 mb-8 leading-relaxed">
          Tham gia cộng đồng tình nguyện viên lớn nhất Việt Nam. <br />
          Cùng nhau tạo ra những kỳ tích cho xã hội và thế giới.
        </p>

        {/* Nút hành động */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          <button
            onClick={() => onStart?.()}
            className="bg-green-600 px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition shadow-md flex items-center gap-2"
          >
            <i className="fa-solid fa-play"></i>
            Bắt đầu hành trình
          </button>
          <button onClick={openVideo} className="bg-white/20 border border-white px-6 py-3 rounded-lg font-medium hover:bg-white/30 transition flex items-center gap-2">
            <i className="fa-solid fa-circle-play"></i>
            Xem video giới thiệu
          </button>
        </div>

        {/* Dòng icon thông tin */}
        <div className="flex justify-center gap-10 text-sm text-gray-200">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-circle-check text-green-300 -mb-1"></i>
            Đáng tin cậy
          </div>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-award text-yellow-300 -mb-1"></i>
            Được công nhận
          </div>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-globe text-blue-300 -mb-1"></i>
            Toàn quốc
          </div>
        </div>
      </div>
      {showVideo && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
          onClick={closeVideo}
        >
          <div
            className="relative bg-black rounded-xl w-[90%] max-w-3xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút đóng */}
            <button
              onClick={closeVideo}
              className="absolute -top-10 right-0 text-white text-3xl hover:text-gray-300"
            >
              ✕
            </button>

            {/* Video YouTube */}
            <iframe
              className="w-full h-full rounded-xl"
              src="https://www.youtube.com/embed/21jZVCTAvfw?autoplay=1&start=2"
              title="Video giới thiệu"
              frameBorder="0"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
}

export default Banner;
