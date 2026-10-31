
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  LogOut,
  UserRound,
} from "lucide-react";

function Topbar({ onMenuClick }) {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const user = JSON.parse(
    localStorage.getItem("subsight_user") || "null"
  );

  const userName = user?.name || "Administrator";
  const userRole = user?.role || "admin";

  const initials = userName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("subsight_token");
    localStorage.removeItem("subsight_user");

    setProfileOpen(false);
    navigate("/login", { replace: true });
  };

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

        <button
          className="notification-button"
          aria-label="Notifications"
        >
          <Bell size={19} />
          <span className="notification-dot" />
        </button>

        <div className="profile-dropdown-wrapper">
          <button
            className="profile-section"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-expanded={profileOpen}
          >
            <div className="profile-avatar">{initials}</div>

            <div className="profile-info">
              <strong>{userName}</strong>
              <span>{userRole} account</span>
            </div>

            <ChevronDown
              size={16}
              className={profileOpen ? "profile-chevron-open" : ""}
            />
          </button>

          {profileOpen && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-user">
                <UserRound size={17} />
                <div>
                  <strong>{userName}</strong>
                  <span>{user?.email || ""}</span>
                </div>
              </div>

              <button
                className="profile-logout"
                onClick={handleLogout}
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
