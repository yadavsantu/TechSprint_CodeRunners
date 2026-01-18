import axiosInstance from "../utils/axios.js";

/**
 * Submit Accident Report
 */


export const submitAccidentReport = async (reportData) => {
  try {
    const response = await axiosInstance.post(
      "/accident/report",
      reportData
    );
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      "Failed to submit accident report. Please try again.";
    throw new Error(errorMessage);
  }
};


export const getAllAccidentReports = async () => {
  try {
    const response = await axiosInstance.get('/accident/accidents');
    console.log("Fetched accident reports:", response.data);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch accident reports.';
    throw new Error(errorMessage);
  }
};  

/**
 * Accept a report (update status to "accepted")
 */
export const acceptReport = async (id) => {
  const response = await axiosInstance.patch(
    `/accident/accidents/${id}/status`,
    { status: "verified" }   // ✅ MATCH BACKEND
  );
  return response.data;
};

export const rejectReport = async (id) => {
  const response = await axiosInstance.patch(
    `/accident/accidents/${id}/status`,
    { status: "rejected" }
  );
  return response.data;
};

/**
 * Get single report by ID
 */
export const getReportById = async (id) => {
  try {
    const response = await axiosInstance.get(`/accident/accidents/${id}`);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      "Failed to fetch report";
    throw new Error(errorMessage);
  }
};