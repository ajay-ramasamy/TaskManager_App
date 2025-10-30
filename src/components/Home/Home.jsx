import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [username, setUsername] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskName, setEditingTaskName] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [togglingTaskId, setTogglingTaskId] = useState(null); // Track which task is being toggled

  const navigate = useNavigate();

  // Use proxy URL - this will be handled by vite.config.js
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

  // Enhanced fetch wrapper with error handling
  const apiFetch = async (url, options = {}) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (response.status === 401 || response.status === 403) {
        // Clear stored authentication
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        // Redirect to login
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API fetch error:', error);
      throw error;
    }
  };

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUsername = localStorage.getItem("username");
    
    if (!token) {
      navigate("/login");
      return;
    }
    
    if (savedUsername) {
      setUsername(savedUsername);
    }
    
    fetchTasks();
  }, [navigate]);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");
      
      const tasksData = await apiFetch(`${API_BASE}/tasks`);
      const actualTasks = tasksData.tasks || tasksData.data || tasksData;
      setTasks(actualTasks);
    } catch (error) {
      console.error("❌ Error fetching tasks:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add new task
  const handleAddTask = async () => {
    if (newTask.trim() === "") return;

    try {
      setError("");
      await apiFetch(`${API_BASE}/tasks`, {
        method: "POST",
        body: JSON.stringify({
          name: newTask,
          description: "",
          completed: false,
          dueDate: new Date().toISOString().split('T')[0]
        })
      });
      
      setNewTask("");
      fetchTasks();
    } catch (error) {
      setError(error.message);
      console.error("Error adding task:", error);
    }
  };

  // Toggle task completion - FIXED VERSION
  const handleToggleTask = async (taskId, currentCompleted) => {
    try {
      setError("");
      setTogglingTaskId(taskId);
      
      // Optimistically update the UI
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, completed: !currentCompleted }
            : task
        )
      );

      // Use PUT to update the task
      const taskToUpdate = tasks.find(task => task.id === taskId);
      await apiFetch(`${API_BASE}/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify({
          ...taskToUpdate,
          completed: !currentCompleted
        })
      });
      
      // Refresh tasks to ensure sync with server
      await fetchTasks();
      
    } catch (error) {
      // Only revert if it's not an auth error (auth error is handled in apiFetch)
      if (!error.message.includes('Session expired')) {
        // Revert optimistic update on error
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId 
              ? { ...task, completed: currentCompleted }
              : task
          )
        );
        setError("Failed to update task. " + error.message);
      }
      console.error("Error toggling task:", error);
    } finally {
      setTogglingTaskId(null);
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    try {
      setError("");
      await apiFetch(`${API_BASE}/tasks/${taskId}`, {
        method: "DELETE"
      });
      
      fetchTasks();
    } catch (error) {
      setError(error.message);
      console.error("Error deleting task:", error);
    }
  };

  // Update task
  const handleUpdateTask = async (taskId) => {
    if (editingTaskName.trim() === "") return;

    try {
      setError("");
      const taskToUpdate = tasks.find(task => task.id === taskId);
      await apiFetch(`${API_BASE}/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editingTaskName,
          description: taskToUpdate?.description || "",
          completed: taskToUpdate?.completed || false,
          dueDate: taskToUpdate?.dueDate || new Date().toISOString().split('T')[0]
        })
      });
      
      setEditingTaskId(null);
      setEditingTaskName("");
      fetchTasks();
    } catch (error) {
      setError(error.message);
      console.error("Error updating task:", error);
    }
  };

  // Start editing task
  const handleStartEdit = (task) => {
    setEditingTaskId(task.id);
    setEditingTaskName(task.name || task.title || "");
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingTaskName("");
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    navigate("/login");
  };

  // Filter tasks based on active filter
  const filteredTasks = tasks.filter(task => {
    if (activeFilter === "completed") return task.completed;
    if (activeFilter === "incompleted") return !task.completed;
    return true;
  });

  // Handle Enter key press for adding tasks
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowProfileDropdown(false);
    };

    if (showProfileDropdown) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showProfileDropdown]);

  return (
    <div className="app">
      {/* Top Menu Section */}
      <header className="top-menu">
        <div className="menu-content">
          <div className="left-section">
            <div className="logo-title">
              <div className="logo">
                <img src="/todo.png" alt="TaskManager Logo" className="logo-image" />
              </div>
              <h1 className="app-title">TaskManager</h1>
            </div>
          </div>
          <div className="right-section">
            <span className="username">Welcome, {username}</span>
            <div 
              className="profile-icon" 
              onClick={(e) => {
                e.stopPropagation();
                setShowProfileDropdown(!showProfileDropdown);
              }}
            >
              👤
            </div>
            
            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <div className="profile-dropdown">
                <div className="dropdown-item user-info">
                  <div className="user-name">{username}</div>
                  <div className="user-email">{localStorage.getItem("email") || "user@example.com"}</div>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout-btn" onClick={handleLogout}>
                  <span className="logout-icon">🚪</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Section */}
      <section className="home-main">
        <div className="home-container">
          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
              {error.includes("CORS") && (
                <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Please make sure the backend server is running and check vite.config.js proxy configuration.
                </div>
              )}
            </div>
          )}

          {/* Filter Section */}
          <div className="filter-section">
            <button 
              className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
              onClick={() => setActiveFilter("all")}
            >
              All
            </button>
            <button 
              className={`filter-btn ${activeFilter === "completed" ? "active" : ""}`}
              onClick={() => setActiveFilter("completed")}
            >
              Completed
            </button>
            <button 
              className={`filter-btn ${activeFilter === "incompleted" ? "active" : ""}`}
              onClick={() => setActiveFilter("incompleted")}
            >
              Incomplete
            </button>
          </div>

          {/* Tasks List */}
          <div className="tasks-section">
            <h2 className="tasks-title">My Tasks</h2>
            
            {loading ? (
              <div className="loading">Loading tasks...</div>
            ) : (
              <div className="tasks-list">
                {filteredTasks.length === 0 ? (
                  <p className="no-tasks">
                    {tasks.length === 0 ? "No tasks found. Create your first task!" : "No tasks match the current filter."}
                  </p>
                ) : (
                  filteredTasks.map(task => (
                    <div key={task.id} className={`task-item ${task.completed ? "completed" : ""}`}>
                      <div className="task-left">
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            checked={task.completed || false}
                            onChange={() => handleToggleTask(task.id, task.completed)}
                            className="task-checkbox"
                            disabled={togglingTaskId === task.id}
                          />
                          {togglingTaskId === task.id && (
                            <div className="checkbox-loading"></div>
                          )}
                        </div>
                        <div className="task-details">
                          {editingTaskId === task.id ? (
                            <div className="edit-task">
                              <input
                                type="text"
                                value={editingTaskName}
                                onChange={(e) => setEditingTaskName(e.target.value)}
                                className="edit-input"
                                autoFocus
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    handleUpdateTask(task.id);
                                  } else if (e.key === "Escape") {
                                    handleCancelEdit();
                                  }
                                }}
                              />
                              <div className="edit-actions">
                                <button 
                                  className="save-btn"
                                  onClick={() => handleUpdateTask(task.id)}
                                >
                                  Save
                                </button>
                                <button 
                                  className="cancel-btn"
                                  onClick={handleCancelEdit}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <span className={`task-name ${task.completed ? "completed" : ""}`}>
                                {task.name || task.title || "Unnamed Task"}
                              </span>
                              <span className="task-date">
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                              </span>
                              {task.description && (
                                <span className="task-description">
                                  {task.description}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      {editingTaskId !== task.id && (
                        <div className="task-actions">
                          <button 
                            className="update-btn"
                            onClick={() => handleStartEdit(task)}
                          >
                            Update
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Add Task Section - Fixed at bottom */}
          <div className="add-task-section fixed-bottom">
            <input
              type="text"
              placeholder="Enter new task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={handleKeyPress}
              className="task-input"
              disabled={loading}
            />
            <button 
              className="add-btn" 
              onClick={handleAddTask}
              disabled={loading || newTask.trim() === ""}
            >
              {loading ? "Adding..." : "Add Task"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;