import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  CalendarDays,
  Clock,
  PauseCircle,
  RefreshCw
} from "lucide-react";

function Plans() {
  const [plans, setPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    product_id: "",
    price: "",
    billing_cycle: "Monthly",
    min_quantity: "1",
    start_date: "",
    end_date: "",
    allow_pause: false,
    allow_early_close: false,
    auto_close: false,
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [planResponse, productResponse] = await Promise.all([
        api.get("/plans"),
        api.get("/products")
      ]);

      setPlans(planResponse.data.data || []);
      setProducts(productResponse.data.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to load plans and products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPlans = plans.filter((plan) =>
    `${plan.name} ${plan.billing_cycle}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      product_id: "",
      price: "",
      billing_cycle: "Monthly",
      min_quantity: "1",
      start_date: "",
      end_date: "",
      allow_pause: false,
      allow_early_close: false,
      auto_close: false,
    });

    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.name.trim().length < 2) {
      toast.error("Plan name must contain at least 2 characters.");
      return;
    }

    if (!formData.product_id || Number(formData.price) <= 0) {
      toast.error("Select a product and enter a valid price.");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      product_id: Number(formData.product_id),
      price: Number(formData.price),
      billing_cycle: formData.billing_cycle,
      min_quantity: Number(formData.min_quantity),
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      allow_pause: formData.allow_pause,
      allow_early_close: formData.allow_early_close,
      auto_close: formData.auto_close
    };

    try {
      setSaving(true);

      if (editingId) {
        await api.put(`/plans/${editingId}`, payload);
        toast.success("Plan updated successfully!");
      } else {
        await api.post("/plans", payload);
        toast.success("Plan created successfully!");
      }

      resetForm();
      await fetchData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to save plan."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (plan) => {
    setFormData({
      name: plan.name,
      product_id: String(plan.product_id),
      price: String(plan.price),
      billing_cycle: plan.billing_cycle,
      min_quantity: String(plan.min_quantity),
      start_date: plan.start_date,
      end_date: plan.end_date,
      allow_pause: plan.allow_pause,
      allow_early_close: plan.allow_early_close,
      auto_close: plan.auto_close,
    });

    setEditingId(plan.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      setPlans((previous) =>
        previous.filter((plan) => plan.id !== id)
      );
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <div className="plans-page">

      <div className="page-heading">
        <div>
          <span className="page-eyebrow">SUBSCRIPTION CONFIGURATION</span>
          <h1>Plans</h1>
          <p>Create and manage subscription plans and billing cycles.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(true)}
        >
          <Plus size={18} />
          Create Plan
        </button>
      </div>

      <div className="plan-summary-grid">
        <div className="plan-summary-card">
          <div className="product-summary-icon">
            <CalendarDays size={22} />
          </div>
          <div>
            <span>Total Plans</span>
            <h2>{plans.length}</h2>
          </div>
        </div>

        <div className="plan-summary-card">
          <div className="product-summary-icon">
            <Clock size={22} />
          </div>
          <div>
            <span>Monthly Plans</span>
            <h2>
              {plans.filter((plan) => plan.billing_cycle === "Monthly").length}
            </h2>
          </div>
        </div>

        <div className="plan-summary-card">
          <div className="product-summary-icon">
            <PauseCircle size={22} />
          </div>
          <div>
            <span>Pause Enabled</span>
            <h2>{plans.filter((plan) => plan.allow_pause).length}</h2>
          </div>
        </div>
      </div>

      <div className="product-content">
        <div className="customer-toolbar">
          <div>
            <h3>All Plans</h3>
            <p>View and manage your subscription plans.</p>
          </div>

          <div className="customer-search">
            <Search size={17} />
            <input
              placeholder="Search plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="customer-table-wrapper">
          <table className="customer-table">
            <thead>
              <tr>
                <th>PLAN</th>
                <th>PRODUCT</th>
                <th>PRICE</th>
                <th>BILLING CYCLE</th>
                <th>MIN. QTY</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">
                    <div className="customer-empty-state">
                      <RefreshCw size={24} />
                      <p>Loading plans...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredPlans.length > 0 ? (
                filteredPlans.map((plan) => (
                  <tr key={plan.id}>
                    <td><strong>{plan.name}</strong></td>
                    <td>{plan.product_name}</td>
                    <td className="product-price">{formatCurrency(plan.price)}</td>
                    <td>
                      <span className="product-type-badge">
                        {plan.billing_cycle}
                      </span>
                    </td>
                    <td>{plan.min_quantity}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="icon-action edit-action"
                          onClick={() => handleEdit(plan)}
                          title="Edit plan"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-action delete-action"
                          onClick={() => handleDelete(plan.id)}
                          title="Delete plan"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    <div className="customer-empty-state">
                      <div className="empty-icon">
                        <CalendarDays size={27} />
                      </div>
                      <h3>{searchTerm ? "No plans found" : "No plans yet"}</h3>
                      <p>
                        {searchTerm
                          ? "Try another search."
                          : "Create your first subscription plan to get started."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div
            className="customer-modal product-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>{editingId ? "Edit Plan" : "Create New Plan"}</h2>
                <p>Configure your subscription plan details.</p>
              </div>
              <button className="modal-close" onClick={resetForm}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Plan Name *</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Professional Monthly"
                  minLength={2}
                  required
                />
              </div>

              <div className="form-group">
                <label>Select Product *</label>
                <select
                  name="product_id"
                  value={formData.product_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                {products.length === 0 && (
                  <p className="plan-help-text">
                    Add a product in Products Management before creating a plan.
                  </p>
                )}
              </div>

              <div className="product-price-grid">
                <div className="form-group">
                  <label>Plan Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Billing Cycle *</label>
                  <select
                    name="billing_cycle"
                    value={formData.billing_cycle}
                    onChange={handleChange}
                    required
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Minimum Quantity *</label>
                <input
                  type="number"
                  name="min_quantity"
                  value={formData.min_quantity}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  required
                />
              </div>

              <div className="product-price-grid">
                <div className="form-group">
                  <label>Available From</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Available Until</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    min={formData.start_date || undefined}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="plan-options">
                <h3>Plan Configuration</h3>

                <label className="plan-toggle">
                  <input
                    type="checkbox"
                    name="allow_pause"
                    checked={formData.allow_pause}
                    onChange={handleChange}
                  />
                  <span>
                    <strong>Allow Pause</strong>
                    <small>Customers can temporarily pause subscriptions.</small>
                  </span>
                </label>

                <label className="plan-toggle">
                  <input
                    type="checkbox"
                    name="allow_early_close"
                    checked={formData.allow_early_close}
                    onChange={handleChange}
                  />
                  <span>
                    <strong>Allow Early Closure</strong>
                    <small>Subscriptions can be closed before expiry.</small>
                  </span>
                </label>

                <label className="plan-toggle">
                  <input
                    type="checkbox"
                    name="auto_close"
                    checked={formData.auto_close}
                    onChange={handleChange}
                  />
                  <span>
                    <strong>Automatic Closure</strong>
                    <small>Close the subscription when its validity ends.</small>
                  </span>
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  {editingId ? "Save Changes" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Plans;
