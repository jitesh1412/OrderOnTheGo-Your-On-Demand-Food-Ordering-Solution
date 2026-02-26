import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [shippingInfo, setShippingInfo] = useState({ address: "", pincode: "", phone: "", email: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchCart = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/cart", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems(res.data.items || []);
    } catch (error) {
      console.error("Error fetching cart");
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      fetchCart();
    }
  }, []);

  const handleApplyCoupon = () => {
    alert("Coupon feature coming soon!");
  };

  const removeFromCart = async (foodId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/cart/remove/${foodId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCart(); // Re-fetch cart to update UI
      setError("");
    } catch (error) {
      console.error("Error removing item");
      setError(error.response?.data?.message || "Failed to remove item from cart.");
    }
  };

  const updateQuantity = async (foodId, qty) => {
    if (qty < 1) {
      return removeFromCart(foodId);
    }
    try {
      await axios.put(
        "http://localhost:5000/api/cart/update",
        { foodId, quantity: qty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCart();
      setError("");
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        console.error("Error updating quantity", err);
        setError("Failed to update item quantity.");
      }
    }
  };

  const placeOrder = async () => {
    if (!shippingInfo.address || !shippingInfo.pincode || !shippingInfo.phone || !shippingInfo.email) {
      return setError("Please fill in all checkout details");
    }

    try {
      await axios.post(
        "http://localhost:5000/api/order/place",
        {
          deliveryAddress: shippingInfo.address,
          pincode: shippingInfo.pincode,
          phone: shippingInfo.phone,
          email: shippingInfo.email,
          paymentMethod: "COD"
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Order Placed Successfully!");
      setCartItems([]);
      navigate("/profile"); // Navigate to profile to see orders
    } catch (error) {
      setError(error.response?.data?.message || "Failed to place order");
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => {
      if (!item.food) return acc;
      return acc + (item.food.price * item.quantity);
    }, 0);
  };

  const calculateTotalSavings = () => {
    return cartItems.reduce((acc, item) => {
      if (!item.food || !item.food.discount) return acc;
      const savingsPerItem = item.food.price * (item.food.discount / 100);
      return acc + (savingsPerItem * item.quantity);
    }, 0);
  };

  const baseSubtotal = calculateSubtotal();
  const itemSavings = calculateTotalSavings();
  const subtotalAfterSavings = baseSubtotal - itemSavings;

  const deliveryCharge = subtotalAfterSavings > 0 ? 40 : 0;
  const couponDiscount = subtotalAfterSavings > 500 ? 50 : 0;
  const finalTotal = Math.round(subtotalAfterSavings + deliveryCharge - couponDiscount);

  if (cartItems.length === 0) {
    return (
      <div className="container mt-5 text-center">
        <h3>Your cart is empty</h3>
        <button className="btn btn-primary mt-3" onClick={() => navigate("/products")}>
          Browse Food
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      {error && <div className="alert alert-danger sticky-top" style={{ top: "80px", zIndex: 1000 }}>{error}</div>}
      <h2 className="mb-4 fw-bold">My Cart ({cartItems.length})</h2>

      <div className="row">

        {/* LEFT COLUMN: Cart Items */}
        <div className="col-md-8">
          <div className="d-flex flex-column gap-3">
            {cartItems.map((item) => {
              if (!item.food) return null;
              return (
                <div key={item._id} className="card shadow-sm border-0 p-3">
                  <div className="d-flex align-items-center">

                    {/* Image */}
                    <img
                      src={item.food.image ? `http://localhost:5000${item.food.image}` : "https://via.placeholder.com/150"}
                      alt={item.food.title}
                      className="rounded"
                      style={{ width: "120px", height: "100px", objectFit: "cover" }}
                    />

                    {/* Details */}
                    <div className="ms-3 flex-grow-1">
                      <h5 className="mb-1 fw-bold">{item.food.title}</h5>
                      <p className="text-muted small mb-1">
                        Start by {item.food.restaurant.username}
                      </p>
                      <p className="text-muted small mb-2" style={{ fontStyle: "italic" }}>
                        "{item.food.description}"
                      </p>
                      {item.food.discount > 0 ? (
                        <div className="d-flex align-items-center">
                          <span className="text-muted small text-decoration-line-through me-2">₹ {item.food.price}</span>
                          <h6 className="fw-bold text-primary m-0">₹ {(item.food.price * (1 - item.food.discount / 100)).toFixed(2)}</h6>
                          <span className="badge bg-danger ms-2" style={{ fontSize: "10px" }}>{item.food.discount}% OFF</span>
                        </div>
                      ) : (
                        <h6 className="fw-bold text-primary">₹ {item.food.price}</h6>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="d-flex flex-column align-items-end">
                      <div className="d-flex align-items-center mb-2">
                        <button
                          className="btn btn-sm btn-outline-secondary px-2"
                          onClick={() => updateQuantity(item.food._id, item.quantity - 1)}
                        >-</button>
                        <span className="mx-2 fw-bold">{item.quantity}</span>
                        <button
                          className="btn btn-sm btn-outline-secondary px-2"
                          onClick={() => updateQuantity(item.food._id, item.quantity + 1)}
                        >+</button>
                      </div>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeFromCart(item.food._id)}
                      >
                        Remove
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Price Details */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0 p-4 sticky-top" style={{ top: "100px" }}>
            <h5 className="fw-bold mb-3 text-secondary">CHECKOUT DETAILS</h5>
            <div className="mb-3">
              <label className="form-label small">Full Delivery Address</label>
              <textarea className="form-control form-control-sm" rows="2" value={shippingInfo.address} onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })} placeholder="House no, Street, Area..."></textarea>
            </div>
            <div className="row mb-3">
              <div className="col">
                <label className="form-label small">Pincode</label>
                <input type="text" className="form-control form-control-sm" value={shippingInfo.pincode} onChange={(e) => setShippingInfo({ ...shippingInfo, pincode: e.target.value })} placeholder="110001" />
              </div>
              <div className="col">
                <label className="form-label small">Phone</label>
                <input type="text" className="form-control form-control-sm" value={shippingInfo.phone} onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })} placeholder="9876543210" />
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label small">Email ID</label>
              <input type="email" className="form-control form-control-sm" value={shippingInfo.email} onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })} placeholder="john@example.com" />
            </div>

            <h5 className="fw-bold mb-3 text-secondary">PRICE DETAILS</h5>
            <hr />

            <div className="d-flex justify-content-between mb-2">
              <span>Price ({cartItems.length} items)</span>
              <span>₹ {baseSubtotal}</span>
            </div>

            <div className="d-flex justify-content-between mb-2 text-success">
              <span>Item Savings</span>
              <span>- ₹ {Math.round(itemSavings)}</span>
            </div>

            <div className="d-flex justify-content-between mb-2">
              <span>Delivery Charges</span>
              <span className="text-secondary">₹ {deliveryCharge}</span>
            </div>

            <div className="d-flex justify-content-between mb-3 text-success">
              <span>Coupon Discount</span>
              <span>- ₹ {couponDiscount}</span>
            </div>

            <hr className="my-2" />

            <div className="d-flex justify-content-between mb-4">
              <h5 className="fw-bold">Total Amount</h5>
              <h5 className="fw-bold">₹ {finalTotal}</h5>
            </div>

            <button
              className="btn btn-warning w-100 fw-bold py-2 mb-3"
              style={{ fontSize: "1.1rem" }}
              onClick={placeOrder}
            >
              PLACE ORDER
            </button>

            <div className="input-group">
              <input type="text" className="form-control" placeholder="Promocode" />
              <button className="btn btn-outline-secondary" onClick={handleApplyCoupon}>APPLY</button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Cart;
