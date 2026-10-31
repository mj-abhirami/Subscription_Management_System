
import { useEffect, useState } from "react";
import {
  Search, Plus, Package, Pencil, Trash2, X,
  Layers, IndianRupee, RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

function Products() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    product_type: "Service",
    sales_price: "",
    cost_price: "",
    notes: "",
    variants: [],
  });

  const [variantData, setVariantData] = useState({
    variant_name: "",
    additional_price: "",
  });

  // Load products from PostgreSQL through the API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/products");

      if (response.data.success) {
        setProducts(response.data.data || []);
      } else {
        toast.error(response.data.message || "Unable to load products");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.product_type || ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (
      (name === "sales_price" || name === "cost_price") &&
      value !== "" && Number(value) < 0
    ) return;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleVariantChange = (e) => {
    const { name, value } = e.target;

    if (name === "additional_price" && value !== "" && Number(value) < 0) {
      return;
    }

    setVariantData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const addVariant = () => {
    if (!variantData.variant_name.trim()) {
      toast.error("Please enter a variant name.");
      return;
    }

    if (
      variantData.additional_price === "" ||
      !Number.isFinite(Number(variantData.additional_price)) ||
      Number(variantData.additional_price) < 0
    ) {
      toast.error("Please enter a valid additional price.");
      return;
    }

    setFormData((previous) => ({
      ...previous,
      variants: [
        ...previous.variants,
        {
          id: Date.now(),
          variant_name: variantData.variant_name.trim(),
          additional_price: Number(variantData.additional_price),
        },
      ],
    }));

    setVariantData({ variant_name: "", additional_price: "" });
  };

  const removeVariant = (id) => {
    setFormData((previous) => ({
      ...previous,
      variants: previous.variants.filter((variant) => variant.id !== id),
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      product_type: "Service",
      sales_price: "",
      cost_price: "",
      notes: "",
      variants: [],
    });

    setVariantData({ variant_name: "", additional_price: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.name.trim().length < 2) {
      toast.error("Product name must contain at least 2 characters.");
      return;
    }

    if (
      formData.sales_price === "" ||
      !Number.isFinite(Number(formData.sales_price)) ||
      Number(formData.sales_price) <= 0
    ) {
      toast.error("Enter a valid sales price greater than zero.");
      return;
    }

    if (
      formData.cost_price === "" ||
      !Number.isFinite(Number(formData.cost_price)) ||
      Number(formData.cost_price) < 0
    ) {
      toast.error("Enter a valid cost price.");
      return;
    }

    const cleanedData = {
      name: formData.name.trim(),
      product_type: formData.product_type,
      sales_price: Number(formData.sales_price),
      cost_price: Number(formData.cost_price),
      notes: formData.notes.trim(),
    };

    try {
      setSaving(true);

      if (editingId) {
        // Backend update endpoint currently supports product fields,
        // but does not update product variants.
        const response = await api.put(
          `/products/${editingId}`,
          cleanedData
        );

        if (!response.data.success) {
          throw new Error(response.data.message || "Update failed");
        }

        toast.success("Product updated successfully.");
      } else {
        const response = await api.post("/products", {
          ...cleanedData,
          variants: formData.variants.map((variant) => ({
            variant_name: variant.variant_name,
            additional_price: Number(variant.additional_price),
          })),
        });

        if (!response.data.success) {
          throw new Error(response.data.message || "Creation failed");
        }

        toast.success("Product added successfully.");
      }

      resetForm();
      await fetchProducts();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name || "",
      product_type: product.product_type || "Service",
      sales_price: String(product.sales_price ?? ""),
      cost_price: String(product.cost_price ?? 0),
      notes: product.notes || "",
      variants: product.variants || [],
    });

    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await api.delete(`/products/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Delete failed");
      }

      toast.success("Product deleted successfully.");
      await fetchProducts();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Unable to delete product."
      );
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);

  return (
    <div className="products-page">
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">PRODUCT MANAGEMENT</span>
          <h1>Products</h1>
          <p>Manage your products, pricing and available variants.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(true)}
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="product-summary-grid">
        <div className="product-summary-card">
          <div className="product-summary-icon"><Package size={22} /></div>
          <div>
            <span>Total Products</span>
            <h2>{products.length}</h2>
          </div>
        </div>

        <div className="product-summary-card">
          <div className="product-summary-icon"><Layers size={22} /></div>
          <div>
            <span>Total Variants</span>
            <h2>
              {products.reduce(
                (total, product) =>
                  total + (product.variants?.length || 0),
                0
              )}
            </h2>
          </div>
        </div>

        <div className="product-summary-card">
          <div className="product-summary-icon">
            <IndianRupee size={22} />
          </div>
          <div>
            <span>Average Sales Price</span>
            <h2>
              {products.length
                ? formatCurrency(
                    products.reduce(
                      (total, product) =>
                        total + Number(product.sales_price || 0),
                      0
                    ) / products.length
                  )
                : "₹0"}
            </h2>
          </div>
        </div>
      </div>

      <div className="product-content">
        <div className="customer-toolbar">
          <div>
            <h3>All Products</h3>
            <p>View and manage your product catalogue.</p>
          </div>

          <div className="customer-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="customer-table-wrapper">
          <table className="customer-table">
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>TYPE</th>
                <th>SALES PRICE</th>
                <th>COST PRICE</th>
                <th>VARIANTS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">
                    <div className="customer-empty-state">
                      <RefreshCw size={24} />
                      <p>Loading products...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-name-cell">
                        <div className="product-avatar">
                          <Package size={17} />
                        </div>
                        <strong>{product.name}</strong>
                      </div>
                    </td>

                    <td>
                      <span className="product-type-badge">
                        {product.product_type}
                      </span>
                    </td>

                    <td className="product-price">
                      {formatCurrency(product.sales_price)}
                    </td>

                    <td>{formatCurrency(product.cost_price)}</td>

                    <td>{product.variants?.length || 0}</td>

                    <td>
                      <div className="table-actions">
                        <button
                          className="icon-action edit-action"
                          title="Edit product"
                          onClick={() => handleEdit(product)}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="icon-action delete-action"
                          title="Delete product"
                          onClick={() => handleDelete(product.id)}
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
                      <div className="empty-icon"><Package size={27} /></div>
                      <h3>
                        {searchTerm ? "No products found" : "No products yet"}
                      </h3>
                      <p>
                        {searchTerm
                          ? "Try another product name or type."
                          : "Add your first product to get started."}
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
                <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>
                <p>Enter product information and pricing details.</p>
              </div>

              <button className="modal-close" onClick={resetForm}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Odoo"
                  minLength={2}
                  required
                />
              </div>

              <div className="form-group">
                <label>Product Type *</label>
                <select
                  name="product_type"
                  value={formData.product_type}
                  onChange={handleChange}
                  required
                >
                  <option value="Service">Service</option>
                  <option value="Goods">Goods</option>
                </select>
              </div>

              <div className="product-price-grid">
                <div className="form-group">
                  <label>Sales Price (₹) *</label>
                  <input
                    type="number"
                    name="sales_price"
                    value={formData.sales_price}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Cost Price (₹) *</label>
                  <input
                    type="number"
                    name="cost_price"
                    value={formData.cost_price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="variant-section">
                <div className="variant-heading">
                  <div>
                    <h3>Product Variants</h3>
                    <p>
                      {editingId
                        ? "Existing variants are displayed but cannot be modified through the current update API."
                        : "Optional additional product options."}
                    </p>
                  </div>
                  <span>{formData.variants.length} added</span>
                </div>

                {!editingId && (
                  <>
                    <div className="variant-input-grid">
                      <div className="form-group">
                        <label>Variant Name</label>
                        <input
                          name="variant_name"
                          value={variantData.variant_name}
                          onChange={handleVariantChange}
                          placeholder="e.g. Premium"
                        />
                      </div>

                      <div className="form-group">
                        <label>Additional Price (₹)</label>
                        <input
                          type="number"
                          name="additional_price"
                          value={variantData.additional_price}
                          onChange={handleVariantChange}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      className="add-variant-button"
                      onClick={addVariant}
                    >
                      <Plus size={15} />
                      Add Variant
                    </button>
                  </>
                )}

                {formData.variants.map((variant) => (
                  <div className="variant-row" key={variant.id}>
                    <div>
                      <strong>{variant.variant_name}</strong>
                      <span>
                        +{formatCurrency(variant.additional_price)}
                      </span>
                    </div>

                    {!editingId && (
                      <button
                        type="button"
                        onClick={() => removeVariant(variant.id)}
                        className="variant-remove"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label>Product Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Additional product information..."
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
