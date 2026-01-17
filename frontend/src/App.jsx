import { BrowserRouter, Routes, Route } from "react-router-dom";

// pages
import HomePage from "./pages/HomePage.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";

// route protection
import RoleProtectedRoute from "./routes/RoleProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />

        {/* ADMIN ONLY ROUTES */}
        {/*
        <Route
          element={
            <RoleProtectedRoute allowedRoles={["ADMIN"]} />
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
        */}

        {/* Unauthorized */}
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </BrowserRouter>
  );
}