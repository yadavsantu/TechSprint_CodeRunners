import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginUser, signupUser, logoutUser,loginDriverService } from "../services/auth";
import { toast } from "react-hot-toast";
export const useAuthStore = create(
  persist(
    (set) => ({
    
      user: null,              
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

    
      login: async (credentials) => {
        set({ isLoading: true, error: null });

        try {
          const result = await loginUser(credentials);
     
          set({
            user: result.data,       
            token: result.token,
            isAuthenticated: true,
            isLoading: false,
          });
          toast.success("Login successful!");
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
        set({ isLoading: true, error: null });
        try {
          const result = await loginDriverService(credentials); 
          
      
          set({
            user: result.data,
            token: result.token,  
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          
          console.log("Auth Store - Driver Login successful:", result);
          return result;
        } catch (err) {
          set({
            isLoading: false,
            error: err.message,
          });
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
