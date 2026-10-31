
import { useEffect, useState } from "react";
import {
  IndianRupee,
  Users,
  RefreshCw,
  Clock,
  ArrowUpRight,
  ArrowRight,
  Activity
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

import StatCard from "../components/StatCard";
import api from "../services/api";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);

const getRows = (response) => {
  const data = response?.data?.data;
  return Array.isArray(data) ? data : [];
};

function Dashboard() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const results = await Promise.allSettled([
        api.get("/subscriptions"),
        api.get("/invoices"),
        api.get("/payments")
      ]);

      const [subsResult, invoicesResult, paymentsResult] = results;

      if (subsResult.status === "rejected") {
        throw subsResult.reason;
      }

      setSubscriptions(getRows(subsResult.value));
      setInvoices(
        invoicesResult.status === "fulfilled"
          ? getRows(invoicesResult.value)
          : []
      );
      setPayments(
        paymentsResult.status === "fulfilled"
          ? getRows(paymentsResult.value)
          : []
      );

      if (
        invoicesResult.status === "rejected" ||
        paymentsResult.status === "rejected"
      ) {
        setError("Some dashboard information could not be loaded.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load dashboard data. Please check your backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const activeSubscriptions = subscriptions.filter(
    (s) => String(s.status).toLowerCase() === "active"
  );

  const uniqueCustomers = new Set(
    subscriptions
      .map((s) => s.customer_id || s.customer_email || s.customer_name)
      .filter(Boolean)
  );

  // Convert active subscription prices into monthly recurring revenue.
  const mrr = activeSubscriptions.reduce((total, s) => {
    const price = Number(s.unit_price || s.price || 0);
    const cycle = String(s.billing_cycle || "Monthly").toLowerCase();

    if (cycle.includes("year")) return total + price / 12;
    if (cycle.includes("week")) return total + price * 4.345;
    if (cycle.includes("day")) return total + price * 30;
    return total + price;
  }, 0);

  const outstanding = invoices.reduce((total, invoice) => {
    const amount = Number(invoice.total_amount || 0);
    const paid = Number(invoice.amount_paid || 0);
    return total + Math.max(0, amount - paid);
  }, 0);

  const paidInvoices = invoices.filter(
    (i) => String(i.status).toLowerCase() === "paid"
  ).length;

  const overdueInvoices = invoices.filter(
    (i) => String(i.status).toLowerCase() === "overdue"
  ).length;

  const pendingInvoices = invoices.filter(
    (i) => ["pending", "partially paid", "confirmed"].includes(
      String(i.status).toLowerCase()
    )
  ).length;

  // Revenue by invoice month, using amounts actually paid.
  const revenueMap = {};

  invoices.forEach((invoice) => {
    const date = new Date(
      invoice.billing_period_start || invoice.created_at
    );

    if (Number.isNaN(date.getTime())) return;

    const month = date.toLocaleString("en-IN", { month: "short" });
    revenueMap[month] =
      (revenueMap[month] || 0) + Number(invoice.amount_paid || 0);
  });

  const revenueData = Object.entries(revenueMap).map(
    ([month, revenue]) => ({ month, revenue })
  );

  // Upcoming renewals within the next 30 days.
  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setDate(today.getDate() + 30);

  const upcomingRenewals = activeSubscriptions
    .filter((s) => {
      const expiry = new Date(s.expiry_date);
      return (
        !Number.isNaN(expiry.getTime()) &&
        expiry >= today &&
        expiry <= nextMonth
      );
    })
    .sort(
      (a, b) =>
        new Date(a.expiry_date) - new Date(b.expiry_date)
    );

  const recentPayments = [...payments]
    .sort(
      (a, b) =>
        new Date(b.payment_date || b.created_at) -
        new Date(a.payment_date || a.created_at)
    )
    .slice(0, 4);

  const stats = [
    {
      title: "Monthly Recurring Revenue",
      value: loading ? "..." : money(mrr),
      subtitle: "Based on active subscriptions",
      icon: IndianRupee,
      color: "purple"
    },
    {
      title: "Total Customers",
      value: loading ? "..." : uniqueCustomers.size,
      subtitle: "Customers with subscriptions",
      icon: Users,
      color: "blue"
    },
    {
      title: "Active Subscriptions",
      value: loading ? "..." : activeSubscriptions.length,
      subtitle: "Currently active",
      icon: RefreshCw,
      color: "green"
    },
    {
      title: "Outstanding Revenue",
      value: loading ? "..." : money(outstanding),
      subtitle: "Unpaid invoice balance",
      icon: Clock,
      color: "orange"
    }
  ];

  return (
    <div className="dashboard-page">

      <div className="page-heading">
        <div>
          <div className="page-eyebrow">BUSINESS OVERVIEW</div>
          <h1>Dashboard</h1>
          <p>Monitor your subscriptions, revenue and business performance.</p>
        </div>

        <button className="primary-button" onClick={loadDashboard}>
          <Activity size={17} />
          Refresh overview
        </button>
      </div>

      {error && (
        <div className="dashboard-panel" style={{ padding: 14, color: "#dc2626" }}>
          {error}
        </div>
      )}

      <div className="stats-grid">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="dashboard-main-grid">

        <section className="dashboard-panel revenue-panel">
          <div className="panel-heading">
            <div>
              <h3>Revenue Overview</h3>
              <p>Revenue collected from invoices</p>
            </div>
            <span className="period-button">All available months</span>
          </div>

          <div style={{ width: "100%", height: 260, padding: 12 }}>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => money(value)} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6250df"
                    fill="#6250df"
                    fillOpacity={0.15}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">
                <div className="empty-chart-icon">
                  <Activity size={26} />
                </div>
                <h3>{loading ? "Loading revenue..." : "No revenue data yet"}</h3>
                <p>Revenue will appear when invoice payments are recorded.</p>
              </div>
            )}
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h3>Business Activity</h3>
              <p>Recent payments</p>
            </div>
            <Activity size={18} />
          </div>

          <div className="invoice-summary">
            {recentPayments.length > 0 ? (
              recentPayments.map((payment) => (
                <div className="invoice-status" key={payment.id}>
                  <span className="status-dot paid-dot" />
                  <span>
                    {payment.payment_method || "Payment"}
                    <small style={{ display: "block" }}>
                      {payment.payment_date
                        ? new Date(payment.payment_date).toLocaleDateString()
                        : "Recent payment"}
                    </small>
                  </span>
                  <strong>{money(payment.amount)}</strong>
                </div>
              ))
            ) : (
              <div className="empty-activity">
                <Activity size={25} />
                <p>No payments recorded yet.</p>
              </div>
            )}
          </div>
        </section>

      </div>

      <div className="dashboard-bottom-grid">

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h3>Upcoming Renewals</h3>
              <p>Active subscriptions expiring in 30 days</p>
            </div>
          </div>

          {upcomingRenewals.length > 0 ? (
            <div className="invoice-summary">
              {upcomingRenewals.map((s) => (
                <div className="invoice-status" key={s.id}>
                  <span className="status-dot pending-dot" />
                  <span>
                    {s.customer_name || "Customer"}
                    <small style={{ display: "block" }}>
                      {s.subscription_number || "Subscription"}
                    </small>
                  </span>
                  <strong>
                    {new Date(s.expiry_date).toLocaleDateString("en-IN")}
                  </strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-table">
              {loading ? "Loading renewals..." : "No upcoming renewals in the next 30 days."}
            </div>
          )}
        </section>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h3>Invoice Summary</h3>
              <p>Payment status overview</p>
            </div>
            <ArrowUpRight size={18} />
          </div>

          <div className="invoice-summary">
            <div className="invoice-status">
              <span className="status-dot paid-dot" />
              <span>Paid invoices</span>
              <strong>{loading ? "..." : paidInvoices}</strong>
            </div>

            <div className="invoice-status">
              <span className="status-dot pending-dot" />
              <span>Pending / Partially paid</span>
              <strong>{loading ? "..." : pendingInvoices}</strong>
            </div>

            <div className="invoice-status">
              <span className="status-dot overdue-dot" />
              <span>Overdue invoices</span>
              <strong>{loading ? "..." : overdueInvoices}</strong>
            </div>
          </div>
        </section>

      </div>

    </div>
  );
}

export default Dashboard;
