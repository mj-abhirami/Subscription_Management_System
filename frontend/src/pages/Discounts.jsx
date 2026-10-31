
import { useMemo, useState } from "react";
import {
  Plus, Search, Pencil, Trash2, X, Tag, ToggleLeft, ToggleRight
} from "lucide-react";
import toast from "react-hot-toast";

const emptyForm = {
  name: "",
  discount_type: "Percentage",
  discount_value: "",
  minimum_quantity: 1,
  start_date: "",
  end_date: "",
  usage_limit: "",
  is_active: true,
};

export default function Discounts() {
  const [discounts, setDiscounts] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filteredDiscounts = useMemo(() => {
    return discounts.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && item.is_active) ||
        (statusFilter === "Inactive" && !item.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [discounts, search, statusFilter]);

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
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.discount_value ||
      !form.start_date ||
      !form.end_date
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const value = Number(form.discount_value);
    const quantity = Number(form.minimum_quantity);

    if (value <= 0 || quantity < 1) {
      toast.error("Enter a valid discount value and quantity.");
      return;
    }

    if (form.discount_type === "Percentage" && value > 100) {
      toast.error("Percentage discount cannot exceed 100%.");
      return;
    }

    if (form.end_date < form.start_date) {
      toast.error("End date cannot be before start date.");
      return;
    }

    if (form.usage_limit && Number(form.usage_limit) < 1) {
      toast.error("Usage limit must be at least 1.");
      return;
    }

    const duplicate = discounts.some(
      (item) =>
        item.name.toLowerCase() === form.name.trim().toLowerCase() &&
        item.id !== editingId
    );

    if (duplicate) {
      toast.error("A discount with this name already exists.");
      return;
    }

    const discount = {
      ...form,
      name: form.name.trim(),
      discount_value: value,
      minimum_quantity: quantity,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : "",
      used_count: editingId
        ? discounts.find((d) => d.id === editingId)?.used_count || 0
        : 0,
      id: editingId || Date.now(),
    };

    if (editingId) {
      setDiscounts((prev) =>
        prev.map((item) => item.id === editingId ? discount : item)
      );
      toast.success("Discount updated.");
    } else {
      setDiscounts((prev) => [...prev, discount]);
      toast.success("Discount created.");
    }

    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this discount?")) return;
    setDiscounts((prev) => prev.filter((item) => item.id !== id));
    toast.success("Discount deleted.");
  };

  const toggleStatus = (item) => {
    setDiscounts((prev) =>
      prev.map((discount) =>
        discount.id === item.id
          ? { ...discount, is_active: !discount.is_active }
          : discount
      )
    );
    toast.success(item.is_active ? "Discount deactivated." : "Discount activated.");
  };

  const activeCount = discounts.filter((d) => d.is_active).length;
  const inactiveCount = discounts.length - activeCount;

  return (
    <div className="discounts-page">
      <div className="page-header">
        <div>
          <h1>Discounts</h1>
          <p>Create promotional offers and manage discount rules.</p>
        </div>

        <button className="primary-btn" onClick={openAddForm}>
          <Plus size={17} /> Create Discount
        </button>
      </div>

      <div className="discount-stats">
        <div className="discount-stat">
          <span>Total Discounts</span>
          <strong>{discounts.length}</strong>
        </div>
        <div className="discount-stat">
          <span>Active Offers</span>
          <strong>{activeCount}</strong>
        </div>
        <div className="discount-stat">
          <span>Inactive Offers</span>
          <strong>{inactiveCount}</strong>
        </div>
      </div>

      <div className="discount-toolbar">
        <div className="discount-search">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search discounts..."
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All discounts</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="discount-table-wrapper">
        <table className="discount-table">
          <thead>
            <tr>
              <th>Discount Name</th>
              <th>Type</th>
              <th>Value</th>
              <th>Min. Quantity</th>
              <th>Validity</th>
              <th>Usage</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredDiscounts.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.discount_type}</td>
                <td>
                  {item.discount_type === "Percentage"
                    ? `${item.discount_value}%`
                    : `₹${Number(item.discount_value).toLocaleString("en-IN")}`}
                </td>
                <td>{item.minimum_quantity}</td>
                <td>
                  {item.start_date}
                  <br />
                  <span>to {item.end_date}</span>
                </td>
                <td>
                  {item.used_count} / {item.usage_limit || "Unlimited"}
                </td>
                <td>
                  <span className={`discount-status ${item.is_active ? "discount-active" : "discount-inactive"}`}>
                    {item.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <div className="discount-actions">
                    <button
                      onClick={() => toggleStatus(item)}
                      title={item.is_active ? "Deactivate" : "Activate"}
                    >
                      {item.is_active
                        ? <ToggleRight size={19} />
                        : <ToggleLeft size={19} />}
                    </button>
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

            {filteredDiscounts.length === 0 && (
              <tr>
                <td colSpan="8" className="discount-empty">
                  <Tag size={28} />
                  <strong>No discounts found</strong>
                  <span>Create your first discount offer.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="discount-modal-overlay">
          <div className="discount-modal">
            <div className="discount-modal-header">
              <div>
                <h2>{editingId ? "Edit Discount" : "Create Discount"}</h2>
                <p>Configure your promotional offer.</p>
              </div>
              <button type="button" onClick={() => setShowForm(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="discount-form-grid">
                <label className="discount-full-field">
                  Discount Name *
                  <input
                    name="name"
                    value={form.name}
                    onChange={updateField}
                    placeholder="e.g. Summer Special"
                  />
                </label>

                <label>
                  Discount Type *
                  <select
                    name="discount_type"
                    value={form.discount_type}
                    onChange={updateField}
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed">Fixed Amount (₹)</option>
                  </select>
                </label>

                <label>
                  Discount Value *
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    name="discount_value"
                    value={form.discount_value}
                    onChange={updateField}
                    placeholder="Enter value"
                  />
                </label>

                <label>
                  Minimum Quantity *
                  <input
                    type="number"
                    min="1"
                    name="minimum_quantity"
                    value={form.minimum_quantity}
                    onChange={updateField}
                  />
                </label>

                <label>
                  Usage Limit
                  <input
                    type="number"
                    min="1"
                    name="usage_limit"
                    value={form.usage_limit}
                    onChange={updateField}
                    placeholder="Leave blank for unlimited"
                  />
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
                  End Date *
                  <input
                    type="date"
                    name="end_date"
                    value={form.end_date}
                    onChange={updateField}
                  />
                </label>

                <label className="discount-checkbox-field">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={updateField}
                  />
                  Discount is active
                </label>
              </div>

              <div className="discount-modal-footer">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  {editingId ? "Save Changes" : "Create Discount"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
