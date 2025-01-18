import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Events from "./components/Events";
import "./App.css";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userType = localStorage.getItem("userType");
    if (token && userType) {
      setUser({ token, userType });
    }
  }, []);

  // Handle login
  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userType");
    setUser(null);
  };

  return (
    <Router>
      <div>
        <nav className="navbar">
          <h1>Reforestation Platform</h1>
          {user ? (
            <div>
              <a href="/events">Events</a>
              <button onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <div>
              <a href="/login">Login</a>
              <a href="/register">Register</a>
            </div>
          )}
        </nav>
        <Routes>
          <Route
            path="/"
            element={
              user ? <Dashboard user={user} /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/login"
            element={
              user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
            }
          />
          <Route
            path="/events"
            element={user ? <Events /> : <Navigate to="/events" replace />}
          />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<h2>Page Not Found</h2>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
