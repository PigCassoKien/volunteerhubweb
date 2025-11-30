import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#0d1b2a] text-gray-300 py-10">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
        {/*Cột 1: Logo & Mô tả */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <span className="text-white text-2xl font-bold">❤</span>
            </div>
            <div>
              <h2 className="text-white text-xl font-semibold">Volunteer Hub</h2>
              <p className="text-sm text-gray-400">Kết nối yêu thương</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed">
            Nền tảng kết nối tình nguyện viên với các hoạt động ý nghĩa, xây dựng cộng đồng
            và tạo ra những tác động tích cực cho xã hội. Cùng nhau chúng ta tạo nên những kỳ tích tuyệt vời.
          </p>

          <div className="flex gap-4 mt-4">
            <a href="#" className="hover:text-emerald-400">
              <FaFacebookF size={20} />
            </a>
            <a href="#" className="hover:text-emerald-400">
              <FaTwitter size={20} />
            </a>
            <a href="#" className="hover:text-emerald-400">
              <FaInstagram size={20} />
            </a>
            <a href="#" className="hover:text-emerald-400">
              <FaYoutube size={20} />
            </a>
          </div>
        </div>

        {/* --- Cột 2: Liên kết nhanh --- */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Liên kết nhanh</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-emerald-400">Về chúng tôi</a></li>
            <li><a href="#" className="hover:text-emerald-400">Sự kiện</a></li>
            <li><a href="#" className="hover:text-emerald-400">Cộng đồng</a></li>
            <li><a href="#" className="hover:text-emerald-400">Liên hệ</a></li>
          </ul>
        </div>

        {/* --- Cột 3: Hỗ trợ --- */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Hỗ trợ</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-emerald-400">Trung tâm trợ giúp</a></li>
            <li><a href="#" className="hover:text-emerald-400">Điều khoản sử dụng</a></li>
            <li><a href="#" className="hover:text-emerald-400">Chính sách bảo mật</a></li>
            <li><a href="#" className="hover:text-emerald-400">Câu hỏi thường gặp</a></li>
          </ul>
        </div>
      </div>

      <hr className="border-gray-700 my-8" />

      {/* --- Dòng bản quyền --- */}
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between text-sm text-gray-500">
        <p>
          © 2025 Volunteer Hub. Tất cả quyền được bảo lưu. Được tạo với <span className="text-rose-500">❤</span> tại Việt Nam.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
