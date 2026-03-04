import axios from "axios";
import toast from "react-hot-toast";

const axiosInstance = axios.create({
  baseURL: process.env.BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login on 401 Unauthorized (not 400 bad request like wrong password)
    if (error.response && error.response.status === 401) {
      localStorage.clear();
      toast.error("Session expired. Please log in again.");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
