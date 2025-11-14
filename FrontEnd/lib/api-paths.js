export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Auth endpoints
export const AUTH = {
  // paths for owner authentication
  OWNER_LOGIN: "/auth/owner-login",
  OWNER_REGISTER: "/auth/owner-register",
  OWNER_SESSION: "/auth/owner-session",
  OWNER_LOGOUT: "/auth-owner/logout",

  // paths for user authentication
  USER_LOGIN: "/auth/user-login",
  USER_LOGOUT: "/auth/user-logout",
  USER_REGISTER: "/auth/user-register",
  USER_SESSION: "/auth/user-session",
};

// Helper function to build full URL
export const buildUrl = (path) => `${API_BASE}${path}`;
