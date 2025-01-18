import React, { useState } from "react";
import { registerUser } from "../api";
import "../css/Register.css"; // Import the CSS file for styling

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    user_type: "",
    organization_name: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(formData);
      setMessage("Registration successful!");
    } catch (error) {
      setMessage(error);
    }
  };

  return (
    <div className="register-page">
      <h2 className="register-title">Create an Account</h2>
      <div className="register-form-container">
        <form onSubmit={handleSubmit} className="register-form">
          <input
            type="text"
            name="name"
            placeholder="Name"
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />
          <select name="user_type" onChange={handleChange} required>
            <option value="">Select User Type</option>
            <option value="individual">Individual</option>
            <option value="university_club">University Club</option>
            <option value="company">Company</option>
            <option value="ministry">Ministry</option>
          </select>
          {formData.user_type === "company" && (
            <input
              type="text"
              name="organization_name"
              placeholder="Organization Name"
              onChange={handleChange}
            />
          )}
          {formData.user_type === "university_club" && (
            <input
              type="text"
              name="club_name"
              placeholder="Club Name"
              onChange={handleChange}
            />
          )}
          <button type="submit">Register</button>
        </form>
        {message && <p className="register-message">{message}</p>}
      </div>
    </div>
  );
};

export default Register;
