import { FiCalendar, FiUsers, FiMapPin, FiAward } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div
        className="relative h-[280px] bg-cover bg-center flex items-center justify-center text-center"
        style={{ backgroundImage: `url('/images/about-banner.jpg')` }}
      >
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]"></div>

        <div className="relative z-10 px-4">
          <h1 className="text-5xl font-bold text-emerald-900">Về Chúng Tôi</h1>
          <p className="text-emerald-900 mt-4 text-lg max-w-3xl mx-auto leading-relaxed font-medium">
            Chúng tôi là tổ chức phi lợi nhuận, kết nối những trái tim nhiệt huyết để mang lại
            sự thay đổi tích cực cho cộng đồng.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 mt-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="flex flex-col items-center text-center bg-white p-8 rounded-3xl shadow-md">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-3">
              <FiCalendar size={32} className="text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-green-600">8+</h3>
            <p className="text-gray-600 mt-1">Năm hoạt động</p>
          </div>

          <div className="flex flex-col items-center text-center bg-white p-8 rounded-3xl shadow-md">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-3">
              <FiUsers size={32} className="text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold text-blue-600">12,458</h3>
            <p className="text-gray-600 mt-1">Tình nguyện viên</p>
          </div>

          <div className="flex flex-col items-center text-center bg-white p-8 rounded-3xl shadow-md">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-3">
              <FiMapPin size={32} className="text-purple-600" />
            </div>
            <h3 className="text-3xl font-bold text-purple-600">63</h3>
            <p className="text-gray-600 mt-1">Tỉnh thành</p>
          </div>

          <div className="flex flex-col items-center text-center bg-white p-8 rounded-3xl shadow-md">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-3">
              <FiAward size={32} className="text-orange-600" />
            </div>
            <h3 className="text-3xl font-bold text-orange-600">1,245</h3>
            <p className="text-gray-600 mt-1">Dự án hoàn thành</p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="max-w-6xl mx-auto px-6 mt-20 mb-20 text-center">
        <h2 className="text-4xl font-bold text-emerald-800">Sứ Mệnh Của Chúng Tôi</h2>

        <p className="mt-6 text-gray-700 text-lg leading-relaxed max-w-4xl mx-auto">
          Chúng tôi mong muốn tạo ra một cộng đồng bền vững và sẻ chia,
          nơi những người trẻ có thể cùng nhau lan tỏa yêu thương,
          mang lại hy vọng và cơ hội cho những hoàn cảnh khó khăn trên khắp cả nước.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-7xl mx-auto px-6 mt-10 mb-20">
        <div className="flex justify-center">
          <div className="flex bg-white shadow-md rounded-full overflow-hidden">
            <button className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-full">
              Sứ mệnh & Tầm nhìn
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-10 mt-10">
          <div className="bg-white p-8 rounded-3xl shadow-lg">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-emerald-600 text-3xl">🛡️</span>
            </div>

            <h3 className="text-2xl font-bold text-emerald-800 mb-3">Sứ mệnh</h3>

            <p className="text-gray-700 leading-relaxed">
              Kết nối và trao quyền cho những người trẻ nhiệt huyết, tạo ra một cộng đồng
              tình nguyện mạnh mẽ để giải quyết các vấn đề xã hội và môi trường.
            </p>

            <p className="text-gray-700 leading-relaxed mt-4">
              Chúng tôi tin rằng mỗi người đều có thể tạo ra sự khác biệt...
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-lg">
            <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-teal-600 text-3xl">👁️</span>
            </div>

            <h3 className="text-2xl font-bold text-emerald-800 mb-3">Tầm nhìn</h3>

            <p className="text-gray-700 leading-relaxed">
              Trở thành tổ chức tình nguyện hàng đầu Việt Nam...
            </p>

            <p className="text-gray-700 leading-relaxed mt-4">
              Đến năm 2030, chúng tôi hướng tới mục tiêu...
            </p>
          </div>
        </div>
      </div>

      {/* Partners */}
      <section className="bg-green-50 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-emerald-700 mb-4">Đối tác của chúng tôi</h2>
          <p className="text-gray-600 mb-12">Cùng hợp tác với các tổ chức uy tín để tạo ra tác động lớn hơn</p>

          <div className="flex justify-center items-center gap-20 flex-wrap">
            <img src="src/assets/Logo_of_UNICEF.svg" className="h-10" />
            <img src="src/assets/American Red Cross_idC5TEOZ59_0.svg" className="h-10" />
            <img src="src/assets/WWF_logo_svg.png" className="h-10" />
            <img src="src/assets/OX_HL_C_RGB.png" className="h-10" />
            <img src="src/assets/habitat-for-humanity-seeklogo.png" className="h-10" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-600 py-20 text-center text-white px-6">
        <h2 className="text-4xl font-bold">Hãy cùng chúng tôi tạo nên sự khác biệt!</h2>

        <p className="mt-4 text-lg max-w-2xl mx-auto leading-relaxed">
          Tham gia cộng đồng tình nguyện của chúng tôi...
        </p>

        <div className="flex justify-center gap-6 mt-10">

          {/* Điều hướng sự kiện */}
          <button
            onClick={() => navigate("/events")}
            className="px-8 py-3 bg-white text-emerald-700 font-semibold rounded-full shadow-md hover:bg-gray-100 transition"
          >
            📅 Tham gia sự kiện
          </button>

          {/* Điều hướng cộng đồng */}
          <button
            onClick={() => navigate("/community")}
            className="px-8 py-3 border-2 border-white font-semibold rounded-full hover:bg-white hover:text-emerald-700 transition"
          >
            🌍 Khám phá cộng đồng
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
