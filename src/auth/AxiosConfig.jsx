import secureLocalStorage from "react-secure-storage";
import axios from "axios";

// Membuat instance Axios baru dengan konfigurasi terpusat
const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`, // <-- Menggabungkan URL dasar dengan /api
  timeout: import.meta.env.VITE_API_TIMEOUT || 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Menambahkan token ke setiap request yang keluar
axiosInstance.interceptors.request.use((request) => {
  const token = secureLocalStorage.getItem("acessToken");
  if (token) {
    request.headers["Authorization"] = `Bearer ${token}`;
  }
  return request;
});

// Logika untuk refresh token (sudah benar, tidak perlu diubah)
const refreshAuthLogic = async (failedRequest) => {
  try {
    const refreshToken = secureLocalStorage.getItem("refreshToken");
    
    // Gunakan instance axios dasar untuk refresh token untuk menghindari loop interceptor
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/refresh`, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    const { acessToken, refreshToken: newRefreshToken, result } = response.data;
    secureLocalStorage.setItem("acessToken", acessToken);
    secureLocalStorage.setItem("refreshToken", newRefreshToken);
    secureLocalStorage.setItem("user", result);
    
    failedRequest.config.headers["Authorization"] = `Bearer ${acessToken}`;
    return Promise.resolve();
  } catch (error) {
    secureLocalStorage.clear();
    window.location.href = "/";
    return Promise.reject(error);
  }
};

// Interceptor untuk menangani response error (misal: token expired)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await refreshAuthLogic(originalRequest);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export { axiosInstance };