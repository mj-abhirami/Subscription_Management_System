
import {
  Search,
  Bell,
  Menu,
  ChevronDown
} from "lucide-react";

function Topbar({ onMenuClick }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu-button"
          onClick={onMenuClick}
        >
          <Menu size={22} />
        </button>

        <div className="breadcrumb">
          <span>Workspace</span>
          <span className="breadcrumb-divider">/</span>
          <strong>Overview</strong>
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-search">
          <Search size={17} />
          <input
            type="text"
            placeholder="Search anything..."
          />
          <kbd>⌘ K</kbd>
        </div>

        <button className="notification-button" aria-label="Notifications">
          <Bell size={19} />
          <span className="notification-dot" />
        </button>

        <div className="profile-section">
          <div className="profile-avatar">A</div>

          <div className="profile-info">
            <strong>Administrator</strong>
            <span>Admin account</span>
          </div>

          <ChevronDown size={16} />
        </div>
      </div>
    </header>
  );
}

export default Topbar;
