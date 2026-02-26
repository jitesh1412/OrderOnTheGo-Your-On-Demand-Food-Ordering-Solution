import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/order/my-orders",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setOrders(res.data);
    } catch (error) {
      setMessage("Please login as user");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const cancelOrder = async (orderId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/order/cancel/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      fetchOrders();
    } catch (error) {
      console.error("Error cancelling order");
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold m-0">Order History</h2>
        <div className="text-muted small">Total Orders: {orders.length}</div>
      </div>

      {message && <div className="alert alert-info border-0 shadow-sm rounded-3">{message}</div>}

      {orders.length === 0 ? (
        <div className="text-center py-5 shadow-sm rounded-4 bg-white">
          <div className="mb-3" style={{ fontSize: "3rem" }}>📦</div>
          <h5>No orders yet</h5>
          <p className="text-muted small">Looks like you haven't ordered anything yet.</p>
        </div>
      ) : (
        <div className="row">
          {orders.slice().reverse().map((order) => (
            <div key={order._id} className="col-12 mb-4">
              <div className="card shadow-sm border-0 overflow-hidden" style={{ borderRadius: "20px" }}>
                <div className="card-header bg-white border-bottom-0 pt-4 px-4 d-flex justify-content-between align-items-start">
                  <div>
                    <span className="badge bg-light text-dark rounded-pill px-3 py-2 mb-2" style={{ fontSize: "0.75rem" }}>
                      ORDER ID: #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <h5 className="fw-bold mb-0">
                      {order.status === "Delivered" ? "✅ Delivered" :
                        order.status === "Cancelled" ? "❌ Cancelled" :
                          "🕒 " + order.status}
                    </h5>
                    <p className="text-muted small mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-end">
                    <h4 className="fw-bold text-primary mb-0">₹ {Math.round(order.totalAmount)}</h4>
                    <span className="small text-muted">{order.paymentMethod}</span>
                  </div>
                </div>

                <div className="card-body px-4 pb-4">
                  <div className="rounded-3 p-3 bg-light mb-3">
                    <h6 className="fw-bold mb-3 small text-uppercase text-muted">Items ({order.items.length})</h6>
                    {order.items.map((it, idx) => (
                      <div key={idx} className="d-flex justify-content-between align-items-center mb-2 last-item-no-border">
                        <div className="d-flex align-items-center">
                          <div className="bg-white rounded p-1 me-3 shadow-sm" style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            🍱
                          </div>
                          <div>
                            <h6 className="mb-0 fw-bold small">{it.food?.title} <span className="text-muted fw-normal">x {it.quantity}</span></h6>
                            <p className="small text-muted mb-0" style={{ fontSize: "0.7rem" }}>{it.food?.category}</p>
                          </div>
                        </div>
                        <span className="fw-bold small">₹ {it.food?.price * it.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="d-flex justify-content-between align-items-center pt-2">
                    <div className="small">
                      <span className="text-muted">Delivery Address: </span>
                      <span className="fw-bold text-dark">{order.deliveryAddress}, {order.pincode}</span>
                    </div>
                    {order.status === "Placed" && (
                      <button
                        className="btn btn-outline-danger btn-sm rounded-pill px-4 fw-bold"
                        onClick={() => cancelOrder(order._id)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
