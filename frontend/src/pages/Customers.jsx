
import { useState } from "react";
import {
    Search,
    Plus,
    Users,
    Pencil,
    Trash2,
    X,
    Mail,
    Phone,
    MapPin,
} from "lucide-react";

function Customers() {
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
    });

    const filteredCustomers = customers.filter((customer) =>
        `${customer.name} ${customer.email}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "phone") {
            const numbersOnly = value.replace(/\D/g, "").slice(0, 10);

            setFormData((previous) => ({
                ...previous,
                phone: numbersOnly,
            }));

            return;
        }

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formData.name.trim().length < 2) {
            alert("Please enter a valid customer name.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            alert("Please enter a valid email address.");
            return;
        }

        if (!/^[0-9]{10}$/.test(formData.phone)) {
            alert("Phone number must contain exactly 10 digits.");
            return;
        }

        if (formData.address.trim().length < 5) {
            alert("Please enter a valid address.");
            return;
        }

        const cleanedData = {
            ...formData,
            name: formData.name.trim(),
            email: formData.email.trim(),
            address: formData.address.trim(),
        };

        if (editingId) {
            setCustomers((previous) =>
                previous.map((customer) =>
                    customer.id === editingId
                        ? { ...cleanedData, id: editingId }
                        : customer
                )
            );
        } else {
            setCustomers((previous) => [
                ...previous,
                { ...cleanedData, id: Date.now() },
            ]);
        }

        closeForm();
    };

    const handleEdit = (customer) => {
        setFormData({
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
        });

        setEditingId(customer.id);
        setShowForm(true);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this customer?")) {
            setCustomers((previous) =>
                previous.filter((customer) => customer.id !== id)
            );
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            name: "",
            email: "",
            phone: "",
            address: "",
        });
    };

    return (
        <div className="customers-page">

            <div className="page-heading">
                <div>
                    <span className="page-eyebrow">CUSTOMER MANAGEMENT</span>
                    <h1>Customers</h1>
                    <p>Manage your customer information and relationships.</p>
                </div>

                <button
                    className="primary-button"
                    onClick={() => setShowForm(true)}
                >
                    <Plus size={18} />
                    Add Customer
                </button>
            </div>

            <div className="customer-summary">
                <div className="customer-summary-icon">
                    <Users size={22} />
                </div>
                <div>
                    <span>Total Customers</span>
                    <h2>{customers.length}</h2>
                </div>
            </div>

            <div className="customer-content">

                <div className="customer-toolbar">
                    <div>
                        <h3>All Customers</h3>
                        <p>View and manage your registered customers.</p>
                    </div>

                    <div className="customer-search">
                        <Search size={17} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="customer-table-wrapper">
                    <table className="customer-table">
                        <thead>
                            <tr>
                                <th>CUSTOMER</th>
                                <th>EMAIL</th>
                                <th>PHONE</th>
                                <th>ADDRESS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredCustomers.length > 0 ? (
                                filteredCustomers.map((customer) => (
                                    <tr key={customer.id}>
                                        <td>
                                            <div className="customer-name-cell">
                                                <div className="customer-avatar">
                                                    {customer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <strong>{customer.name}</strong>
                                            </div>
                                        </td>

                                        <td>{customer.email}</td>
                                        <td>{customer.phone || "—"}</td>
                                        <td>{customer.address || "—"}</td>

                                        <td>
                                            <div className="table-actions">
                                                <button
                                                    className="icon-action edit-action"
                                                    title="Edit customer"
                                                    onClick={() => handleEdit(customer)}
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                <button
                                                    className="icon-action delete-action"
                                                    title="Delete customer"
                                                    onClick={() => handleDelete(customer.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5">
                                        <div className="customer-empty-state">
                                            <div className="empty-icon">
                                                <Users size={27} />
                                            </div>
                                            <h3>
                                                {searchTerm
                                                    ? "No customers found"
                                                    : "No customers yet"}
                                            </h3>
                                            <p>
                                                {searchTerm
                                                    ? "Try searching with a different name or email."
                                                    : "Add your first customer to get started."}
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
                <div className="modal-overlay" onClick={closeForm}>
                    <div
                        className="customer-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <div>
                                <h2>{editingId ? "Edit Customer" : "Add New Customer"}</h2>
                                <p>Enter the customer's information below.</p>
                            </div>

                            <button className="modal-close" onClick={closeForm}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Customer Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter full name"
                                    minLength={2}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email Address *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="customer@example.com"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter 10-digit mobile number"
                                    inputMode="numeric"
                                    pattern="[0-9]{10}"
                                    minLength={10}
                                    maxLength={10}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Enter customer address"
                                    rows="3"
                                    minLength={5}
                                    required
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={closeForm}
                                >
                                    Cancel
                                </button>

                                <button type="submit" className="primary-button">
                                    {editingId ? "Save Changes" : "Add Customer"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Customers;
