
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
import PlaceholderPage from "./pages/PlaceholderPage";
import Subscriptions from "./pages/Subscriptions";
import Quotations from "./pages/Quotations";
import Invoices from "./pages/Invoices";
import Payments from "./pages/Payments";
import Discounts from "./pages/Discounts";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

// Protect pages that require authentication
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("subsight_token");

  return token ? children : <Navigate to="/login" replace />;
}

// Redirect logged-in users away from Login
function PublicRoute({ children }) {
  const token = localStorage.getItem("subsight_token");

  return token ? <Navigate to="/" replace /> : children;
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-layout">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />

            <Route path="/customers" element={<Customers />} />
            <Route path="/products" element={<Products />} />
            <Route path="/plans" element={<Plans />} />

            <Route
              path="/subscriptions"
              element={
                <Subscriptions />
              }
            />

            <Route
              path="/quotations"
              element={
                <Quotations />
              }
            />

            <Route
              path="/invoices"
              element={
                <Invoices />
              }
            />

            <Route
              path="/payments"
              element={
                <Payments />
              }
            />

            <Route
              path="/discounts"
              element={
                <Discounts />
              }
            />

            <Route
              path="/analytics"
              element={
                <Analytics />
              }
            />

            <Route
              path="/settings"
              element={
                <Settings />
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
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
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
