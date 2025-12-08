// src/api/axiosInstance.ts
import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
});

// Automatically inject token into headers
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    // if (status === 401) {
    //   localStorage.clear();
    //   if (!window.location.pathname.includes('/')) {
    //     window.location.href = '/'; // or customize as needed
    //   }
    // }
    return Promise.reject(error?.response || error);
  }
);

export default axiosInstance;
