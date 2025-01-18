import React, { useState } from "react";
import { loginUser } from "../api";
import "../css/Login.css"; // Import the CSS file for styling


const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
  
    try {
        const response = await loginUser(formData);
        console.log("Login response:", response); // Log the response for debugging
        localStorage.setItem("accessToken", response.access_token);
        localStorage.setItem("userType", response.user_type);
        setMessage("Login successful!");
        onLogin({ token: response.access_token, userType: response.user_type });
      } catch (error) {
        console.error("Login failed:", error); // Log the error details
        setMessage(error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
        {message && <p className="login-message">{message}</p>}
      </div>
    </div>
  );
};

export default Login;
