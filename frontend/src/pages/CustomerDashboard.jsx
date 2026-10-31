
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  LogOut,
  RefreshCw,
  Repeat,
  FileText,
  Wallet,
  CreditCard,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

function CustomerDashboard() {
  const navigate = useNavigate();

  const [subscriptions, setSubscriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(
    localStorage.getItem("subsight_user") || "null"
  );

  const fetchCustomerData = async () => {
    try {
      setLoading(true);

      const results = await Promise.allSettled([
        api.get("/subscriptions"),
        api.get("/invoices"),
        api.get("/payments"),
      ]);

      const [subscriptionResult, invoiceResult, paymentResult] = results;

      if (subscriptionResult.status === "fulfilled") {
        setSubscriptions(subscriptionResult.value.data.data || []);
      } else {
        toast.error("Unable to load subscriptions.");
      }

      if (invoiceResult.status === "fulfilled") {
        setInvoices(invoiceResult.value.data.data || []);
      } else {
        toast.error("Unable to load invoices.");
      }

      if (paymentResult.status === "fulfilled") {
        setPayments(paymentResult.value.data.data || []);
      } else {
        toast.error("Unable to load payments.");
      }
    } catch {
      toast.error("Unable to load dashboard information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("subsight_token");
    localStorage.removeItem("subsight_user");
    navigate("/login", { replace: true });
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const activeSubscriptions = subscriptions.filter(
    (item) => item.status === "Active"
  ).length;

  const outstandingAmount = invoices.reduce((total, invoice) => {
    const remaining =
      Number(invoice.total_amount || 0) -
      Number(invoice.amount_paid || 0);

    return total + Math.max(0, remaining);
  }, 0);

  const totalPayments = payments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0
  );

  const getStatusClass = (status) =>
    `customer-status customer-status-${String(status || "")
      .toLowerCase()
      .replace(/\s+/g, "-")}`;

  return (
    <div className="customer-dashboard">
      <header className="customer-header">
        <div className="customer-brand">
          <div className="customer-brand-icon">
            <Zap size={23} />
          </div>
          <div>
            <h2>SUBSIGHT</h2>
            <span>Customer Portal</span>
          </div>
        </div>

        <button className="customer-logout" onClick={handleLogout}>
          <LogOut size={17} />
          Logout
        </button>
      </header>

      <main className="customer-dashboard-content">
        <section className="customer-welcome">
          <div>
            <span className="customer-eyebrow">
              CUSTOMER DASHBOARD
            </span>
            <h1>
              Welcome back, {user?.name || "Customer"}!
            </h1>
            <p>
              Here's an overview of your subscriptions, invoices
              and payments.
            </p>
          </div>

          <button
            className="customer-refresh"
            onClick={fetchCustomerData}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </section>

        <section className="customer-stat-grid">
          <div className="customer-stat-card">
            <div className="customer-stat-icon blue">
              <Repeat size={22} />
            </div>
            <span>Total Subscriptions</span>
            <h2>{loading ? "—" : subscriptions.length}</h2>
          </div>

          <div className="customer-stat-card">
            <div className="customer-stat-icon green">
              <Zap size={22} />
            </div>
            <span>Active Subscriptions</span>
            <h2>{loading ? "—" : activeSubscriptions}</h2>
          </div>

          <div className="customer-stat-card">
            <div className="customer-stat-icon orange">
              <Wallet size={22} />
            </div>
            <span>Outstanding Amount</span>
            <h2>
              {loading ? "—" : formatCurrency(outstandingAmount)}
            </h2>
          </div>

          <div className="customer-stat-card">
            <div className="customer-stat-icon purple">
              <CreditCard size={22} />
            </div>
            <span>Total Payments</span>
            <h2>
              {loading ? "—" : formatCurrency(totalPayments)}
            </h2>
          </div>
        </section>

        <section className="customer-data-section">
          <div className="customer-section-heading">
            <div>
              <h2>My Subscriptions</h2>
              <p>View your current and previous subscriptions.</p>
            </div>
            <Repeat size={21} />
          </div>

          <div className="customer-data-table-wrapper">
            <table className="customer-data-table">
              <thead>
                <tr>
                  <th>SUBSCRIPTION</th>
                  <th>PLAN</th>
                  <th>BILLING CYCLE</th>
                  <th>START DATE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="customer-table-message">
                      Loading subscriptions...
                    </td>
                  </tr>
                ) : subscriptions.length > 0 ? (
                  subscriptions.map((item) => (
                    <tr key={item.id}>
                      <td>{item.subscription_number}</td>
                      <td>{item.plan_name || "—"}</td>
                      <td>{item.billing_cycle || "—"}</td>
                      <td>{formatDate(item.start_date)}</td>
                      <td>
                        <span className={getStatusClass(item.status)}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="customer-table-message">
                      No subscriptions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="customer-data-section">
          <div className="customer-section-heading">
            <div>
              <h2>My Invoices</h2>
              <p>Track your billing and outstanding balances.</p>
            </div>
            <FileText size={21} />
          </div>

          <div className="customer-data-table-wrapper">
            <table className="customer-data-table">
              <thead>
                <tr>
                  <th>INVOICE</th>
                  <th>INVOICE DATE</th>
                  <th>DUE DATE</th>
                  <th>AMOUNT</th>
                  <th>PAID</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="customer-table-message">
                      Loading invoices...
                    </td>
                  </tr>
                ) : invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>{invoice.invoice_number}</td>
                      <td>{formatDate(invoice.created_at)}</td>
                      <td>{formatDate(invoice.due_date)}</td>
                      <td>{formatCurrency(invoice.total_amount)}</td>
                      <td>{formatCurrency(invoice.amount_paid)}</td>
                      <td>
                        <span className={getStatusClass(invoice.status)}>
                          {invoice.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="customer-table-message">
                      No invoices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="customer-data-section">
          <div className="customer-section-heading">
            <div>
              <h2>Recent Payments</h2>
              <p>Your recorded payment transactions.</p>
            </div>
            <CreditCard size={21} />
          </div>

          <div className="customer-data-table-wrapper">
            <table className="customer-data-table">
              <thead>
                <tr>
                  <th>PAYMENT DATE</th>
                  <th>INVOICE</th>
                  <th>PAYMENT METHOD</th>
                  <th>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="customer-table-message">
                      Loading payments...
                    </td>
                  </tr>
                ) : payments.length > 0 ? (
                  payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{formatDate(payment.payment_date)}</td>
                      <td>{payment.invoice_number || "—"}</td>
                      <td>{payment.payment_method}</td>
                      <td>{formatCurrency(payment.amount)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="customer-table-message">
                      No payments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="customer-dashboard-footer">
          <span>© 2026 SUBSIGHT. All rights reserved.</span>
          <span>
            <CalendarDays size={14} />
            Subscription Management
          </span>
        </footer>
      </main>
    </div>
  );
}

export default CustomerDashboard;
