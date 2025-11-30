// Storage constants for localStorage keys
export const storageConstants = {
  ACCESS_TOKEN: "accessToken",
  USER_DATA: "userData",
  USER_ID: "userId",
  REFRESH_TOKEN: "refreshToken",
  THEME: "theme",
  LANGUAGE: "language",
  SIDEBAR_STATE: "sidebarState",
  USER_PREFERENCES: "userPreferences",
};

// Default values for storage
export const defaultStorageValues = {
  THEME: "light",
  LANGUAGE: "en",
  SIDEBAR_STATE: "open",
};

// Storage utility functions
export const storageUtils = {
  // Set item in localStorage
  setItem: (key, value) => {
    try {
      localStorage.setItem(
        key,
        typeof value === "object" ? JSON.stringify(value) : value
      );
    } catch (error) {
      console.error(`Error setting localStorage item ${key}:`, error);
    }
  },

  // Get item from localStorage
  getItem: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;

      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(item);
      } catch {
        return item;
      }
    } catch (error) {
      console.error(`Error getting localStorage item ${key}:`, error);
      return defaultValue;
    }
  },

  // Remove item from localStorage
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage item ${key}:`, error);
    }
  },

  // Clear all localStorage
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  },

  // Check if localStorage is available
  isAvailable: () => {
    try {
      const test = "__localStorage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },
};
