
import {
  IndianRupee,
  Users,
  RefreshCw,
  Clock,
  ArrowUpRight,
  ArrowRight,
  Activity
} from "lucide-react";

import StatCard from "../components/StatCard";

function Dashboard() {
  const stats = [
    {
      title: "Monthly Recurring Revenue",
      value: "—",
      subtitle: "Awaiting analytics data",
      icon: IndianRupee,
      color: "purple"
    },
    {
      title: "Total Customers",
      value: "—",
      subtitle: "Awaiting customer data",
      icon: Users,
      color: "blue"
    },
    {
      title: "Active Subscriptions",
      value: "—",
      subtitle: "Awaiting subscription data",
      icon: RefreshCw,
      color: "green"
    },
    {
      title: "Outstanding Revenue",
      value: "—",
      subtitle: "Awaiting invoice data",
      icon: Clock,
      color: "orange"
    }
  ];

  return (
    <div className="dashboard-page">

      <div className="page-heading">
        <div>
          <div className="page-eyebrow">
            BUSINESS OVERVIEW
          </div>

          <h1>Dashboard</h1>

          <p>
            Monitor your subscriptions, revenue and business performance.
          </p>
        </div>

        <button className="primary-button">
          <Activity size={17} />
          Live overview
        </button>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            {...stat}
          />
        ))}
      </div>

      <div className="dashboard-main-grid">

        <section className="dashboard-panel revenue-panel">
          <div className="panel-heading">
            <div>
              <h3>Revenue Overview</h3>
              <p>Recurring revenue performance</p>
            </div>

            <button className="period-button">
              Last 30 days
            </button>
          </div>

          <div className="empty-chart">
            <div className="empty-chart-icon">
              <Activity size={26} />
            </div>

            <h3>Revenue intelligence is coming</h3>

            <p>
              Your revenue chart will appear here
              once analytics data is connected.
            </p>
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h3>Business Activity</h3>
              <p>Recent system activity</p>
            </div>

            <button className="icon-action">
              <ArrowUpRight size={18} />
            </button>
          </div>

          <div className="empty-activity">
            <Activity size={25} />
            <p>No recent activity available yet.</p>
          </div>
        </section>

      </div>

      <div className="dashboard-bottom-grid">

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h3>Upcoming Renewals</h3>
              <p>Subscriptions approaching expiry</p>
            </div>

            <button className="text-action">
              View all <ArrowRight size={15} />
            </button>
          </div>

          <div className="empty-table">
            No upcoming renewals to display.
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h3>Invoice Summary</h3>
              <p>Payment status overview</p>
            </div>
          </div>

          <div className="invoice-summary">
            <div className="invoice-status">
              <span className="status-dot paid-dot" />
              <span>Paid invoices</span>
              <strong>—</strong>
            </div>

            <div className="invoice-status">
              <span className="status-dot pending-dot" />
              <span>Pending invoices</span>
              <strong>—</strong>
            </div>

            <div className="invoice-status">
              <span className="status-dot overdue-dot" />
              <span>Overdue invoices</span>
              <strong>—</strong>
            </div>
          </div>
        </section>

      </div>

    </div>
  );
}

export default Dashboard;
