"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { storageConstants } from "../constants/storageConstants";

export default function RedirectIfNotLoggedIn({ children }) {
  const router = useRouter();
  const currentRoute = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      // Don't redirect if we're already on auth pages
      const authRoutes = [
        "/login",
        "/auth/login",
        "/register",
        "/auth/register",
      ];
      if (authRoutes.includes(currentRoute)) {
        return;
      }

      const authToken = localStorage.getItem(storageConstants.ACCESS_TOKEN);
      const userData = localStorage.getItem(storageConstants.USER_DATA);

      if (!authToken || !userData) {
        router.push("/auth/login");
        return;
      }

      try {
        const user = JSON.parse(userData);
        if (!user || !user.id) {
          router.push("/auth/login");
          return;
        }
        // Check token expiry on navigation
        if (isTokenExpired(authToken)) {
          clearUserData();
          router.push("/auth/login");
          return;
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        router.push("/auth/login");
        return;
      }
    };

    checkAuth();
  }, [router, currentRoute]);

  return <>{children}</>;
}

// Helper function to store user data after login
export const storeUserData = (userData, token) => {
  try {
    localStorage.setItem(storageConstants.USER_DATA, JSON.stringify(userData));
    localStorage.setItem(storageConstants.ACCESS_TOKEN, token);
    localStorage.setItem(storageConstants.USER_ID, userData.id);
    // Optionally store computed expiry to avoid frequent decode
    const expSeconds = getTokenExpirySeconds(token);
    if (expSeconds) {
      localStorage.setItem("tokenExpiry", String(expSeconds));
    }
  } catch (error) {
    console.error("Error storing user data:", error);
  }
};

// Helper function to clear user data on logout
export const clearUserData = () => {
  try {
    localStorage.removeItem(storageConstants.USER_DATA);
    localStorage.removeItem(storageConstants.ACCESS_TOKEN);
    localStorage.removeItem(storageConstants.USER_ID);
  } catch (error) {
    console.error("Error clearing user data:", error);
  }
};

// Decode a JWT's payload (base64url) safely
export const decodeJwt = (token) => {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof window !== "undefined" && typeof atob === "function"
        ? atob(base64)
        : Buffer.from(base64, "base64").toString("binary");
    try {
      return JSON.parse(json);
    } catch {
      // Fallback for UTF-8 characters
      const decoded = decodeURIComponent(
        Array.prototype.map
          .call(
            json,
            (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
          )
          .join("")
      );
      return JSON.parse(decoded);
    }
  } catch (e) {
    return null;
  }
};

const MAX_TOKEN_LIFETIME_SECONDS = 72 * 60 * 60; // 72 hours

export const getTokenExpirySeconds = (token) => {
  const payload = decodeJwt(token) || {};
  if (typeof payload.exp === "number") return payload.exp;
  if (typeof payload.iat === "number")
    return payload.iat + MAX_TOKEN_LIFETIME_SECONDS;
  return null;
};

export const isTokenExpired = (token) => {
  try {
    const exp = getTokenExpirySeconds(token);
    if (!exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return now >= exp;
  } catch {
    return false;
  }
};

// Helper function to get user data
export const getUserData = () => {
  try {
    const userData = localStorage.getItem(storageConstants.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

// Helper function to get auth token
export const getAuthToken = () => {
  return localStorage.getItem(storageConstants.ACCESS_TOKEN);
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  const token = getAuthToken();
  const userData = getUserData();
  if (!(token && userData)) return false;
  return !isTokenExpired(token);
};

// Helper function to check if current route is an auth route
export const isAuthRoute = (pathname) => {
  const authRoutes = ["/login", "/auth/login", "/register", "/auth/register"];
  return authRoutes.includes(pathname);
};

// Logout helper that clears storage and redirects to login
export const logoutAndRedirect = () => {
  try {
    clearUserData();
  } catch {}
  if (typeof window !== "undefined") {
    window.location.href = "/auth/login";
  }
};

// Schedule automatic logout when token expiry is reached
export const scheduleAutoLogout = () => {
  try {
    const token = getAuthToken();
    if (!token) return null;
    const exp = getTokenExpirySeconds(token);
    if (!exp) return null;
    const msUntilExpiry = exp * 1000 - Date.now();
    if (msUntilExpiry <= 0) {
      logoutAndRedirect();
      return null;
    }
    const timeoutId = setTimeout(() => {
      logoutAndRedirect();
    }, msUntilExpiry);
    return timeoutId;
  } catch {
    return null;
  }
};
