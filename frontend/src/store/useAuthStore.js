import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginUser, signupUser, logoutUser } from "../services/auth";

export const useAuthStore = create(
  persist(
    (set) => ({
      // ------------------
      // STATE
      // ------------------
      user: null,               // { id, email, role, ... }
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ------------------
      // ACTIONS
      // ------------------
      login: async (credentials) => {
        set({ isLoading: true, error: null });

        try {
          const result = await loginUser(credentials);
        // ✅ NORMALIZED RESPONSE
          set({
            user: result.data,       // must contain role
            token: result.token,
            isAuthenticated: true,
            isLoading: false,
          });
      console.log("Auth Store - Login successful:", result);
          return result;
        } catch (err) {
          set({
            isLoading: false,
            error: err.message,
          });
          throw error;
        }
      },
       loginDriver: async (credentials) => {
    set({ isLoading: true });
    try {
      const data = await loginDriver(credentials);
      set({
        user: data.data,
        isAuthenticated: true,
        isLoading: false,
      });
      return data;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

      signup: async (userData) => {
        set({ isLoading: true, error: null });

        try {
          const result = await signupUser(userData);

          set({
            user: result.data,
            token: result.token,
            isAuthenticated: true,
            isLoading: false,
          });

          return result;
        } catch (err) {
          set({
            isLoading: false,
            error: err.message,
          });
          throw err;
        }
      },

      logout: async () => {
        try {
          await logoutUser();
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
    }
  )
);
