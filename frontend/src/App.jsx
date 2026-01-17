// App.jsx
import React from "react";
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";

import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Unauthorized from "./pages/Unauthorized";

import UserDashboard from "./dashboard/UserDashboard";
import DriverDashboard from "./dashboard/DriverDashboard";
import HospitalDashboard from "./dashboard/HospitalDashboard";
import AdminDashboard from "./dashboard/AdminDashboard";

// ---------------------
// Layout Component
// ---------------------
const MainLayout = () => (
  <>
    <Header />
    <main>
      <Outlet />
    </main>
  </>
);

// ---------------------
// Role Based Route
// ---------------------
const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.role) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// ---------------------
// Public Route
// ---------------------
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    const dashboardPath = getDashboardPath(user?.role);
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

// ---------------------
// Helpers
// ---------------------
const getDashboardPath = (role) => {
  switch (role) {
    case "driver":
      return "/dashboard/driver";
    case "hospital":
      return "/dashboard/hospital";
    case "admin":
      return "/dashboard/admin";
    case "user":
    default:
      return "/dashboard/user";
  }
};

const RootRedirect = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/" replace />;

  const dashboardPath = getDashboardPath(user?.role);
  return <Navigate to={dashboardPath} replace />;
};

// ---------------------
// Router
// ---------------------
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <PublicRoute><Login /></PublicRoute> },
      { path: "signup", element: <PublicRoute><Signup /></PublicRoute> },
      { path: "unauthorized", element: <Unauthorized /> },

      // Dashboard Routes (all role checks at parent level)
      {
        path: "dashboard",
        element: (
          <RoleBasedRoute allowedRoles={["user", "driver", "hospital", "admin"]}>
            <Outlet />
          </RoleBasedRoute>
        ),
        children: [
          { path: "user", element: <UserDashboard /> },
          { path: "driver", element: <DriverDashboard /> },
          { path: "hospital", element: <HospitalDashboard /> },
          { path: "admin", element: <AdminDashboard /> },
        ],
      },

      // Catch-all
      { path: "*", element: <RootRedirect /> },
    ],
  },
]);

// ---------------------
// App Component
// ---------------------
export default function App() {
  return <RouterProvider router={router} />;
}