
import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Plans from "./pages/Plans";
import Subscriptions from "./pages/Subscriptions";
import Quotations from "./pages/Quotations";
import Invoices from "./pages/Invoices";
import Payments from "./pages/Payments";
import Discounts from "./pages/Discounts";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

// Customer portal
import CustomerDashboard from "./pages/CustomerDashboard";

// Read authenticated user
function getUser() {
  try {
    return JSON.parse(localStorage.getItem("subsight_user") || "null");
  } catch {
    return null;
  }
}

// Protect routes
function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("subsight_token");
  const user = getUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return user.role === "customer"
      ? <Navigate to="/customer-dashboard" replace />
      : <Navigate to="/" replace />;
  }

  return children;
}

// Redirect authenticated users away from login
function PublicRoute({ children }) {
  const token = localStorage.getItem("subsight_token");
  const user = getUser();

  if (token && user) {
    return user.role === "customer"
      ? <Navigate to="/customer-dashboard" replace />
      : <Navigate to="/" replace />;
  }

  return children;
}

// Admin and Staff layout
function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-layout">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/products" element={<Products />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/quotations" element={<Quotations />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/discounts" element={<Discounts />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// Customer layout
function CustomerLayout() {
  return <CustomerDashboard />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/customer-dashboard/*"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/*"
          element={
            <ProtectedRoute allowedRoles={["admin", "staff"]}>
              <AppLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
