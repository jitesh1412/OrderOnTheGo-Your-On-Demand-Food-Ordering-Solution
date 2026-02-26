import React, { useEffect, useState } from "react";
import axios from "axios";

const RestaurantDashboard = () => {
  const [food, setFood] = useState({ title: "", description: "", price: "", category: "", image: "", isVeg: true });
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, deliveredCount: 0, totalRevenue: 0 });
  const [categories, setCategories] = useState([]);
  const [logoUploading, setLogoUploading] = useState(false);
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const fetchFoods = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/food/my-items", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFoods(res.data);
    } catch (error) {
      console.error("Error fetching foods");
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/order/restaurant-orders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (error) {
      console.error("Error fetching orders");
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/order/restaurant-stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching stats");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/category");
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories");
    }
  };

  useEffect(() => {
    fetchFoods();
    fetchOrders();
    fetchStats();
    fetchCategories();
    // Refresh user data from localStorage in case it was updated
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      // Option/TODO: Fetch fresh user data from API for real-time update
    }
  }, []);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setLogoUploading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/user/upload-logo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });
      alert("Logo updated successfully!");
      // Update local storage user profile image
      const updatedUser = { ...currentUser, profileImage: res.data.profileImage };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.location.reload(); // Refresh to show new logo
    } catch (error) {
      alert("Logo upload failed");
    } finally {
      setLogoUploading(false);
    }
  };

  const handleAddFood = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", food.title);
    formData.append("description", food.description);
    formData.append("price", food.price);
    formData.append("category", food.category);
    formData.append("image", food.image);
    formData.append("discount", food.discount || 0);
    formData.append("isVeg", food.isVeg);

    try {
      await axios.post("http://localhost:5000/api/food/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });
      alert("Food Item Added!");
      setFood({ title: "", description: "", price: "", category: "", image: "", isVeg: true });
      fetchFoods();
    } catch (error) {
      alert("Failed to add food");
    }
  };

  const deleteFood = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await axios.delete(`http://localhost:5000/api/food/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchFoods();
      } catch (error) {
        alert("Failed to delete item");
      }
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.post(
        "http://localhost:5000/api/order/status",
        { orderId, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
    } catch (error) { console.error("Error updating status"); }
  };

  // Dark Theme Styles
  const darkBg = "#1a1d21";
  const cardBg = "#334f6cff";
  const textLight = "#f8f9fa";
  const textMuted = "#adb5bd";
  const inputBg = "#2c3034";
  const borderColor = "#343a40";

  return (
    <div style={{ backgroundColor: darkBg, minHeight: "100vh", color: textLight }} className="pb-5">
      <div className="container pt-4">

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Restaurant Dashboard</h2>
          <div className="d-flex align-items-center gap-3">
            {/* Logo Preview */}
            <div style={{ width: "50px", height: "50px", borderRadius: "50%", overflow: "hidden", border: "2px solid #555" }}>
              {currentUser.profileImage ? (
                <img src={`http://localhost:5000${currentUser.profileImage}`} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center">Logo</div>
              )}
            </div>

            <div>
              <label className="btn btn-sm btn-outline-light" style={{ cursor: "pointer" }}>
                {logoUploading ? "Uploading..." : "Upload Logo"}
                <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
              </label>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="row mb-5">
          <div className="col-md-3">
            <div className="card text-white border-0 shadow-sm p-4" style={{ backgroundColor: cardBg }}>
              <h6 className="text-muted small text-uppercase fw-bold text-white">Active Items</h6>
              <h2 className="mb-0">{foods.length}</h2>
              <button className="btn btn-sm btn-outline-warning mt-3 border-0 p-0 text-start w-fit">View all</button>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-white border-0 shadow-sm p-4" style={{ backgroundColor: cardBg }}>
              <h6 className="text-muted small text-uppercase fw-bold">Delivered</h6>
              <h2 className="mb-0">{stats.deliveredCount}</h2>
              <button className="btn btn-sm btn-outline-warning mt-3 border-0 p-0 text-start w-fit">View all</button>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-white border-0 shadow-sm p-4" style={{ backgroundColor: cardBg }}>
              <h6 className="text-muted small text-uppercase fw-bold">Total Revenue</h6>
              <h2 className="mb-0">₹ {Math.round(stats.totalRevenue)}</h2>
              <button className="btn btn-sm btn-outline-warning mt-3 border-0 p-0 text-start w-fit">View details</button>
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div className="row">
          {/* Add Food Form */}
          <div className="col-md-4">
            {!currentUser.isApproved ? (
              <div className="card text-white border-0 shadow-sm mb-4" style={{ backgroundColor: "#856404", color: "#fff" }}>
                <div className="card-body text-center py-5">
                  <div className="mb-3" style={{ fontSize: "40px" }}>⏳</div>
                  <h5 className="fw-bold">Approval Pending</h5>
                  <p className="small mb-0 opacity-75">Your restaurant is currently under review. You will be able to add items once an admin approves your account.</p>
                </div>
              </div>
            ) : (
              <div className="card text-white border-0 shadow-sm mb-4" style={{ backgroundColor: cardBg }}>
                <div className="card-header border-bottom border-secondary bg-transparent py-3">
                  <h5 className="mb-0">Add New Item</h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleAddFood}>
                    <div className="mb-3">
                      <label className="form-label small">Item Title</label>
                      <input type="text" className="form-control" style={{ backgroundColor: inputBg, color: "white", border: "1px solid #444" }} value={food.title} onChange={(e) => setFood({ ...food, title: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small">Description</label>
                      <textarea className="form-control" rows="3" style={{ backgroundColor: inputBg, color: "white", border: "1px solid #444" }} value={food.description} onChange={(e) => setFood({ ...food, description: e.target.value })} required></textarea>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small">Price (₹)</label>
                      <input type="number" className="form-control" style={{ backgroundColor: inputBg, color: "white", border: "1px solid #444" }} value={food.price} onChange={(e) => setFood({ ...food, price: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small">Category</label>
                      <select
                        className="form-select"
                        style={{ backgroundColor: inputBg, color: "white", border: "1px solid #444" }}
                        value={food.category}
                        onChange={(e) => setFood({ ...food, category: e.target.value })}
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small">Discount (%)</label>
                      <input type="number" className="form-control" style={{ backgroundColor: inputBg, color: "white", border: "1px solid #444" }} value={food.discount} onChange={(e) => setFood({ ...food, discount: e.target.value })} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small d-block">Type</label>
                      <div className="btn-group w-100" role="group">
                        <input type="radio" className="btn-check" name="foodType" id="veg" autoComplete="off" checked={food.isVeg} onChange={() => setFood({ ...food, isVeg: true })} />
                        <label className="btn btn-outline-success" htmlFor="veg">Veg</label>

                        <input type="radio" className="btn-check" name="foodType" id="nonveg" autoComplete="off" checked={!food.isVeg} onChange={() => setFood({ ...food, isVeg: false })} />
                        <label className="btn btn-outline-danger" htmlFor="nonveg">Non-Veg</label>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="form-label small">Item Image</label>
                      <input type="file" className="form-control" style={{ backgroundColor: inputBg, color: "white", border: "1px solid #444" }} onChange={(e) => setFood({ ...food, image: e.target.files[0] })} required />
                    </div>
                    <button className="btn btn-primary w-100 py-2">Add to Menu</button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Food List */}
          <div className="col-md-8">
            <div className="card text-white border-0 shadow-sm" style={{ backgroundColor: cardBg }}>
              <div className="card-header border-bottom border-secondary bg-transparent py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Existing Menu</h5>
                <span className="badge bg-secondary">{foods.length} Items</span>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  {foods.map((item) => (
                    <div key={item._id} className="list-group-item bg-transparent border-secondary py-3 d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <img src={`http://localhost:5000${item.image}`} alt={item.title} className="rounded" style={{ width: "50px", height: "50px", objectFit: "cover" }} />
                        <div className="ms-3">
                          <h6 className="mb-0 text-white">{item.title}</h6>
                          <div className="small">
                            <span className={`badge ${item.isVeg ? "bg-success" : "bg-danger"} me-2`} style={{ fontSize: "10px" }}>{item.isVeg ? "VEG" : "NON-VEG"}</span>
                            <span className="text-muted">{item.category} • </span>
                            {item.discount > 0 ? (
                              <>
                                <span className="text-decoration-line-through text-muted small">₹ {item.price}</span>
                                <span className="text-success ms-2 fw-bold">₹ {(item.price * (1 - item.discount / 100)).toFixed(2)}</span>
                                <span className="badge bg-danger ms-2" style={{ fontSize: "10px" }}>{item.discount}% OFF</span>
                              </>
                            ) : (
                              <span className="text-white">₹ {item.price}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => deleteFood(item._id)}>Delete</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Orders List */}
            <div className="card text-white border-0 shadow-sm mt-4" style={{ backgroundColor: cardBg }}>
              <div className="card-header border-bottom border-secondary bg-transparent py-3">
                <h5 className="mb-0">Manage Orders</h5>
              </div>
              <div className="card-body">
                {orders.length === 0 ? <p className="text-center text-muted">No orders received yet.</p> : (
                  orders.map((order) => (
                    <div key={order._id} className="p-3 border rounded border-secondary mb-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6>Order #{order._id.slice(-6)}</h6>
                          <small className="text-muted d-block mb-2">User: {order.user.username}</small>
                          {order.items.map((it, idx) => (
                            <div key={idx} className="small text-light">{it.food?.title || "Deleted Item"} x {it.quantity}</div>
                          ))}
                        </div>
                        <select
                          className="form-select form-select-sm w-auto bg-dark text-white border-secondary"
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        >
                          <option>Placed</option>
                          <option>Preparing</option>
                          <option>Out for Delivery</option>
                          <option>Delivered</option>
                          <option>Cancelled</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RestaurantDashboard;
