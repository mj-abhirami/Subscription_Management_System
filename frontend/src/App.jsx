import { useState } from "react";
import Customers from "./pages/Customers";

import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import Dashboard from "./pages/Dashboard";
import PlaceholderPage from "./pages/PlaceholderPage";

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

            <Route
              path="/customers"
              element={
                <Customers />
              }
            />

            <Route
              path="/products"
              element={
                <PlaceholderPage
                  title="Products"
                  description="Manage products, variants and pricing."
                />
              }
            />

            <Route
              path="/plans"
              element={
                <PlaceholderPage
                  title="Plans"
                  description="Configure subscription plans and billing cycles."
                />
              }
            />

            <Route
              path="/subscriptions"
              element={
                <PlaceholderPage
                  title="Subscriptions"
                  description="Manage subscription lifecycle and renewals."
                />
              }
            />

            <Route
              path="/quotations"
              element={
                <PlaceholderPage
                  title="Quotations"
                  description="Create and manage customer quotations."
                />
              }
            />

            <Route
              path="/invoices"
              element={
                <PlaceholderPage
                  title="Invoices"
                  description="Generate and manage customer invoices."
                />
              }
            />

            <Route
              path="/payments"
              element={
                <PlaceholderPage
                  title="Payments"
                  description="Track and record customer payments."
                />
              }
            />

            <Route
              path="/discounts"
              element={
                <PlaceholderPage
                  title="Discounts"
                  description="Configure promotional discount rules."
                />
              }
            />

            <Route
              path="/analytics"
              element={
                <PlaceholderPage
                  title="Business Intelligence"
                  description="Explore revenue intelligence and customer health."
                />
              }
            />

            <Route
              path="/settings"
              element={
                <PlaceholderPage
                  title="Settings"
                  description="Manage your workspace preferences."
                />
              }
            />
          </Routes>

        </main>

      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
