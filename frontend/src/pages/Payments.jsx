
import { useMemo, useState } from "react";
import {
  Plus, Search, Pencil, Trash2, X, CreditCard, IndianRupee
} from "lucide-react";
import toast from "react-hot-toast";

const paymentMethods = ["UPI", "Card", "Cash", "Bank Transfer"];

const emptyForm = {
  payment_number: "",
  invoice_number: "",
  customer_name: "",
  amount: "",
  payment_method: "UPI",
  payment_date: "",
  note: "",
};

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const money = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));

  const filteredPayments = useMemo(() => {
    return payments.filter((item) => {
      const matchesSearch = [
        item.payment_number,
        item.invoice_number,
        item.customer_name,
        item.payment_method,
      ].join(" ").toLowerCase().includes(search.toLowerCase());

      const matchesMethod =
        methodFilter === "All" || item.payment_method === methodFilter;

      return matchesSearch && matchesMethod;
    });
  }, [payments, search, methodFilter]);

  const totalCollected = payments.reduce(
    (sum, item) => sum + Number(item.amount || 0), 0
  );

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditingId(item.id);
    setForm({ ...item });
    setShowForm(true);
  };

  const updateField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.payment_number.trim() ||
      !form.invoice_number.trim() ||
      !form.customer_name.trim() ||
      !form.amount ||
      !form.payment_date
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (Number(form.amount) <= 0) {
      toast.error("Payment amount must be greater than zero.");
      return;
    }

    const duplicate = payments.some(
      (item) =>
        item.payment_number.toLowerCase() ===
          form.payment_number.trim().toLowerCase() &&
        item.id !== editingId
    );

    if (duplicate) {
      toast.error("Payment number already exists.");
      return;
    }

    if (editingId) {
      setPayments((prev) =>
        prev.map((item) =>
          item.id === editingId ? { ...form, id: editingId } : item
        )
      );
      toast.success("Payment updated.");
    } else {
      setPayments((prev) => [
        ...prev,
        { ...form, id: Date.now() },
      ]);
      toast.success("Payment recorded successfully.");
    }

    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this payment record?")) return;
    setPayments((prev) => prev.filter((item) => item.id !== id));
    toast.success("Payment deleted.");
  };

  const methodTotals = paymentMethods.map((method) => ({
    method,
    amount: payments
      .filter((item) => item.payment_method === method)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0),
  }));

  return (
    <div className="payments-page">
      <div className="page-header">
        <div>
          <h1>Payments</h1>
          <p>Record and track customer payments.</p>
        </div>

        <button className="primary-btn" onClick={openAddForm}>
          <Plus size={17} /> Record Payment
        </button>
      </div>

      <div className="payment-stats">
        <div className="payment-stat">
          <span>Total Payments</span>
          <strong>{payments.length}</strong>
        </div>
        <div className="payment-stat">
          <span>Total Collected</span>
          <strong>{money(totalCollected)}</strong>
        </div>
        <div className="payment-stat">
          <span>UPI Payments</span>
          <strong>
            {money(methodTotals.find((m) => m.method === "UPI")?.amount)}
          </strong>
        </div>
        <div className="payment-stat">
          <span>Bank Transfers</span>
          <strong>
            {money(methodTotals.find((m) => m.method === "Bank Transfer")?.amount)}
          </strong>
        </div>
      </div>

      <div className="payment-method-cards">
        {methodTotals.map((item) => (
          <div className="payment-method-card" key={item.method}>
            <span>{item.method}</span>
            <strong>{money(item.amount)}</strong>
          </div>
        ))}
      </div>

      <div className="payment-toolbar">
        <div className="payment-search">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payments..."
          />
        </div>

        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
        >
          <option value="All">All payment methods</option>
          {paymentMethods.map((method) => (
            <option key={method} value={method}>{method}</option>
          ))}
        </select>
      </div>

      <div className="payment-table-wrapper">
        <table className="payment-table">
          <thead>
            <tr>
              <th>Payment No.</th>
              <th>Invoice No.</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Payment Date</th>
              <th>Note</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredPayments.map((item) => (
              <tr key={item.id}>
                <td>{item.payment_number}</td>
                <td>{item.invoice_number}</td>
                <td>{item.customer_name}</td>
                <td>{money(item.amount)}</td>
                <td>
                  <span className="payment-method-badge">
                    {item.payment_method}
                  </span>
                </td>
                <td>{item.payment_date}</td>
                <td>{item.note || "—"}</td>
                <td>
                  <div className="payment-actions">
                    <button onClick={() => openEditForm(item)} title="Edit">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredPayments.length === 0 && (
              <tr>
                <td colSpan="8" className="payment-empty">
                  <CreditCard size={28} />
                  <strong>No payments found</strong>
                  <span>Record your first customer payment.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            <div className="payment-modal-header">
              <div>
                <h2>{editingId ? "Edit Payment" : "Record Payment"}</h2>
                <p>Enter the payment transaction details.</p>
              </div>
              <button type="button" onClick={() => setShowForm(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="payment-form-grid">
                <label>
                  Payment Number *
                  <input
                    name="payment_number"
                    value={form.payment_number}
                    onChange={updateField}
                    placeholder="PAY-1001"
                  />
                </label>

                <label>
                  Invoice Number *
                  <input
                    name="invoice_number"
                    value={form.invoice_number}
                    onChange={updateField}
                    placeholder="INV-1001"
                  />
                </label>

                <label>
                  Customer Name *
                  <input
                    name="customer_name"
                    value={form.customer_name}
                    onChange={updateField}
                    placeholder="Customer name"
                  />
                </label>

                <label>
                  Amount (₹) *
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    name="amount"
                    value={form.amount}
                    onChange={updateField}
                    placeholder="0.00"
                  />
                </label>

                <label>
                  Payment Method *
                  <select
                    name="payment_method"
                    value={form.payment_method}
                    onChange={updateField}
                  >
                    {paymentMethods.map((method) => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Payment Date *
                  <input
                    type="date"
                    name="payment_date"
                    value={form.payment_date}
                    onChange={updateField}
                  />
                </label>

                <label className="payment-note-field">
                  Note
                  <textarea
                    name="note"
                    value={form.note}
                    onChange={updateField}
                    placeholder="Optional payment reference or note"
                    rows="3"
                  />
                </label>
              </div>

              <div className="payment-modal-footer">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  {editingId ? "Save Changes" : "Save Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
