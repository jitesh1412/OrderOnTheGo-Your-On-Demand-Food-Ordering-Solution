import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const token = localStorage.getItem("token");

  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/stats",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStats(res.data);
    } catch (err) { console.error("Stats fetch error"); }
  };

  const fetchRestaurants = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/restaurants",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRestaurants(res.data);
    } catch (err) { console.error("Restaurants fetch error"); }
  };

  const toggleApproval = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/toggle-approval/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRestaurants();
      fetchStats();
    } catch (err) { alert("Failed to toggle approval"); }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/category");
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories");
    }
  };

  const addCategory = async () => {
    if (!newCategory) return alert("Enter category name");
    try {
      const formData = new FormData();
      formData.append("name", newCategory);
      if (newCategoryImage) {
        formData.append("image", newCategoryImage);
      }

      await axios.post(
        "http://localhost:5000/api/category/add",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          }
        }
      );

      setNewCategory("");
      setNewCategoryImage(null);
      fetchCategories();
    } catch (error) {
      console.error("Error adding category");
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete category?")) return;
    try {
      await axios.delete(
        `http://localhost:5000/api/category/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category");
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/all-orders",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(res.data);
    } catch (err) { console.error("Orders fetch error"); }
  };

  useEffect(() => {
    fetchStats();
    fetchOrders();
    fetchCategories();
    fetchRestaurants();
  }, []);

  return (
    <div className="container mt-4">
      <h2>Admin Dashboard</h2>

      {/* Stats Section */}
      <div className="row mt-4">
        <div className="col-md-3">
          <div className="card p-3 text-center border-0 shadow-sm" style={{ backgroundColor: "#212529", color: "white" }}>
            <h6 className="text-primary small text-uppercase fw-bold">Total Users</h6>
            <h3>{stats.totalUsers}</h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 text-center border-0 shadow-sm" style={{ backgroundColor: "#212529", color: "white" }}>
            <h6 className="text-primary small text-uppercase fw-bold">Restaurants</h6>
            <h3>{stats.totalRestaurants}</h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 text-center border-0 shadow-sm" style={{ backgroundColor: "#212529", color: "white" }}>
            <h6 className="text-primary small text-uppercase fw-bold">Total Orders</h6>
            <h3>{stats.totalOrders}</h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 text-center border-0 shadow-sm" style={{ backgroundColor: "#212529", color: "white" }}>
            <h6 className="text-primary small text-uppercase fw-bold">Revenue</h6>
            <h3>₹ {stats.totalRevenue}</h3>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <h4>Manage Categories</h4>

        <div className="card p-4 border-0 shadow-sm mb-4" style={{ backgroundColor: "#f8f9fa" }}>
          <div className="row g-2">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Category Name (e.g. Pizza)"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <input
                type="file"
                className="form-control"
                onChange={(e) => setNewCategoryImage(e.target.files[0])}
              />
            </div>
            <div className="col-md-4">
              <button className="btn btn-primary w-100" onClick={addCategory}>
                Add Category
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          {categories.map((cat) => (
            <div key={cat._id} className="col-md-3 mb-3">
              <div className="card p-2 shadow-sm border-0 text-center h-100">
                {cat.image && (
                  <img src={`http://localhost:5000${cat.image}`} alt={cat.name} className="card-img-top mb-2 rounded" style={{ height: "100px", objectFit: "cover" }} />
                )}
                <div className="d-flex justify-content-between align-items-center mt-auto">
                  <span className="fw-bold">{cat.name}</span>
                  <button
                    className="btn btn-danger btn-sm rounded-circle"
                    onClick={() => deleteCategory(cat._id)}
                    style={{ width: "30px", height: "30px", padding: 0 }}
                  >
                    &times;
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <h4>Manage Restaurants</h4>
        <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: "15px" }}>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Restaurant Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map(r => (
                  <tr key={r._id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: "32px", height: "32px", fontSize: "14px" }}>
                          {r.username.charAt(0).toUpperCase()}
                        </div>
                        {r.username}
                      </div>
                    </td>
                    <td>{r.email}</td>
                    <td>
                      <span className={`badge rounded-pill ${r.isApproved ? "bg-success" : "bg-warning text-dark"}`}>
                        {r.isApproved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <button
                        className={`btn btn-sm rounded-pill px-3 ${r.isApproved ? "btn-outline-danger" : "btn-primary"}`}
                        onClick={() => toggleApproval(r._id)}
                      >
                        {r.isApproved ? "Disapprove" : "Approve"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <h4>Restaurant Order Counts</h4>

        {stats.restaurantStats &&
          stats.restaurantStats.map((r, index) => (
            <div key={index} className="card p-2 mb-2">
              <strong>{r.restaurantName}</strong> — Orders: {r.orderCount}
            </div>
          ))}
      </div>

      <div className="mt-4">
        <h4>All Orders</h4>

        <select
          className="form-control mb-3"
          style={{ width: "250px" }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All</option>
          <option>Placed</option>
          <option>Preparing</option>
          <option>Out for Delivery</option>
          <option>Delivered</option>
          <option>Cancelled</option>
        </select>
      </div>

      {/* Orders Section */}
      <div className="mt-5">
        <h4>All Orders</h4>

        {orders
          .filter(order =>
            statusFilter === "All" ? true : order.status === statusFilter
          )
          .map(order => (

            <div key={order._id} className="card p-3 mb-3">
              <p><strong>User:</strong> {order.user.username}</p>

              <p>
                <strong>Restaurants:</strong>{" "}
                {[
                  ...new Set(
                    order.items
                      .map(item => item.food?.restaurant?.username)
                      .filter(Boolean)
                  )
                ].join(", ")}
              </p>

              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Total:</strong> ₹ {order.totalAmount}</p>
            </div>
          ))}
      </div>

    </div>
  );
};

export default AdminDashboard;