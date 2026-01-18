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
import AdminReports from "./pages/AdminReport";
import AdminDashboard from "./dashboard/AdminDashboard";

// Main layout with header
const MainLayout = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
};

// Protected route component for role-based access
const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Show loading if user data hasn't loaded yet
  if (!user?.role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading user data...</p>
      </div>
    );
  }

  // Check if user's role is allowed for this route
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Public route component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user?.role) {
    const dashboardPath = getDashboardPath(user.role);
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

// Helper function to get dashboard path based on role
const getDashboardPath = (role) => {
  switch (role) {
    case "admin":
      return "/dashboard/admin";
    case "driver":
      return "/dashboard/driver";
    case "hospital":
      return "/dashboard/hospital";
    case "user":
      return "/dashboard/user";
    default:
      return "/dashboard/user";
  }
};

// Root redirect component for catch-all routes
const RootRedirect = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user?.role) {
    const dashboardPath = getDashboardPath(user.role);
    return <Navigate to={dashboardPath} replace />;
  }

  return <Navigate to="/" replace />;
};

// Router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      // Public routes
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "login",
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        ),
      },
      {
        path: "signup",
        element: (
          <PublicRoute>
            <Signup />
          </PublicRoute>
        ),
      },
      {
        path: "unauthorized",
        element: <Unauthorized />,
      },

      // Dashboard routes (role-based)
      {
        path: "dashboard",
        element: <Outlet />,
        children: [
          {
            path: "user",
            element: (
              <RoleBasedRoute allowedRoles={["user"]}>
                <UserDashboard />
              </RoleBasedRoute>
            ),
          },
          {
            path: "driver",
            element: (
              <RoleBasedRoute allowedRoles={["driver"]}>
                <DriverDashboard />
              </RoleBasedRoute>
            ),
          },
          {
            path: "admin",
            element: (
              <RoleBasedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </RoleBasedRoute>
            ),
          },
          {
            path: "hospital",
            element: (
              <RoleBasedRoute allowedRoles={["hospital"]}>
                <HospitalDashboard />
              </RoleBasedRoute>
            ),
          },
          
        ],
      },

      // Catch-all route
      {
        path: "*",
        element: <RootRedirect />,
      },
    ],
  },
]);

// Main App component
function App() {
  return <RouterProvider router={router} />;
}

export default App;