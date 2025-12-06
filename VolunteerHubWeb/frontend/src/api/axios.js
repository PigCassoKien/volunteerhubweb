import axios from "axios";

// Tạo instance với baseURL API backend (điều chỉnh nếu cần)
const instance = axios.create({
  baseURL: "/api",
});

// Interceptor phải luôn return config và gắn Authorization khi có token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;