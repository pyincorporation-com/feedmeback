import axios from "axios";
import { store } from "../store/store"; // Import your store

var API_URL: string;

if (typeof window !== "undefined") {
  API_URL = `${window.location.protocol}//api.feedmeback.cloud/`;
} else {
  API_URL = `http://api.feedmeback.cloud/`;
}

// Helper to get token from Redux state
const getTokenFromState = () => {
  // This will be called after store is initialized
  return store?.getState()?.auth?.token || null;
};

const getBaseHeaders = () => ({
  "X-Requested-With": "XMLHttpRequest",
  Accept: "application/json",
  "Content-Type": "application/json",
});

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = getTokenFromState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle token refresh on client side for 401 errors
    if (
      typeof window !== "undefined" &&
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${API_URL}token/refresh`,
          {},
          {
            withCredentials: true, // Important: Send cookies
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        // Dispatch action to update token in Redux state
        if (response.data.access && store) {
          store.dispatch({
            type: "auth/refreshToken/fulfilled",
            payload: response.data,
          });

          // Update the Authorization header for the retry
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        // Dispatch logout action
        if (store) {
          store.dispatch({ type: "auth/logout/fulfilled" });
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden - account inactive
    if (error.response?.status === 403) {
      const errorDetail =
        error.response?.data?.detail || error.response?.data?.response;
      if (errorDetail?.includes("inactive")) {
        // Handle inactive account
        console.error("Account is inactive");
      }
    }

    return Promise.reject(error);
  },
);

export default api;
