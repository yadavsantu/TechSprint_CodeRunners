import axiosInstance from '../utils/axios.js';

// Login User
export const loginUser = async (credentials) => {
  try {
    const response = await axiosInstance.post('/auth/login', credentials);
    
    return response.data; // Just return the entire response from backend
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
    throw new Error(errorMessage);
  }
};
export const loginDriver = async (credentials) => {
  try {
    const response = await axiosInstance.post('/auth/driver/login', credentials);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Driver login failed');
  }
};

// Signup User
export const signupUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/auth/register', userData);
    
    return response.data; // Just return the entire response from backend
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Signup failed. Please try again.';
    throw new Error(errorMessage);
  }
};

// Logout User
export const logoutUser = async () => {
  try {
    const response = await axiosInstance.post('/auth/logout');
    console.log("logout sucessfully");
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Logout failed';
    throw new Error(errorMessage);
  }
};

// Get Current User (optional - fetch user data from backend)
export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch user data';
    throw new Error(errorMessage);
  }
};

// Verify Token (optional - check if token is still valid)
export const verifyToken = async () => {
  try {
    const response = await axiosInstance.get('/auth/verify');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Token verification failed');
  }
};

// Refresh Token (optional - if you implement refresh token logic)
export const refreshToken = async () => {
  try {
    const response = await axiosInstance.post('/auth/refresh');
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Token refresh failed';
    throw new Error(errorMessage);
  }
};