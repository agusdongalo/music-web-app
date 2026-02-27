import { create } from "zustand";

type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
};

const storageAvailable = typeof window !== "undefined";
const storedToken = storageAvailable
  ? window.localStorage.getItem("access_token")
  : null;
const storedUser = storageAvailable
  ? window.localStorage.getItem("user")
  : null;

let parsedUser: AuthUser | null = null;
if (storedUser) {
  try {
    parsedUser = JSON.parse(storedUser) as AuthUser;
  } catch {
    parsedUser = null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  token: storedToken,
  user: parsedUser,
  setAuth: (token, user) => {
    if (storageAvailable) {
      window.localStorage.setItem("access_token", token);
      window.localStorage.setItem("user", JSON.stringify(user));
    }
    set({ token, user });
  },
  clearAuth: () => {
    if (storageAvailable) {
      window.localStorage.removeItem("access_token");
      window.localStorage.removeItem("user");
    }
    set({ token: null, user: null });
  },
}));
