import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const Products = () => {

  const location = useLocation();
  const navigate = useNavigate();

  // URL Params
  const queryParams = new URLSearchParams(location.search);
  const searchFromURL = queryParams.get("search") || "";
  const categoryFromURL = queryParams.get("category") || "All";
  const restaurantFromURL = queryParams.get("restaurant") || "";

  // Data State
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);

  // UI State
  const [sortBy, setSortBy] = useState("Recommended");
  const [vegOnly, setVegOnly] = useState(false);
  const [nonVegOnly, setNonVegOnly] = useState(false);
  const [error, setError] = useState(""); // rating, low-price, high-price
  const [selectedCategory, setSelectedCategory] = useState(categoryFromURL);

  // User & Ratings
  const [selectedRatings, setSelectedRatings] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [foodRes, catRes] = await Promise.all([
          axios.get("http://localhost:5000/api/food"),
          axios.get("http://localhost:5000/api/category")
        ]);

        setFoods(foodRes.data);
        setCategories(catRes.data);

        // Pre-fill ratings
        if (user) {
          const ratingsMap = {};
          foodRes.data.forEach((food) => {
            const userReview = food.reviews?.find(
              (r) => r.user === user._id || r.user === user.id
            );
            if (userReview) {
              ratingsMap[food._id] = userReview.rating;
            }
          });
          setSelectedRatings(ratingsMap);
        }

      } catch (error) {
        console.error("Error fetching data");
      }
    };
    fetchData();
  }, []); // Run once on mount

  // Sync state with URL params when they change
  useEffect(() => {
    if (categoryFromURL) setSelectedCategory(categoryFromURL);
  }, [categoryFromURL]);


  // Filtering Logic
  useEffect(() => {
    let result = [...foods];

    // 1. Search Query
    if (searchFromURL) {
      result = result.filter(f =>
        f.title.toLowerCase().includes(searchFromURL.toLowerCase()) ||
        f.description?.toLowerCase().includes(searchFromURL.toLowerCase()) ||
        f.restaurant?.username?.toLowerCase().includes(searchFromURL.toLowerCase())
      );
    }

    // 2. Category Filter
    if (selectedCategory !== "All") {
      result = result.filter(f => f.category === selectedCategory);
    }

    // 3. Restaurant Filter
    if (restaurantFromURL) {
      result = result.filter(f => f.restaurant?._id === restaurantFromURL);
    }

    // 4. Veg Filter
    if (vegOnly) {
      result = result.filter(f => f.isVeg === true);
    }
    if (nonVegOnly) {
      result = result.filter(f => f.isVeg === false);
    }

    // 5. Sorting
    if (sortBy === "Price: Low to High") result.sort((a, b) => a.price - b.price);
    if (sortBy === "Price: High to Low") result.sort((a, b) => b.price - a.price);
    if (sortBy === "Rating") result.sort((a, b) => b.rating - a.rating);

    setFilteredFoods(result);
  }, [foods, searchFromURL, selectedCategory, restaurantFromURL, sortBy, vegOnly, nonVegOnly]);


  // Actions
  const addToCart = async (foodId) => {
    if (!user) return navigate("/login");

    try {
      await axios.post(
        "http://localhost:5000/api/cart/add",
        { foodId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Added to cart!");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Error adding to cart");
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

      // Refetch data to show updated average and reviews count
      const res = await axios.get("http://localhost:5000/api/food");
      setFoods(res.data);

      // Update local selected ratings
      setSelectedRatings(prev => ({ ...prev, [foodId]: ratingValue }));

    } catch {
      alert("Error submitting rating");
    }
  };


  return (
    <div className="container mt-4">
      <div className="row">

        {/* Sidebar Filters */}
        <div className="col-md-3">
          <div className="sidebar sticky-top" style={{ top: "90px" }}>
            {error && <div className="alert alert-danger fixed-top" style={{ top: "80px", zIndex: 1000, margin: "0 20px" }}>{error}</div>}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold m-0">Filters</h5>
              {searchFromURL && (
                <button className="btn btn-sm btn-outline-danger" onClick={() => navigate("/products")}>
                  Clear Search
                </button>
              )}
            </div>

            <div className="mb-4">
              <h6 className="text-muted mb-2">Sort By</h6>
              <div className="form-check">
                <input className="form-check-input" type="radio" name="sort"
                  checked={sortBy === "rating"} onChange={() => setSortBy("rating")}
                />
                <label className="form-check-label">Rating (Popularity)</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="radio" name="sort"
                  checked={sortBy === "low-price"} onChange={() => setSortBy("low-price")}
                />
                <label className="form-check-label">Price: Low to High</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="radio" name="sort"
                  checked={sortBy === "high-price"} onChange={() => setSortBy("high-price")}
                />
                <label className="form-check-label">Price: High to Low</label>
              </div>
            </div>

            <div className="mb-4">
              <h6 className="text-muted mb-2">Categories</h6>
              <div className="form-check">
                <input className="form-check-input" type="radio" name="cat"
                  checked={selectedCategory === "All"} onChange={() => setSelectedCategory("All")}
                />
                <label className="form-check-label">All</label>
              </div>
              {categories.map(cat => (
                <div key={cat._id} className="form-check">
                  <input className="form-check-input" type="radio" name="cat"
                    checked={selectedCategory === cat.name} onChange={() => setSelectedCategory(cat.name)}
                  />
                  <label className="form-check-label">{cat.name}</label>
                </div>
              ))}
            </div>

            <hr />
            <h6 className="fw-bold mb-3">Dietary Preference</h6>
            <div className="form-check mb-2">
              <input className="form-check-input" type="checkbox" checked={vegOnly} onChange={(e) => { setVegOnly(e.target.checked); if (e.target.checked) setNonVegOnly(false); }} id="vegCheck" />
              <label className="form-check-label small" htmlFor="vegCheck">Veg Only</label>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" checked={nonVegOnly} onChange={(e) => { setNonVegOnly(e.target.checked); if (e.target.checked) setVegOnly(false); }} id="nonVegCheck" />
              <label className="form-check-label small" htmlFor="nonVegCheck">Non-Veg Only</label>
            </div>

          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="fw-bold">
              {searchFromURL ? `Results for "${searchFromURL}"` : "All Items"}
            </h3>
            <span className="text-muted">{filteredFoods.length} items found</span>
          </div>

          <div className="row">
            {filteredFoods.map(food => (
              <div key={food._id} className="col-md-4 mb-4">
                <div className="card h-100 shadow-sm border-0">
                  <img
                    src={food.image ? `http://localhost:5000${food.image}` : "https://via.placeholder.com/300?text=No+Image"}
                    className="food-img card-img-top"
                    alt={food.title}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title fw-bold text-dark mb-1">{food.title}</h5>
                    <div className="mb-2">
                      <span className={`badge ${food.isVeg ? "bg-success" : "bg-danger"} rounded-pill p-1 px-2`} style={{ fontSize: "9px" }}>
                        {food.isVeg ? "🟢 VEG" : "🔴 NON-VEG"}
                      </span>
                    </div>
                    <p className="card-text text-muted small mb-3 flex-grow-1">{food.category}</p>
                    <p className="text-muted small mb-2">
                      By: <span className="text-primary fw-bold">{food.restaurant?.username}</span>
                    </p>

                    <div className="d-flex flex-column mb-2">
                      {food.discount > 0 ? (
                        <div className="d-flex align-items-center justify-content-between w-100">
                          <div className="d-flex flex-column">
                            <span style={{ textDecoration: "line-through", color: "#888", fontSize: "0.85rem" }}>₹ {food.price}</span>
                            <h5 className="mb-0 fw-bold">₹ {(food.price * (1 - food.discount / 100)).toFixed(2)}</h5>
                          </div>
                          <span className="badge bg-danger p-2" style={{ fontSize: "0.75rem" }}>{food.discount}% OFF</span>
                        </div>
                      ) : (
                        <div className="d-flex align-items-center justify-content-between w-100">
                          <h5 className="mb-0 fw-bold">₹ {food.price}</h5>
                        </div>
                      )}
                      <span className="badge bg-warning text-dark mt-2 w-fit">⭐ {food.rating?.toFixed(1) || "New"}</span>
                    </div>

                    {/* Rating Stars Input */}
                    <div className="mb-3">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <span
                          key={num}
                          style={{
                            cursor: "pointer",
                            fontSize: "20px",
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

                    <button
                      className="btn btn-outline-primary w-100 mt-auto"
                      onClick={() => addToCart(food._id)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredFoods.length === 0 && (
              <div className="col-12 text-center mt-5">
                <h4>No items found matching your criteria.</h4>
                <button className="btn btn-primary mt-3" onClick={() => navigate("/products")}>
                  View All Products
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Products;
