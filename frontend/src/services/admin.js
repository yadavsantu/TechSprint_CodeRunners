// src/services/admin.js
import axiosInstance from '../utils/axios.js';

// Get all accident reports
export const getAllAccidentReports = async () => {
  try {
    const response = await axiosInstance.get('/accident/accidents');
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch accident reports.';
    throw new Error(errorMessage);
  }
};

// Get dashboard statistics (if you have a separate endpoint)
export const getDashboardStats = async () => {
  try {
    const response = await axiosInstance.get('/admin/stats');
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch dashboard statistics.';
    throw new Error(errorMessage);
  }
};

// Get report by ID
export const getReportById = async (reportId) => {
  try {
    const response = await axiosInstance.get(`/admin/reports/${reportId}`);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch report details.';
    throw new Error(errorMessage);
  }
};

// Delete a report
export const deleteReport = async (reportId) => {
  try {
    const response = await axiosInstance.delete(`/admin/reports/${reportId}`);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to delete report.';
    throw new Error(errorMessage);
  }
};

// Update report status
export const updateReportStatus = async (reportId, status) => {
  try {
    const response = await axiosInstance.patch(`/admin/reports/${reportId}/status`, { status });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to update report status.';
    throw new Error(errorMessage);
  }
};

// Export reports
export const exportReports = async (filters = {}) => {
  try {
    const response = await axiosInstance.get('/admin/reports/export', {
      params: filters,
      responseType: 'blob' // Important for file downloads
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to export reports.';
    throw new Error(errorMessage);
  }
};

// Get users list (if you have user management)
export const getAllUsers = async () => {
  try {
    const response = await axiosInstance.get('/admin/users');
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch users.';
    throw new Error(errorMessage);
  }
};

// Update user status
export const updateUserStatus = async (userId, isActive) => {
  try {
    const response = await axiosInstance.patch(`/admin/users/${userId}/status`, { isActive });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to update user status.';
    throw new Error(errorMessage);
  }
};

// Get analytics data
export const getAnalytics = async (timeRange = 'month') => {
  try {
    const response = await axiosInstance.get('/admin/analytics', {
      params: { timeRange }
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch analytics.';
    throw new Error(errorMessage);
  }
};

// AI Analysis (if you implement AI later)
export const analyzeReportAI = async (reportId) => {
  try {
    const response = await axiosInstance.post(`/ai/analyze/${reportId}`);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'AI analysis failed.';
    throw new Error(errorMessage);
  }
};

// Bulk operations
export const bulkAcceptReports = async (reportIds) => {
  try {
    const response = await axiosInstance.post('/admin/reports/bulk/accept', { reportIds });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to accept reports in bulk.';
    throw new Error(errorMessage);
  }
};

export const bulkRejectReports = async (reportIds) => {
  try {
    const response = await axiosInstance.post('/admin/reports/bulk/reject', { reportIds });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to reject reports in bulk.';
    throw new Error(errorMessage);
  }
};

// Search reports with filters
export const searchReports = async (filters = {}) => {
  try {
    const response = await axiosInstance.get('/admin/reports/search', {
      params: filters
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to search reports.';
    throw new Error(errorMessage);
  }
};

// Admin login (if separate from regular login)
export const adminLogin = async (credentials) => {
  try {
    const response = await axiosInstance.post('/admin/login', credentials);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Admin login failed.';
    throw new Error(errorMessage);
  }
};

// Verify admin token
export const verifyAdminToken = async () => {
  try {
    const response = await axiosInstance.get('/admin/verify');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Admin token verification failed.');
  }
};

// Update admin profile
export const updateAdminProfile = async (profileData) => {
  try {
    const response = await axiosInstance.patch('/admin/profile', profileData);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to update admin profile.';
    throw new Error(errorMessage);
  }
};

// Get system settings
export const getSystemSettings = async () => {
  try {
    const response = await axiosInstance.get('/admin/settings');
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch system settings.';
    throw new Error(errorMessage);
  }
};

// Update system settings
export const updateSystemSettings = async (settings) => {
  try {
    const response = await axiosInstance.patch('/admin/settings', settings);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to update system settings.';
    throw new Error(errorMessage);
  }
};