import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [topFoods, setTopFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const navigate = useNavigate();

  const fetchTopFoods = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/food");
      // Sort by best rating and take top 6
      const sorted = res.data
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 6);
      setTopFoods(sorted);
    } catch (error) {
      console.error("Error fetching top foods");
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

  const fetchRestaurants = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/food/top-restaurants");
      setRestaurants(res.data);
    } catch (error) {
      console.error("Error fetching restaurants");
    }
  };

  useEffect(() => {
    fetchTopFoods();
    fetchCategories();
    fetchRestaurants();
  }, []);

  const goToCategory = (name) => {
    navigate(`/products?category=${encodeURIComponent(name)}`);
  };

  const goToRestaurant = (id) => {
    navigate(`/restaurant-menu/${id}`);
  };

  return (
    <div className="container mt-4">

      {/* Hero Section */}
      <div className="p-5 mb-5 bg-light rounded-3 text-center hero-section"
        style={{ background: 'linear-gradient(to right, #ff7e5f, #feb47b)', color: 'white', borderRadius: "20px" }}>
        <h1 className="fw-bold display-4 text-white">Order Food Anytime</h1>
        <p className="lead fs-4">
          Discover delicious meals from your favorite restaurants delivered to your doorstep.
        </p>
        <button onClick={() => navigate("/products")} className="btn btn-light btn-lg mt-2 fw-bold text-danger px-5 rounded-pill shadow">
          Browse Menu
        </button>
      </div>

      {/* Top Rated Section */}
      <div className="mb-5">
        <h3 className="fw-bold mb-4 border-start border-4 border-danger ps-3">🔥 Top Rated Dishes</h3>
        <div className="row">
          {topFoods.map((food) => (
            <div key={food._id} className="col-md-4 mb-4">
              <div
                className="card border-0 shadow-sm h-100 hover-card"
                style={{ cursor: "pointer", borderRadius: "15px", overflow: "hidden" }}
                onClick={() => goToRestaurant(food.restaurant?._id)}
              >
                <img
                  src={food.image ? `http://localhost:5000${food.image}` : "https://via.placeholder.com/300?text=No+Image"}
                  className="card-img-top"
                  alt={food.title}
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="card-body">
                  <h5 className="card-title fw-bold mb-1">{food.title}</h5>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex flex-column">
                      {food.discount > 0 ? (
                        <>
                          <span className="text-muted small text-decoration-line-through">₹ {food.price}</span>
                          <h5 className="fw-bold m-0 text-dark">₹ {(food.price * (1 - food.discount / 100)).toFixed(2)}</h5>
                        </>
                      ) : (
                        <h5 className="fw-bold m-0 text-dark">₹ {food.price}</h5>
                      )}
                    </div>
                    <span className="badge bg-warning text-dark px-3 py-2 rounded-pill small">⭐ {food.rating?.toFixed(1)}</span>
                  </div>
                  <span className="text-muted small">{food.restaurant?.username}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div className="mb-5">
        <h3 className="fw-bold mb-4 border-start border-4 border-primary ps-3">Explore Categories</h3>
        <div className="row">
          {categories.map((category) => (
            <div key={category._id} className="col-6 col-md-2 mb-4">
              <div
                className="card shadow-sm p-3 text-center border-0 h-100 category-card hover-card"
                style={{ cursor: "pointer", borderRadius: "15px", backgroundColor: "#f8f9fa" }}
                onClick={() => goToCategory(category.name)}
              >
                <div className="mb-2">
                  {category.image ? (
                    <img src={`http://localhost:5000${category.image}`} alt={category.name} style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    <div className="mx-auto" style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "#e9ecef", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
                      📦
                    </div>
                  )}
                </div>
                <h6 className="fw-bold m-0 text-dark small">{category.name}</h6>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Restaurants Section */}
      <div className="mb-5">
        <h3 className="fw-bold mb-4 border-start border-4 border-success ps-3">Top Rated Restaurants</h3>
        <div className="row">
          {restaurants.map((restaurant) => (
            <div key={restaurant._id} className="col-md-3 mb-4">
              <div
                className="card shadow p-4 text-center border-0 h-100 hover-card"
                style={{ cursor: "pointer", borderRadius: "20px" }}
                onClick={() => goToRestaurant(restaurant._id)}
              >
                <div className="mb-3 d-flex justify-content-center">
                  <div style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                    border: "3px solid #f8f9fa",
                    backgroundColor: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    {restaurant.profileImage ? (
                      <img
                        src={`http://localhost:5000${restaurant.profileImage}`}
                        alt={restaurant.username}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <span style={{ fontSize: "3rem" }}>🏪</span>
                    )}
                  </div>
                </div>
                <h5 className="fw-bold mb-1">{restaurant.username}</h5>
                <div className="text-warning small mb-3 fw-bold">
                  ⭐ {restaurant.avgRating?.toFixed(1)} Avg Rating
                </div>
                <button className="btn btn-success w-100 rounded-pill fw-bold">View Menu</button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Home;