import React, { useState } from "react";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user"
  });

  const [message, setMessage] = useState("");

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
        "http://localhost:5000/api/auth/register",
        formData
      );

      setMessage(res.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error occurred");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Register</h2>

      {message && <div className="alert alert-info">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Username"
            name="username"
            onChange={handleChange}
            required
          />
        </div>

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

        <div className="mb-3">
          <select
            className="form-control"
            name="role"
            onChange={handleChange}
          >
            <option value="user">User</option>
            <option value="restaurant">Restaurant</option>
          </select>
        </div>

        <button className="btn btn-primary">Register</button>
      </form>
    </div>
  );
};

export default Register;
