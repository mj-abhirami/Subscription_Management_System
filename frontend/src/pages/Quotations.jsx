
import { useMemo, useState } from "react";
import {
  Plus, Search, Pencil, Trash2, X, FileText
} from "lucide-react";
import toast from "react-hot-toast";

const statuses = [
  "Draft",
  "Sent",
  "Accepted",
  "Rejected",
  "Expired",
  "Converted",
];

const emptyForm = {
  quotation_number: "",
  customer_name: "",
  plan_name: "",
  quantity: 1,
  unit_price: "",
  valid_until: "",
  status: "Draft",
};

export default function Quotations() {
  const [quotations, setQuotations] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filteredQuotations = useMemo(() => {
    return quotations.filter((item) => {
      const matchesSearch = [
        item.quotation_number,
        item.customer_name,
        item.plan_name,
      ].join(" ").toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [quotations, search, statusFilter]);

  const money = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));

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
      !form.quotation_number.trim() ||
      !form.customer_name.trim() ||
      !form.plan_name.trim() ||
      !form.unit_price ||
      !form.valid_until
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (Number(form.unit_price) < 0 || Number(form.quantity) < 1) {
      toast.error("Enter a valid quantity and price.");
      return;
    }

    const duplicate = quotations.some(
      (item) =>
        item.quotation_number.toLowerCase() ===
          form.quotation_number.trim().toLowerCase() &&
        item.id !== editingId
    );

    if (duplicate) {
      toast.error("Quotation number already exists.");
      return;
    }

    if (editingId) {
      setQuotations((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? { ...form, id: editingId }
            : item
        )
      );
      toast.success("Quotation updated successfully.");
    } else {
      setQuotations((prev) => [
        ...prev,
        { ...form, id: Date.now() },
      ]);
      toast.success("Quotation created successfully.");
    }

    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this quotation?")) return;

    setQuotations((prev) => prev.filter((item) => item.id !== id));
    toast.success("Quotation deleted.");
  };

  const total = quotations.length;
  const accepted = quotations.filter(
    (q) => q.status === "Accepted"
  ).length;
  const sent = quotations.filter(
    (q) => q.status === "Sent"
  ).length;
  const converted = quotations.filter(
    (q) => q.status === "Converted"
  ).length;

  return (
    <div className="quotations-page">
      <div className="page-header">
        <div>
          <h1>Quotations</h1>
          <p>Create and manage customer quotations.</p>
        </div>

        <button className="primary-btn" onClick={openAddForm}>
          <Plus size={17} /> New Quotation
        </button>
      </div>

      <div className="quotation-stats">
        <div className="quotation-stat">
          <span>Total Quotations</span>
          <strong>{total}</strong>
        </div>
        <div className="quotation-stat">
          <span>Sent</span>
          <strong>{sent}</strong>
        </div>
        <div className="quotation-stat">
          <span>Accepted</span>
          <strong>{accepted}</strong>
        </div>
        <div className="quotation-stat">
          <span>Converted</span>
          <strong>{converted}</strong>
        </div>
      </div>

      <div className="quotation-toolbar">
        <div className="quotation-search">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quotations..."
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="quotation-table-wrapper">
        <table className="quotation-table">
          <thead>
            <tr>
              <th>Quotation No.</th>
              <th>Customer</th>
              <th>Plan</th>
              <th>Quantity</th>
              <th>Total Amount</th>
              <th>Valid Until</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredQuotations.map((item) => (
              <tr key={item.id}>
                <td>{item.quotation_number}</td>
                <td>{item.customer_name}</td>
                <td>{item.plan_name}</td>
                <td>{item.quantity}</td>
                <td>
                  {money(
                    Number(item.quantity) * Number(item.unit_price)
                  )}
                </td>
                <td>{item.valid_until}</td>
                <td>
                  <span
                    className={`quotation-status quotation-${item.status.toLowerCase()}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td>
                  <div className="quotation-actions">
                    <button
                      onClick={() => openEditForm(item)}
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredQuotations.length === 0 && (
              <tr>
                <td colSpan="8" className="quotation-empty">
                  <FileText size={28} />
                  <strong>No quotations found</strong>
                  <span>Create your first quotation to get started.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="quotation-modal-overlay">
          <div className="quotation-modal">
            <div className="quotation-modal-header">
              <div>
                <h2>
                  {editingId ? "Edit Quotation" : "Create Quotation"}
                </h2>
                <p>Enter the quotation details below.</p>
              </div>

              <button onClick={() => setShowForm(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="quotation-form-grid">
                <label>
                  Quotation Number *
                  <input
                    name="quotation_number"
                    value={form.quotation_number}
                    onChange={updateField}
                    placeholder="QUO-1001"
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
                  Plan Name *
                  <input
                    name="plan_name"
                    value={form.plan_name}
                    onChange={updateField}
                    placeholder="Plan name"
                  />
                </label>

                <label>
                  Unit Price (₹) *
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="unit_price"
                    value={form.unit_price}
                    onChange={updateField}
                    placeholder="0.00"
                  />
                </label>

                <label>
                  Quantity *
                  <input
                    type="number"
                    min="1"
                    name="quantity"
                    value={form.quantity}
                    onChange={updateField}
                  />
                </label>

                <label>
                  Valid Until *
                  <input
                    type="date"
                    name="valid_until"
                    value={form.valid_until}
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
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="quotation-modal-footer">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-btn">
                  {editingId ? "Save Changes" : "Create Quotation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
