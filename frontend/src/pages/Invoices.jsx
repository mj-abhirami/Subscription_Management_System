
import { useMemo, useState } from "react";
import {
  Plus, Search, Pencil, Trash2, X, Receipt
} from "lucide-react";
import toast from "react-hot-toast";

const statuses = ["Draft", "Confirmed", "Paid", "Partially Paid", "Overdue", "Cancelled"];

const emptyForm = {
  invoice_number: "",
  customer_name: "",
  billing_period_start: "",
  billing_period_end: "",
  subtotal: "",
  discount_amount: "0",
  tax_amount: "0",
  due_date: "",
  status: "Draft",
  amount_paid: "0",
};

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const money = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));

  const calculateTotal = (item) =>
    Math.max(
      0,
      Number(item.subtotal || 0) -
      Number(item.discount_amount || 0) +
      Number(item.tax_amount || 0)
    );

  const filteredInvoices = useMemo(() => {
    return invoices.filter((item) => {
      const matchesSearch = [
        item.invoice_number,
        item.customer_name,
      ].join(" ").toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  const totalBilled = invoices.reduce(
    (sum, item) => sum + calculateTotal(item), 0
  );

  const totalPaid = invoices.reduce(
    (sum, item) => sum + Number(item.amount_paid || 0), 0
  );

  const totalOutstanding = Math.max(0, totalBilled - totalPaid);

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
      !form.invoice_number.trim() ||
      !form.customer_name.trim() ||
      !form.subtotal ||
      !form.due_date
    ) {
      toast.error("Please complete all required fields.");
      return;
    }

    const subtotal = Number(form.subtotal);
    const discount = Number(form.discount_amount || 0);
    const tax = Number(form.tax_amount || 0);
    const paid = Number(form.amount_paid || 0);
    const total = subtotal - discount + tax;

    if (
      subtotal < 0 ||
      discount < 0 ||
      tax < 0 ||
      paid < 0 ||
      discount > subtotal ||
      paid > total
    ) {
      toast.error("Please check the invoice amounts.");
      return;
    }

    if (
      form.billing_period_start &&
      form.billing_period_end &&
      form.billing_period_end < form.billing_period_start
    ) {
      toast.error("Billing period end cannot be before its start.");
      return;
    }

    const duplicate = invoices.some(
      (item) =>
        item.invoice_number.toLowerCase() ===
          form.invoice_number.trim().toLowerCase() &&
        item.id !== editingId
    );

    if (duplicate) {
      toast.error("Invoice number already exists.");
      return;
    }

    const finalStatus =
      form.status === "Cancelled" || form.status === "Draft"
        ? form.status
        : paid >= total
          ? "Paid"
          : paid > 0
            ? "Partially Paid"
            : form.status === "Overdue"
              ? "Overdue"
              : form.status === "Confirmed"
                ? "Confirmed"
                : "Draft";

    const invoice = {
      ...form,
      id: editingId || Date.now(),
      status: finalStatus,
    };

    if (editingId) {
      setInvoices((prev) =>
        prev.map((item) => item.id === editingId ? invoice : item)
      );
      toast.success("Invoice updated.");
    } else {
      setInvoices((prev) => [...prev, invoice]);
      toast.success("Invoice created.");
    }

    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this invoice?")) return;
    setInvoices((prev) => prev.filter((item) => item.id !== id));
    toast.success("Invoice deleted.");
  };

  return (
    <div className="invoices-page">
      <div className="page-header">
        <div>
          <h1>Invoices</h1>
          <p>Track billing, payments and outstanding balances.</p>
        </div>

        <button className="primary-btn" onClick={openAddForm}>
          <Plus size={17} /> Create Invoice
        </button>
      </div>

      <div className="invoice-stats">
        <div className="invoice-stat">
          <span>Total Invoices</span>
          <strong>{invoices.length}</strong>
        </div>
        <div className="invoice-stat">
          <span>Total Billed</span>
          <strong>{money(totalBilled)}</strong>
        </div>
        <div className="invoice-stat">
          <span>Amount Paid</span>
          <strong>{money(totalPaid)}</strong>
        </div>
        <div className="invoice-stat">
          <span>Outstanding</span>
          <strong>{money(totalOutstanding)}</strong>
        </div>
      </div>

      <div className="invoice-toolbar">
        <div className="invoice-search">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice or customer..."
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className="invoice-table-wrapper">
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Invoice No.</th>
              <th>Customer</th>
              <th>Billing Period</th>
              <th>Total Amount</th>
              <th>Paid</th>
              <th>Balance Due</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredInvoices.map((item) => {
              const total = calculateTotal(item);
              const balance = Math.max(0, total - Number(item.amount_paid || 0));

              return (
                <tr key={item.id}>
                  <td>{item.invoice_number}</td>
                  <td>{item.customer_name}</td>
                  <td>
                    {item.billing_period_start || "—"}
                    <br />
                    <span>to {item.billing_period_end || "—"}</span>
                  </td>
                  <td>{money(total)}</td>
                  <td>{money(item.amount_paid)}</td>
                  <td>{money(balance)}</td>
                  <td>{item.due_date}</td>
                  <td>
                    <span className={`invoice-status invoice-${item.status.toLowerCase().replaceAll(" ", "-")}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="invoice-actions">
                      <button onClick={() => openEditForm(item)} title="Edit">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan="9" className="invoice-empty">
                  <Receipt size={28} />
                  <strong>No invoices found</strong>
                  <span>Create your first invoice to get started.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="invoice-modal-overlay">
          <div className="invoice-modal">
            <div className="invoice-modal-header">
              <div>
                <h2>{editingId ? "Edit Invoice" : "Create Invoice"}</h2>
                <p>Enter billing and payment information.</p>
              </div>
              <button type="button" onClick={() => setShowForm(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="invoice-form-grid">
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
                  Billing Period Start
                  <input
                    type="date"
                    name="billing_period_start"
                    value={form.billing_period_start}
                    onChange={updateField}
                  />
                </label>

                <label>
                  Billing Period End
                  <input
                    type="date"
                    name="billing_period_end"
                    value={form.billing_period_end}
                    onChange={updateField}
                  />
                </label>

                <label>
                  Subtotal (₹) *
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="subtotal"
                    value={form.subtotal}
                    onChange={updateField}
                  />
                </label>

                <label>
                  Discount (₹)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="discount_amount"
                    value={form.discount_amount}
                    onChange={updateField}
                  />
                </label>

                <label>
                  Tax (₹)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="tax_amount"
                    value={form.tax_amount}
                    onChange={updateField}
                  />
                </label>

                <label>
                  Amount Paid (₹)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="amount_paid"
                    value={form.amount_paid}
                    onChange={updateField}
                  />
                </label>

                <label>
                  Due Date *
                  <input
                    type="date"
                    name="due_date"
                    value={form.due_date}
                    onChange={updateField}
                  />
                </label>

                <label>
                  Status
                  <select
                    name="status"
                    value={form.status}
                    onChange={updateField}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="invoice-total-preview">
                <span>Calculated Invoice Total</span>
                <strong>
                  {money(
                    Number(form.subtotal || 0) -
                    Number(form.discount_amount || 0) +
                    Number(form.tax_amount || 0)
                  )}
                </strong>
              </div>

              <div className="invoice-modal-footer">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  {editingId ? "Save Changes" : "Create Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
