import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate("/products");
    }
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top" style={{ backgroundColor: "#000", padding: "12px 0", zIndex: 1000 }}>
      <div className="container">

        {/* Brand */}
        <Link className="navbar-brand fw-bold" to="/" style={{ color: "#ff7e5f", fontSize: "1.6rem" }}>
          SB Foods
        </Link>

        {/* Search Bar */}
        <div className="d-none d-md-block mx-auto" style={{ width: "40%" }}>
          <form onSubmit={handleSearch} className="input-group">
            <input
              type="text"
              className="form-control border-end-0 rounded-start"
              placeholder="Search Restaurants, cuisine, etc."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="input-group-text bg-white border-start-0 rounded-end"
              style={{ cursor: "pointer" }}
            >
              🔍
            </button>
          </form>
        </div>

        {/* Right Side Icons */}
        <div className="d-flex align-items-center gap-3">

          {user ? (
            <>
              <div className="d-flex align-items-center gap-2">
                <span className="fw-bold text-white">{user.username}</span>
                <span className="fw-bold text-white">
                  {user.role}
                </span>
              </div>

              {user.role === "user" && (
                <>
                  <Link to="/profile" className="text-white text-decoration-none me-2">Profile</Link>
                  <Link to="/cart" className="text-white position-relative text-decoration-none">
                    <span style={{ fontSize: "1.2rem" }}>🛒</span>
                  </Link>
                </>
              )}

              {user.role === "restaurant" && (
                <Link to="/restaurant" className="btn btn-sm btn-outline-light">Dashboard</Link>
              )}

              {user.role === "admin" && (
                <Link to="/admin" className="btn btn-sm btn-outline-light">Admin Panel</Link>
              )}

              <button
                onClick={handleLogout}
                className="btn btn-sm btn-link text-danger text-decoration-none fw-bold"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="d-flex gap-2">
              <Link to="/login" className="btn btn-outline-light px-4">Login</Link>
              <Link to="/register" className="btn btn-primary px-4" style={{ backgroundColor: "#ff7e5f", border: "none" }}>Sign up</Link>
            </div>
          )}

        </div>

      </div>
    </nav>
  );
};

export default Navbar;