
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

import {
  TrendingUp,
  IndianRupee,
  Users,
  RefreshCw,
  CalendarDays,
  Activity,
} from "lucide-react";

const revenueData = [
  { month: "May", revenue: 42000, expenses: 18000 },
  { month: "Jun", revenue: 51000, expenses: 21000 },
  { month: "Jul", revenue: 47000, expenses: 19000 },
  { month: "Aug", revenue: 65000, expenses: 25000 },
  { month: "Sep", revenue: 72000, expenses: 28000 },
  { month: "Oct", revenue: 89000, expenses: 32000 },
];

const subscriptionData = [
  { name: "Active", value: 65 },
  { name: "Paused", value: 15 },
  { name: "Closed", value: 10 },
  { name: "Draft", value: 10 },
];

const paymentData = [
  { method: "UPI", amount: 45000 },
  { method: "Card", amount: 32000 },
  { method: "Cash", amount: 12000 },
  { method: "Bank", amount: 26000 },
];

const renewalData = [
  { customer: "Acme Solutions", plan: "Enterprise", date: "Nov 03, 2026", amount: 12000 },
  { customer: "Nova Technologies", plan: "Professional", date: "Nov 07, 2026", amount: 7500 },
  { customer: "Bright Systems", plan: "Basic", date: "Nov 12, 2026", amount: 3000 },
  { customer: "Pixel Works", plan: "Enterprise", date: "Nov 18, 2026", amount: 12000 },
];

const COLORS = ["#2563eb", "#f59e0b", "#ef4444", "#94a3b8"];

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function Analytics() {
  const totalRevenue = revenueData.reduce(
    (sum, item) => sum + item.revenue,
    0
  );

  const currentMRR = 89000;
  const currentARR = currentMRR * 12;
  const activeSubscriptions = 65;
  const growth = 23.6;

  return (
    <div className="analytics-page">
      <div className="page-header analytics-header">
        <div>
          <h1>Business Analytics</h1>
          <p>Monitor revenue, subscriptions and business performance.</p>
        </div>

        <div className="analytics-period">
          <CalendarDays size={17} />
          <span>May – October 2026</span>
        </div>
      </div>

      <div className="analytics-demo-notice">
        <Activity size={17} />
        <span>
          Demonstration data is currently displayed. Live analytics will
          be available after backend integration.
        </span>
      </div>

      {/* KPI CARDS */}
      <div className="analytics-kpis">
        <div className="analytics-kpi">
          <div className="analytics-kpi-top">
            <span>Monthly Recurring Revenue</span>
            <div className="analytics-icon blue">
              <IndianRupee size={19} />
            </div>
          </div>
          <h2>{money(currentMRR)}</h2>
          <span className="analytics-growth">
            <TrendingUp size={14} /> {growth}% growth
          </span>
        </div>

        <div className="analytics-kpi">
          <div className="analytics-kpi-top">
            <span>Annual Recurring Revenue</span>
            <div className="analytics-icon purple">
              <TrendingUp size={19} />
            </div>
          </div>
          <h2>{money(currentARR)}</h2>
          <span className="analytics-subtext">Annualized from current MRR</span>
        </div>

        <div className="analytics-kpi">
          <div className="analytics-kpi-top">
            <span>Total Revenue (6 Months)</span>
            <div className="analytics-icon green">
              <IndianRupee size={19} />
            </div>
          </div>
          <h2>{money(totalRevenue)}</h2>
          <span className="analytics-subtext">May – October 2026</span>
        </div>

        <div className="analytics-kpi">
          <div className="analytics-kpi-top">
            <span>Active Subscriptions</span>
            <div className="analytics-icon orange">
              <Users size={19} />
            </div>
          </div>
          <h2>{activeSubscriptions}</h2>
          <span className="analytics-subtext">Demonstration count</span>
        </div>
      </div>

      {/* REVENUE CHART */}
      <div className="analytics-chart-card">
        <div className="analytics-section-heading">
          <div>
            <h3>Revenue Overview</h3>
            <p>Monthly revenue and expenses</p>
          </div>
          <span className="analytics-chart-label">Last 6 months</span>
        </div>

        <div className="analytics-chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
              <Tooltip formatter={(value) => money(value)} />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#2563eb"
                fill="url(#revenueGradient)"
                strokeWidth={3}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="#f59e0b"
                fill="transparent"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BREAKDOWN CHARTS */}
      <div className="analytics-two-columns">
        <div className="analytics-chart-card">
          <div className="analytics-section-heading">
            <div>
              <h3>Subscription Breakdown</h3>
              <p>Distribution by subscription status</p>
            </div>
          </div>

          <div className="analytics-chart pie-chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subscriptionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={55}
                  paddingAngle={3}
                >
                  {subscriptionData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analytics-chart-card">
          <div className="analytics-section-heading">
            <div>
              <h3>Payment Methods</h3>
              <p>Revenue collected by payment method</p>
            </div>
          </div>

          <div className="analytics-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="method" />
                <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
                <Tooltip formatter={(value) => money(value)} />
                <Bar
                  dataKey="amount"
                  name="Collected"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RENEWAL RADAR */}
      <div className="analytics-chart-card renewal-card">
        <div className="analytics-section-heading">
          <div>
            <h3>Upcoming Renewals</h3>
            <p>Subscriptions approaching their renewal dates</p>
          </div>
          <div className="renewal-heading-icon">
            <RefreshCw size={18} />
          </div>
        </div>

        <div className="renewal-table-wrapper">
          <table className="renewal-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Plan</th>
                <th>Renewal Date</th>
                <th>Expected Amount</th>
              </tr>
            </thead>
            <tbody>
              {renewalData.map((item) => (
                <tr key={item.customer}>
                  <td>{item.customer}</td>
                  <td>{item.plan}</td>
                  <td>{item.date}</td>
                  <td>{money(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
