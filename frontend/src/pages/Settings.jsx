
import { useState } from "react";
import {
  User, Building2, Bell, Shield, Save, LockKeyhole
} from "lucide-react";
import toast from "react-hot-toast";

export default function Settings() {
  const storedUser = JSON.parse(
    localStorage.getItem("subsight_user") || "null"
  );

  const [profile, setProfile] = useState({
    name: storedUser?.name || "",
    email: storedUser?.email || "",
    phone: "",
  });

  const [company, setCompany] = useState({
    name: "Brightloop Software",
    email: "support@brightloop.com",
    phone: "",
    address: "",
  });

  const [notifications, setNotifications] = useState({
    invoice: true,
    payment: true,
    renewal: true,
    overdue: true,
  });

  const updateProfile = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const updateCompany = (e) => {
    setCompany({ ...company, [e.target.name]: e.target.value });
  };

  const toggleNotification = (name) => {
    setNotifications((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const saveProfile = (e) => {
    e.preventDefault();
    toast.success("Profile settings saved for this session.");
  };

  const saveCompany = (e) => {
    e.preventDefault();
    toast.success("Company settings saved for this session.");
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your account and application preferences.</p>
        </div>
      </div>

      <div className="settings-notice">
        Settings are currently stored in frontend state only.
        Backend persistence will be added during integration.
      </div>

      {/* PROFILE */}
      <section className="settings-card">
        <div className="settings-heading">
          <div className="settings-heading-icon">
            <User size={20} />
          </div>
          <div>
            <h3>Profile Information</h3>
            <p>Manage your personal account details.</p>
          </div>
        </div>

        <form onSubmit={saveProfile}>
          <div className="settings-form-grid">
            <label>
              Full Name
              <input
                name="name"
                value={profile.name}
                onChange={updateProfile}
                placeholder="Your name"
              />
            </label>

            <label>
              Email Address
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={updateProfile}
                placeholder="your@email.com"
              />
            </label>

            <label>
              Phone Number
              <input
                name="phone"
                value={profile.phone}
                onChange={updateProfile}
                placeholder="Phone number"
              />
            </label>
          </div>

          <button className="primary-btn settings-save-btn" type="submit">
            <Save size={16} /> Save Profile
          </button>
        </form>
      </section>

      {/* COMPANY */}
      <section className="settings-card">
        <div className="settings-heading">
          <div className="settings-heading-icon">
            <Building2 size={20} />
          </div>
          <div>
            <h3>Company Information</h3>
            <p>Manage your organization details.</p>
          </div>
        </div>

        <form onSubmit={saveCompany}>
          <div className="settings-form-grid">
            <label>
              Company Name
              <input
                name="name"
                value={company.name}
                onChange={updateCompany}
              />
            </label>

            <label>
              Company Email
              <input
                type="email"
                name="email"
                value={company.email}
                onChange={updateCompany}
              />
            </label>

            <label>
              Company Phone
              <input
                name="phone"
                value={company.phone}
                onChange={updateCompany}
                placeholder="Company phone"
              />
            </label>

            <label>
              Company Address
              <input
                name="address"
                value={company.address}
                onChange={updateCompany}
                placeholder="Company address"
              />
            </label>
          </div>

          <button className="primary-btn settings-save-btn" type="submit">
            <Save size={16} /> Save Company Details
          </button>
        </form>
      </section>

      {/* NOTIFICATIONS */}
      <section className="settings-card">
        <div className="settings-heading">
          <div className="settings-heading-icon">
            <Bell size={20} />
          </div>
          <div>
            <h3>Notification Preferences</h3>
            <p>Choose which notifications you want to receive.</p>
          </div>
        </div>

        <div className="settings-notification-list">
          {[
            ["invoice", "Invoice notifications", "Receive updates when invoices are created."],
            ["payment", "Payment notifications", "Receive updates when payments are recorded."],
            ["renewal", "Renewal reminders", "Get reminders about upcoming subscription renewals."],
            ["overdue", "Overdue alerts", "Receive alerts about overdue invoices."],
          ].map(([key, title, description]) => (
            <div className="settings-notification" key={key}>
              <div>
                <strong>{title}</strong>
                <p>{description}</p>
              </div>

              <button
                type="button"
                className={`settings-toggle ${notifications[key] ? "enabled" : ""}`}
                onClick={() => toggleNotification(key)}
                aria-label={`Toggle ${title}`}
                aria-pressed={notifications[key]}
              >
                <span />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* SECURITY */}
      <section className="settings-card">
        <div className="settings-heading">
          <div className="settings-heading-icon">
            <Shield size={20} />
          </div>
          <div>
            <h3>Security</h3>
            <p>Account security and authentication.</p>
          </div>
        </div>

        <div className="settings-security-row">
          <div className="settings-security-icon">
            <LockKeyhole size={20} />
          </div>
          <div>
            <strong>Password Management</strong>
            <p>Password changes will be available after backend integration.</p>
          </div>
          <span className="settings-coming-soon">Coming soon</span>
        </div>
      </section>
    </div>
  );
}
