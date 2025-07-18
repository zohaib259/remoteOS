import axios from "axios";

// Axios instance
const authApi = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true, // Important for cookies
});

// Flag to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Access token failed with 401, try refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue other requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              resolve(authApi(originalRequest)); // retry
            },
            reject: (err: any) => {
              reject(err);
            },
          });
        });
      }

      isRefreshing = true;

      try {
        // 👉 Call refresh endpoint
        await axios.get("http://localhost:3000/api/auth/refresh-token", {
          withCredentials: true, // send refresh token cookie
        });

        processQueue(null);
        return authApi(originalRequest); // Retry original request
      } catch (err) {
        processQueue(err, null);

        // Refresh token failed — logout user
        localStorage.clear();
        // window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default authApi;
