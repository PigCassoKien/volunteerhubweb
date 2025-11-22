import Banner from "../components/Banner";
import { FaUserFriends, FaCalendarCheck, FaCheckCircle, FaClock } from "react-icons/fa";

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

      {/*Sự kiện nổi bật */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-green-700 mb-8">Sự kiện nổi bật</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow hover:shadow-lg transition p-4">
                <img
                  src={`https://source.unsplash.com/600x400/?volunteer,community,${i}`}
                  alt="Sự kiện"
                  className="rounded-lg mb-4 h-48 w-full object-cover"
                />
                <h3 className="font-semibold text-lg text-gray-800 mb-2">
                  Sự kiện tình nguyện #{i}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Hỗ trợ dọn dẹp công viên, trồng cây xanh và lan tỏa thông điệp xanh.
                </p>
                <button className="bg-green-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-green-700 transition">
                  Xem chi tiết
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
