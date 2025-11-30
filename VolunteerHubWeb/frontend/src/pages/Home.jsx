import Banner from "../components/Banner";
import EventCard from "../components/EventCard";
import { FaUserFriends, FaCalendarCheck, FaCheckCircle, FaClock, FaStar } from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const stats = [
    { icon: <FaUserFriends className="text-3xl text-green-600" />, number: "1,250", label: "Tình nguyện viên" },
    { icon: <FaCalendarCheck className="text-3xl text-blue-600" />, number: "28", label: "Sự kiện đang diễn ra" },
    { icon: <FaCheckCircle className="text-3xl text-green-600" />, number: "156", label: "Sự kiện hoàn thành" },
    { icon: <FaClock className="text-3xl text-orange-500" />, number: "15,680", label: "Giờ tình nguyện" },
  ];

  const steps = [
    {
      title: "Đăng ký tài khoản",
      desc: "Tạo tài khoản tình nguyện viên nhanh chóng bằng email hoặc mạng xã hội.",
      icon: "📝",
    },
    {
      title: "Chọn sự kiện phù hợp",
      desc: "Tìm kiếm, xem chi tiết và đăng ký sự kiện phù hợp với thời gian và sở thích của bạn.",
      icon: "🎯",
    },
    {
      title: "Tham gia & tạo tác động",
      desc: "Tham gia sự kiện, kết nối cộng đồng và nhận chứng nhận sau khi hoàn thành.",
      icon: "💚",
    },
  ];

  const [events, setEvents] = useState([]);
  const [category, setCategory] = useState("Tất cả");
  const [loading, setLoading] = useState(true);

  const categories = ["Tất cả", "Môi trường", "Từ thiện", "Giáo dục", "Y tế", "Cộng đồng"];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("/api/events/all");
        setEvents(res.data);
      } catch (err) {
        console.error("Lỗi tải danh sách sự kiện:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents =
    category === "Tất cả"
      ? events
      : events.filter((e) => e.category?.name === category);

  const testimonials = [
    {
      avatar: "https://source.unsplash.com/100x100/?woman,portrait,1",
      name: "Nguyễn Thị Mai",
      role: "Tình nguyện viên",
      quote: "Tham gia Volunteer Hub đã thay đổi cuộc sống của tôi. Tôi đã gặp được nhiều người bạn tuyệt vời và cùng nhau tạo ra những đóng góp tích cực cho cộng đồng.",
    },
    {
      avatar: "https://source.unsplash.com/100x100/?man,portrait,2",
      name: "Trần Văn Hưng",
      role: "Quản lý sự kiện",
      quote: "Nền tảng này giúp tôi dễ dàng tìm kiếm và quản lý các hoạt động tình nguyện. Giao diện thân thiện và tính năng đa dạng.",
    },
    {
      avatar: "https://source.unsplash.com/100x100/?woman,portrait,3",
      name: "Lê Thị Hoa",
      role: "Sinh viên",
      quote: "Là sinh viên, tôi có thể tham gia các hoạt động tình nguyện phù hợp với lịch học. Đây là cách tuyệt vời để phát triển bản thân.",
    },
  ];

  return (
    <>
      <Banner />
      {/* Các con số */}
      <section className="relative -mt-20 z-20">
        <div className="absolute inset-0 bg-green-50 top-20 z-0"></div>

        <div className="relative z-30 max-w-7xl mx-auto bg-white shadow-lg rounded-2xl p-8 flex flex-wrap justify-around items-center gap-8">
          {stats.map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="mb-3">{item.icon}</div>
              <h3 className="text-3xl font-bold text-gray-800">{item.number}</h3>
              <p className="text-gray-600 text-sm mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/*3 bước đơn giản */}
      <section className="bg-green-50 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block bg-green-100 text-green-700 text-sm font-medium px-4 py-1 rounded-full mb-4">
            <i className="fa-solid fa-location-dot mr-2"></i> Cách thức hoạt động
          </div>

          <h2 className="text-4xl font-bold text-green-700 mb-3">3 bước đơn giản</h2>
          <p className="text-gray-600 mb-12">
            Chỉ với 3 bước đơn giản, bạn có thể bắt đầu hành trình tình nguyện ý nghĩa
          </p>

          <div className="grid md:grid-cols-3 gap-10">
            {/*Bước 1*/}
            <div className="relative bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition">
              <div className="absolute -top-4 right-6 bg-orange-400 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center shadow">
                1
              </div>
              <div className="bg-green-600 text-white w-16 h-16 mx-auto flex items-center justify-center rounded-2xl shadow-md mb-6 text-3xl">
                <i className="fa-solid fa-user-plus"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Đăng ký tài khoản</h3>
              <p className="text-gray-600 text-sm">
                Tạo tài khoản miễn phí và hoàn thiện hồ sơ cá nhân để bắt đầu hành trình tình nguyện ý nghĩa.
              </p>
            </div>

            {/*Bước 2*/}
            <div className="relative bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition">
              <div className="absolute -top-4 right-6 bg-orange-400 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center shadow">
                2
              </div>
              <div className="bg-blue-600 text-white w-16 h-16 mx-auto flex items-center justify-center rounded-2xl shadow-md mb-6 text-3xl">
                <i className="fa-solid fa-magnifying-glass"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Tìm sự kiện phù hợp</h3>
              <p className="text-gray-600 text-sm">
                Khám phá hàng trăm hoạt động tình nguyện đa dạng và chọn sự kiện phù hợp với đam mê của bạn.
              </p>
            </div>

            {/*Bước 3*/}
            <div className="relative bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition">
              <div className="absolute -top-4 right-6 bg-orange-400 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center shadow">
                3
              </div>
              <div className="bg-pink-600 text-white w-16 h-16 mx-auto flex items-center justify-center rounded-2xl shadow-md mb-6 text-3xl">
                <i className="fa-solid fa-heart"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Tạo tác động tích cực</h3>
              <p className="text-gray-600 text-sm">
                Tham gia và cùng cộng đồng tạo ra những thay đổi tích cực, lan tỏa yêu thương đến mọi người.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sự kiện nổi bật*/}
      <section className="bg-gray-50 py-14">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-emerald-700 mb-8">Tìm đam mê của bạn</h2>
          <p className="text-center text-gray-600 mb-8">Khám phá các hoạt động tình nguyện đang diễn ra phù hợp với sở thích và khả năng của bạn.</p>

          {/* Các nút lọc category */}
          <div className="flex justify-center gap-4 mb-12 flex-wrap">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-1.5 rounded-full text-sm border transition ${category === c
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-gray-100 text-gray-700 hover:bg-emerald-100 border-gray-300"
                  }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Danh sách 3 sự kiện */}
          {loading ? (
            <p className="text-center text-gray-600">Đang tải sự kiện...</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {filteredEvents.slice(0, 3).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}

          {/* Button xem tất cả sự kiện */}
          <div className="text-center mt-8">
            <a href="/events" className="bg-emerald-600 text-white py-3 px-8 rounded-full text-sm hover:bg-emerald-700 transition inline-block">
              Xem tất cả sự kiện
            </a>
          </div>
        </div>
      </section>

      {/* Câu chuyện từ cộng đồng */}
      <section className="bg-green-50 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-emerald-700 mb-4">Câu chuyện từ cộng đồng</h2>
          <p className="text-gray-600 mb-12">Nghe những chia sẻ chân thực từ các tình nguyện viên trong cộng đồng của chúng ta</p>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <img src={testimonial.avatar} alt={testimonial.name} className="w-16 h-16 rounded-full mx-auto mb-4" />
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm mb-4">"{testimonial.quote}"</p>
                <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                <p className="text-gray-500 text-xs">{testimonial.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Đăng ký nhận tin tức */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-emerald-700 mb-4">Đăng ký nhận tin tức</h2>
          <p className="text-gray-600 mb-8">Nhận thông tin về các sự kiện mới nhất và câu chuyện truyền cảm hứng từ cộng đồng tình nguyện viên</p>
          <div className="flex justify-center items-center gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-emerald-500"
            />
            <button className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition">
              Đăng ký
            </button>
          </div>
        </div>
      </section>

      {/* Đối tác của chúng tôi */}
      <section className="bg-green-50 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-emerald-700 mb-4">Đối tác của chúng tôi</h2>
          <p className="text-gray-600 mb-12">Cùng hợp tác với các tổ chức uy tín để tạo ra tác động lớn hơn</p>
          <div className="flex justify-center items-center gap-20 flex-wrap">
            <img src="src\assets\Logo_of_UNICEF.svg" alt="UNICEF" className="h-10" />
            <img src="src\assets\American Red Cross_idC5TEOZ59_0.svg" alt="+" className="h-10" />
            <img src="src\assets\WWF_logo_svg.png" alt="WWF" className="h-10" />
            <img src="src\assets\OX_HL_C_RGB.png" alt="Oxfam" className="h-10" />
            <img src="src\assets\habitat-for-humanity-seeklogo.png" alt="Habitat for Humanity" className="h-10" />
          </div>
        </div>
      </section>
    </>
  );
}