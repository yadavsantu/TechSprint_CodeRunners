// Frontend service
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api", // match your backend port
  withCredentials: true, // send JWT cookie
});

export const updateAmbulanceStatus = (status) =>
  API.patch("/ambulance/status", { status });
