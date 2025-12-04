import { FiHome, FiUsers, FiMapPin, FiHeart, FiClock, FiSearch } from "react-icons/fi";

const CommunityPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div
        className="relative h-[280px] bg-cover bg-center flex items-center justify-center text-center"
        style={{ backgroundImage: `url('/images/community-banner.jpg')` }}
      >
        <div className="absolute inset-0 bg-emerald-800/50"></div>

        <div className="absolute top-5 left-0 w-full z-20">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="text-white/90 text-sm">
              <ol className="flex items-center space-x-2">
                <li>
                  <a href="/" className="hover:text-white">Trang chủ</a>
                </li>
                <li>/</li>
                <li className="font-semibold text-white">Cộng đồng</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Title */}
        <div className="relative z-10 text-white">
          <h1 className="text-5xl font-bold">Cộng đồng tình nguyện viên</h1>
          <p className="mt-3 text-lg">
            Kết nối với hàng nghìn tình nguyện viên nhiệt huyết trên khắp cả nước
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="relative -mt-12 max-w-7xl mx-auto z-20">
        <div className="bg-white rounded-2xl shadow-lg p-8 grid grid-cols-2 md:grid-cols-4 gap-6">

          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-3">
              <FiUsers className="text-green-600" size={24} />
            </div>
            <p className="text-2xl font-bold">12,458</p>
            <p className="text-gray-600">Tình nguyện viên</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-3">
              <FiMapPin className="text-blue-600" size={24} />
            </div>
            <p className="text-2xl font-bold">63</p>
            <p className="text-gray-600">Tỉnh thành</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-purple-100 flex items-center justify-center mb-3">
              <FiHeart className="text-purple-600" size={24} />
            </div>
            <p className="text-2xl font-bold">1,245</p>
            <p className="text-gray-600">Dự án hoàn thành</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-orange-100 flex items-center justify-center mb-3">
              <FiClock className="text-orange-600" size={24} />
            </div>
            <p className="text-2xl font-bold">98,456</p>
            <p className="text-gray-600">Giờ tình nguyện</p>
          </div>

        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex border rounded-xl bg-white overflow-hidden shadow-sm">

          <button className="flex-1 py-3 bg-green-600 text-white font-medium">
            Tình nguyện viên
          </button>

          <button className="flex-1 py-3 text-gray-600 hover:bg-gray-100">
            Câu chuyện
          </button>

          <button className="flex-1 py-3 text-gray-600 hover:bg-gray-100">
            Bảng xếp hạng
          </button>

        </div>
      </div>

      {/* Search box */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="relative bg-white shadow-sm rounded-xl p-4 flex items-center border">
          <FiSearch className="text-gray-400 mr-3" size={20} />
          <input
            type="text"
            className="w-full outline-none text-gray-700"
            placeholder="Tìm kiếm tình nguyện viên theo tên, địa điểm hoặc kỹ năng..."
          />
        </div>
      </div>

      {/* Volunteer List */}
      <div className="max-w-7xl mx-auto px-6 mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          {/* Avatar */}
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <img
                src="/images/avatar1.jpg"
                alt="avatar"
                className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-md"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
            </div>

            <h3 className="text-xl font-semibold mt-4">Nguyễn Thị Mai</h3>
            <p className="text-green-600 font-medium">Tình nguyện viên tích cực</p>

            <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
              <FiMapPin /> Hà Nội
            </p>
          </div>

          {/* Stats */}
          <div className="bg-green-50 rounded-xl p-4 flex justify-between mt-5">
            <div className="text-center">
              <p className="text-xl font-bold">24</p>
              <p className="text-gray-600 text-sm">Sự kiện</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">156</p>
              <p className="text-gray-600 text-sm">Giờ</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-700 text-sm mt-4">
            Đam mê hoạt động tình nguyện, đặc biệt là các dự án giáo dục cho trẻ em vùng cao.
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">Giáo dục</span>
            <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs">Môi trường</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs">Y tế</span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between mt-6">
            <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition flex justify-center gap-2">
              <FiUsers /> Kết nối
            </button>

            <button className="ml-3 w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100">
              💬
            </button>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <img
                src="/images/avatar2.jpg"
                alt="avatar"
                className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-md"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
            </div>

            <h3 className="text-xl font-semibold mt-4">Trần Văn Hùng</h3>
            <p className="text-green-600 font-medium">Quản lý dự án</p>

            <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
              <FiMapPin /> TP. Hồ Chí Minh
            </p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 flex justify-between mt-5">
            <div className="text-center">
              <p className="text-xl font-bold">32</p>
              <p className="text-gray-600 text-sm">Sự kiện</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">248</p>
              <p className="text-gray-600 text-sm">Giờ</p>
            </div>
          </div>

          <p className="text-gray-700 text-sm mt-4">
            Có kinh nghiệm tổ chức và quản lý các dự án tình nguyện quy mô lớn.
          </p>

          <div className="flex flex-wrap gap-2 mt-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">Quản lý</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs">Tổ chức</span>
            <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs">Lãnh đạo</span>
          </div>

          <div className="flex items-center justify-between mt-6">
            <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition flex justify-center gap-2">
              <FiUsers /> Kết nối
            </button>
            <button className="ml-3 w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100">
              💬
            </button>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <img
                src="/images/avatar3.jpg"
                alt="avatar"
                className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-md"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
            </div>

            <h3 className="text-xl font-semibold mt-4">Lê Thị Hoa</h3>
            <p className="text-green-600 font-medium">Sinh viên tình nguyện</p>

            <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
              <FiMapPin /> Đà Nẵng
            </p>
          </div>

          <div className="bg-purple-50 rounded-xl p-4 flex justify-between mt-5">
            <div className="text-center">
              <p className="text-xl font-bold">15</p>
              <p className="text-gray-600 text-sm">Sự kiện</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">98</p>
              <p className="text-gray-600 text-sm">Giờ</p>
            </div>
          </div>

          <p className="text-gray-700 text-sm mt-4">
            Sinh viên năm 3, yêu thích các hoạt động cộng đồng và phát triển bản thân.
          </p>

          <div className="flex flex-wrap gap-2 mt-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">Truyền thông</span>
            <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs">Thiết kế</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs">Sáng tạo</span>
          </div>

          <div className="flex items-center justify-between mt-6">
            <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition flex justify-center gap-2">
              <FiUsers /> Kết nối
            </button>

            <button className="ml-3 w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100">
              💬
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default CommunityPage;
