import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      const { token, user } = res.data;

      // Store token and user info
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setMessage("Login successful");

      // Redirect based on role
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "restaurant") {
        navigate("/restaurant");
      } else {
        navigate("/products");
      }

    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Login</h2>

      {message && <div className="alert alert-info">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="email"
            className="form-control"
            placeholder="Email"
            name="email"
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            name="password"
            onChange={handleChange}
            required
          />
        </div>

        <button className="btn btn-primary">Login</button>
      </form>
    </div>
  );
};

export default Login;
