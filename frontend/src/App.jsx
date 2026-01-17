// App.jsx
import React from "react";
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";

// Pages & Components
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Unauthorized from "./pages/Unauthorized";

// Dashboards
import UserDashboard from "./dashboard/UserDashboard";
import DriverDashboard from "./dashboard/DriverDashboard";
import HospitalDashboard from "./dashboard/HospitalDashboard";

// ---------------------
// Layout Component
// ---------------------
const MainLayout = () => {
  return (
    <>
      <Header />       {/* Header is inside router context */}
      <main>
        <Outlet />     {/* Renders the matched child route */}
      </main>
    </>
  );
};

// ---------------------
// Role-Based Route Wrapper
// ---------------------
const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/" replace />;

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// ---------------------
// Public Route Wrapper
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
// Helper: Get dashboard path
// ---------------------
const getDashboardPath = (role) => {
  switch (role) {
    case "driver":
      return "/driver/dashboard";
    case "hospital":
      return "/hospital/dashboard";
    case "user":
    default:
      return "/dashboard";
  }
};

// ---------------------
// Root Redirect (404)
// ---------------------
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
    element: <MainLayout />,  // Layout wraps all child routes
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/login", element: <PublicRoute><Login /></PublicRoute> },
      { path: "/signup", element: <PublicRoute><Signup /></PublicRoute> },
      { path: "/unauthorized", element: <Unauthorized /> },

      // User Dashboard
      {
        path: "/dashboard/user",
        element: <RoleBasedRoute allowedRoles={["user"]}><UserDashboard /></RoleBasedRoute>,
      },

      // Driver Dashboard
      {
        path: "/dashboard/driver",
        element: <RoleBasedRoute allowedRoles={["driver"]}><DriverDashboard /></RoleBasedRoute>,
      },

      // Hospital Dashboard
      {
        path: "/dashboard/hospital",
        element: <RoleBasedRoute allowedRoles={["hospital"]}><HospitalDashboard /></RoleBasedRoute>,
      },

      // Catch-all
      { path: "*", element: <RootRedirect /> },
    ],
  },
]);

// ---------------------
// App Component
// ---------------------
function App() {
  return <RouterProvider router={router} />;
}

export default App;
