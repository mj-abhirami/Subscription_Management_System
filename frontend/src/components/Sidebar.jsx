
import {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  RefreshCw,
  FileText,
  CreditCard,
  Tag,
  BarChart3,
  Settings,
  Zap,
  X
} from "lucide-react";

import { NavLink } from "react-router-dom";

const navigationItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Customers", path: "/customers", icon: Users },
  { name: "Products", path: "/products", icon: Package },
  { name: "Plans", path: "/plans", icon: Layers },
  { name: "Subscriptions", path: "/subscriptions", icon: RefreshCw },
  { name: "Quotations", path: "/quotations", icon: FileText },
  { name: "Invoices", path: "/invoices", icon: FileText },
  { name: "Payments", path: "/payments", icon: CreditCard },
  { name: "Discounts", path: "/discounts", icon: Tag },
  { name: "Analytics", path: "/analytics", icon: BarChart3 }
];

function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Zap size={22} />
          </div>

          <div className="brand-text">
            <h2>SUBSIGHT</h2>
            <span>Subscription Intelligence</span>
          </div>

          <button className="mobile-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-section-label">
          WORKSPACE
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={onClose}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "nav-item-active" : ""}`
                }
              >
                <Icon size={19} strokeWidth={1.8} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `nav-item ${isActive ? "nav-item-active" : ""}`
            }
            onClick={onClose}
          >
            <Settings size={19} />
            <span>Settings</span>
          </NavLink>

          <div className="sidebar-plan-card">
            <div className="plan-card-icon">
              <Zap size={17} />
            </div>

            <strong>SUBSIGHT PRO</strong>
            <p>Your business, intelligently managed.</p>
          </div>

          <div className="sidebar-version">
            SUBSIGHT v1.0.0
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
