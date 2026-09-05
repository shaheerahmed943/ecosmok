import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, clearAuthToken, setAuthToken } from "@/lib/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
  phone: string | null;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: { name: string; email: string; password: string; phone?: string }) => Promise<AuthUser>;
  logout: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const result = (await api.login(email, password)) as { token: string; user: AuthUser };
          setAuthToken(result.token);
          set({ user: result.user, isLoading: false });
          return result.user;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (payload) => {
        set({ isLoading: true });
        try {
          const result = (await api.register(payload)) as { token: string; user: AuthUser };
          setAuthToken(result.token);
          set({ user: result.user, isLoading: false });
          return result.user;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: () => {
        clearAuthToken();
        set({ user: null });
      },

      /** Re-validates the stored session against the API (e.g. on app load). */
      hydrate: async () => {
        try {
          const user = (await api.getCurrentUser()) as AuthUser;
          set({ user });
        } catch {
          clearAuthToken();
          set({ user: null });
        }
      },
    }),
    { name: "ecosmoke-auth", partialize: (state) => ({ user: state.user }) },
  ),
);
