import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../auth.css"; // Changed to common CSS file

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.username.trim() || !formData.password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Save token to localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        localStorage.setItem("email", data.email);
        
        // Redirect to home page
        navigate("/home");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    navigate("/register");
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

      {/* Login Section */}
      <section className="auth-main">
        <div className="auth-flex-center auth-paddings auth-main-container">
          <div className="auth-form-container">
            <h1 className="auth-title">Login</h1>
            
            {error && <div className="auth-error-message">{error}</div>}
            
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
                type="password"
                name="password"
                placeholder="Enter Password"
                value={formData.password}
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
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
            
            <p className="auth-toggle-text">
              Don't have an account?{" "}
              <span className="auth-toggle-link" onClick={handleRegisterClick}>
                register
              </span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;