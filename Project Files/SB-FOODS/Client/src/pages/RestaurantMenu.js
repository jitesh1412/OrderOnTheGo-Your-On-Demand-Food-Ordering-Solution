import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const RestaurantMenu = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [foods, setFoods] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All"); // All, Veg, NonVeg
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/food/restaurant/${id}`);
      setFoods(res.data);

      if (user) {
        const ratingsMap = {};
        res.data.forEach(food => {
          const userReview = food.reviews?.find(r => r.user === user._id || r.user === user.id);
          if (userReview) ratingsMap[food._id] = userReview.rating;
        });
        setSelectedRatings(ratingsMap);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching restaurant foods");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const addToCart = async (foodId) => {
    if (!user) return navigate("/login");

    try {
      await axios.post(
        "http://localhost:5000/api/cart/add",
        { foodId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Added to cart!");
    } catch {
      alert("Error adding to cart");
    }
  };

  const rateFood = async (foodId, ratingValue) => {
    if (!user) return navigate("/login");

    try {
      await axios.post(
        `http://localhost:5000/api/food/rate/${foodId}`,
        { rating: ratingValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Error submitting rating");
    }
  };

  const filteredFoods = foods.filter(f => {
    if (filter === "Veg") return f.isVeg;
    if (filter === "NonVeg") return !f.isVeg;
    return true;
  });

  if (loading) return <div className="text-center mt-5"><h3>Loading Menu...</h3></div>;

  return (
    <div className="container mt-5">
      {error && <div className="alert alert-danger sticky-top" style={{ top: "80px", zIndex: 1000 }}>{error}</div>}

      {/* Restaurant Header */}
      <div className="card p-4 border-0 shadow-sm mb-5 text-center" style={{ borderRadius: "20px", background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)" }}>
        {foods.length > 0 && (
          <>
            <h2 className="fw-bold mb-1">{foods[0].restaurant?.username}'s Menu</h2>
            <p className="text-muted">High quality ingredients, prepared with love.</p>
            <div className="d-flex justify-content-center gap-2 mt-3">
              <button
                className={`btn btn-sm rounded-pill px-4 ${filter === "All" ? "btn-dark" : "btn-outline-dark"}`}
                onClick={() => setFilter("All")}
              >All</button>
              <button
                className={`btn btn-sm rounded-pill px-4 ${filter === "Veg" ? "btn-success" : "btn-outline-success"}`}
                onClick={() => setFilter("Veg")}
              >Veg Only</button>
              <button
                className={`btn btn-sm rounded-pill px-4 ${filter === "NonVeg" ? "btn-danger" : "btn-outline-danger"}`}
                onClick={() => setFilter("NonVeg")}
              >Non-Veg Only</button>
            </div>
          </>
        )}
      </div>

      <div className="row">
        {foods.length === 0 && (
          <div className="col-12 text-center">
            <h4 className="text-muted">No items available at this restaurant right now.</h4>
            <button onClick={() => navigate("/")} className="btn btn-primary mt-3">Back to Home</button>
          </div>
        )}

        {filteredFoods.map((food) => (
          <div key={food._id} className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm border-0 hover-card" style={{ borderRadius: "15px", overflow: "hidden" }}>
              <img
                src={food.image ? `http://localhost:5000${food.image}` : "https://via.placeholder.com/300?text=No+Image"}
                className="card-img-top"
                alt={food.title}
                style={{ height: "200px", objectFit: "cover" }}
              />
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="d-flex flex-column">
                    <h5 className="card-title fw-bold m-0">{food.title}</h5>
                    <span className={`badge ${food.isVeg ? "bg-success" : "bg-danger"} rounded-pill p-1 px-2 mt-1 w-fit`} style={{ fontSize: "9px" }}>
                      {food.isVeg ? "🟢 VEG" : "🔴 NON-VEG"}
                    </span>
                  </div>
                  <span className="badge bg-light text-primary border">{food.category}</span>
                </div>

                <p className="small text-muted mb-3">{food.description || "No description available."}</p>

                <div className="mt-auto">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex flex-column">
                      {food.discount > 0 ? (
                        <>
                          <span className="text-muted small text-decoration-line-through">₹ {food.price}</span>
                          <h4 className="fw-bold m-0">₹ {(food.price * (1 - food.discount / 100)).toFixed(2)}</h4>
                        </>
                      ) : (
                        <h4 className="fw-bold m-0">₹ {food.price}</h4>
                      )}
                    </div>
                    <div className="d-flex align-items-center">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <span
                          key={num}
                          style={{
                            cursor: "pointer",
                            fontSize: "18px",
                            color: selectedRatings[food._id] >= num ? "gold" : "#e4e5e9"
                          }}
                          onClick={() => {
                            setSelectedRatings({ ...selectedRatings, [food._id]: num });
                            rateFood(food._id, num);
                          }}
                        >
                          ★
                        </span>
                      ))}
                      <small className="text-muted ms-1">({food.numReviews})</small>
                    </div>
                  </div>

                  <button
                    className="btn btn-outline-danger w-100 fw-bold rounded-pill"
                    onClick={() => addToCart(food._id)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantMenu;