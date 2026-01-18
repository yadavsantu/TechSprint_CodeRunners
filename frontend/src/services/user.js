import axiosInstance from "../utils/axios.js";


export const getUserProfile = async () => {
  try {
    const response = await axiosInstance.get("/user/profile");
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      "Failed to fetch user profile. Please try again.";
    throw new Error(errorMessage);
  }
};



export const getUserReports = async () => {
  try {
    const response = await axiosInstance.get("/accident/my-reports");
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      "Failed to fetch user reports.";
    throw new Error(errorMessage);
  }
};

