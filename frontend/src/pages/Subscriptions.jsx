import { useMemo, useState } from "react";
import {
  Plus, Search, Pencil, Trash2, X, RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";

const initialSubscriptions = [];

const statuses = [
  "Draft",
  "Quotation",
  "Confirmed",
  "Active",
  "Paused",
  "Closed",
];

const emptyForm = {
  subscription_number: "",
  customer_name: "",
  plan_name: "",
  start_date: "",
  expiry_date: "",
  quantity: 1,
  unit_price: "",
  status: "Draft",
};

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((item) => {
      const matchesSearch = [
        item.subscription_number,
        item.customer_name,
        item.plan_name,
      ].join(" ").toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [subscriptions, search, statusFilter]);

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.subscription_number.trim() ||
      !form.customer_name.trim() ||
      !form.plan_name.trim() ||
      !form.start_date ||
      !form.expiry_date ||
      !form.unit_price
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (Number(form.unit_price) < 0 || Number(form.quantity) < 1) {
      toast.error("Enter valid quantity and price.");
      return;
    }

    if (form.expiry_date < form.start_date) {
      toast.error("Expiry date cannot be before start date.");
      return;
    }

    if (editingId) {
      setSubscriptions((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? { ...form, id: editingId }
            : item
        )
      );
      toast.success("Subscription updated.");
    } else {
      setSubscriptions((prev) => [
        ...prev,
        { ...form, id: Date.now() },
      ]);
      toast.success("Subscription created.");
    }

    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this subscription?")) return;

    setSubscriptions((prev) => prev.filter((item) => item.id !== id));
    toast.success("Subscription deleted.");
  };

  const updateField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const total = subscriptions.length;
  const active = subscriptions.filter((s) => s.status === "Active").length;
  const paused = subscriptions.filter((s) => s.status === "Paused").length;
  const closed = subscriptions.filter((s) => s.status === "Closed").length;

  const money = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));

  return (
    <div className="subscriptions-page">
      <div className="page-header">
        <div>
          <h1>Subscriptions</h1>
          <p>Manage customer subscriptions and their lifecycle.</p>
        </div>

        <button className="primary-btn" onClick={openAddForm}>
          <Plus size={17} /> New Subscription
        </button>
      </div>

      <div className="subscription-stats">
        <div className="subscription-stat">
          <span>Total Subscriptions</span>
          <strong>{total}</strong>
        </div>
        <div className="subscription-stat">
          <span>Active</span>
          <strong>{active}</strong>
        </div>
        <div className="subscription-stat">
          <span>Paused</span>
          <strong>{paused}</strong>
        </div>
        <div className="subscription-stat">
          <span>Closed</span>
          <strong>{closed}</strong>
        </div>
      </div>

      <div className="subscription-toolbar">
        <div className="subscription-search">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subscriptions..."
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

      <div className="subscription-table-wrapper">
        <table className="subscription-table">
          <thead>
            <tr>
              <th>Subscription</th>
              <th>Customer</th>
              <th>Plan</th>
              <th>Start Date</th>
              <th>Expiry Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredSubscriptions.map((item) => (
              <tr key={item.id}>
                <td>{item.subscription_number}</td>
                <td>{item.customer_name}</td>
                <td>{item.plan_name}</td>
                <td>{item.start_date}</td>
                <td>{item.expiry_date}</td>
                <td>{money(Number(item.unit_price) * Number(item.quantity))}</td>
                <td>
                  <span className={`subscription-status status-${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <div className="subscription-actions">
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

            {filteredSubscriptions.length === 0 && (
              <tr>
                <td colSpan="8" className="subscription-empty">
                  <RefreshCw size={25} />
                  <strong>No subscriptions found</strong>
                  <span>Create a subscription to get started.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="subscription-modal-overlay">
          <div className="subscription-modal">
            <div className="subscription-modal-header">
              <div>
                <h2>{editingId ? "Edit Subscription" : "New Subscription"}</h2>
                <p>Enter the subscription details below.</p>
              </div>
              <button onClick={() => setShowForm(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="subscription-form-grid">
                <label>
                  Subscription Number *
                  <input
                    name="subscription_number"
                    value={form.subscription_number}
                    onChange={updateField}
                    placeholder="SUB-1001"
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

                <label>
                  Start Date *
                  <input
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={updateField}
                  />
                </label>

                <label>
                  Expiry Date *
                  <input
                    type="date"
                    name="expiry_date"
                    value={form.expiry_date}
                    onChange={updateField}
                  />
                </label>
              </div>

              <div className="subscription-modal-footer">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  {editingId ? "Save Changes" : "Create Subscription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}