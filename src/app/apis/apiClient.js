import axios from "axios";
import axiosRetry from "axios-retry";
import { logger } from "../utils/logger";
import { apiBaseUrl } from "./index";
import { storageConstants } from "../constants/storageConstants";
import { isTokenExpired, clearUserData } from "../utils/CheckLoggedin";

// Create an axios instance with retries
const apiInstance = () => {
  const api = axios.create({
    baseURL: apiBaseUrl,
  });

  // Retry configuration: retry failed requests up to 3 times
  axiosRetry(api, { retries: 3 });

  // Request interceptor to modify outgoing requests
  api.interceptors.request.use(
    async (config) => {
      config.baseURL = apiBaseUrl;

      const authToken = localStorage.getItem(storageConstants.ACCESS_TOKEN); // Get token as string
      if (authToken) {
        // If token expired, proactively logout and block request
        if (isTokenExpired(authToken)) {
          clearUserData();
          if (typeof window !== "undefined") {
            window.location.href = "/auth/login";
          }
          return Promise.reject(new axios.Cancel("Token expired"));
        }
        config.headers.Authorization = `Bearer ${authToken}`;
      }
      logger.log("REQUEST", config);
      return config;
    },
    (error) => {
      // It's good practice to also log request errors
      logger.error("REQUEST ERROR", error);
      return Promise.reject(error);
    }
  );

  // Response interceptor to log responses and handle errors
  api.interceptors.response.use(
    (response) => {
      logger.log("RESPONSE", response); // Log successful response
      return response;
    },
    (error) => {
      logger.log("ERROR", error, error.response); // Log error response
      try {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          clearUserData();
          if (typeof window !== "undefined") {
            window.location.href = "/auth/login";
          }
        }
      } catch {}
      return Promise.reject(error);
    }
  );

  return api;
};

// Create and export the API client instance
const apiClient = apiInstance();

export default apiClient;
