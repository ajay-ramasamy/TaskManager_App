import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../auth.css"; // Changed to common CSS file

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("https://taskmanager-app-w2iz.onrender.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div className="auth-app">
      {/* Top Menu Section */}
      <header className="auth-top-menu">
        <div className="auth-menu-content">
          <div className="auth-logo-title">
            <div className="auth-logo">
              <img src="/todo.png" alt="TaskManager Logo" className="auth-logo-image" />
            </div>
            <h1 className="auth-app-title">TaskManager</h1>
          </div>
        </div>
      </header>

      {/* Register Section */}
      <section className="auth-main">
        <div className="auth-flex-center auth-paddings auth-main-container">
          <div className="auth-form-container">
            <h1 className="auth-title">Register</h1>
            
            {error && <div className="auth-error-message">{error}</div>}
            {success && <div className="auth-success-message">{success}</div>}
            
            <form onSubmit={handleSubmit} className="auth-form">
              <input
                type="text"
                name="username"
                placeholder="Enter Username"
                value={formData.username}
                onChange={handleChange}
                className="auth-input"
                required
                disabled={loading}
              />
              <input
                type="email"
                name="email"
                placeholder="Enter Email"
                value={formData.email}
                onChange={handleChange}
                className="auth-input"
                required
                disabled={loading}
              />
              <input
                type="password"
                name="password"
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleChange}
                className="auth-input"
                required
                disabled={loading}
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="auth-input"
                required
                disabled={loading}
              />
              <button 
                type="submit" 
                className="auth-button auth-button-primary"
                disabled={loading}
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </form>
            
            <p className="auth-toggle-text">
              Already have an account?{" "}
              <span className="auth-toggle-link" onClick={handleLoginClick}>
                login
              </span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Register;
