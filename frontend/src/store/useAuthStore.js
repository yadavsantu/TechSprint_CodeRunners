import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginUser, signupUser, logoutUser } from "../services/auth";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      isLoading: false,
      error: null,

      // Login action
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const result = await loginUser(credentials);
          set({
            user: result.user,
            token: result.token || null,
            isAuthenticated: true,
            isLoading: false,
          });
          return result;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.message 
          });
          throw error;
        }
      },

      // Signup action
      signup: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const result = await signupUser(userData);
          set({
            user: result.user,
            token: result.token || null,
            isAuthenticated: true,
            isLoading: false,
          });
          return result;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.message 
          });
          throw error;
        }
      },

      // Logout action
      logout: async () => {
        try {
          await logoutUser();
        } catch (err) {
          console.error("Logout API failed", err);
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