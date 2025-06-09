import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

// Create the context
const AuthContext = createContext();

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Load user data on initial load or token change
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/users/me");
        setUser(response.data.data);
        setError(null);
      } catch (err) {
        console.error("Failed to load user:", err);
        // If token is invalid, clear it
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        setError("Session expired. Please login again.");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Register a new user
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/users/register", userData);
      const { token } = response.data;

      // Save token to localStorage and state
      localStorage.setItem("token", token);
      setToken(token);

      // Load user data
      const userResponse = await api.get("/users/me");
      setUser(userResponse.data.data);

      navigate("/products");
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/users/login", { email, password });
      const { token } = response.data;

      // Save token to localStorage and state
      localStorage.setItem("token", token);
      setToken(token);

      // Load user data
      const userResponse = await api.get("/users/me");
      setUser(userResponse.data.data);

      navigate("/products");
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.put("/users/profile", profileData);
      setUser(response.data.data);
      setError(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const updatePassword = async (passwordData) => {
    setLoading(true);
    setError(null);

    try {
      await api.put("/users/password", passwordData);
      setError(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => setError(null);

  // Context value
  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    updatePassword,
    clearError,
    isAuthenticated: !!user,
    isMaker: user?.role === "Brand",
    isTester: user?.role === "User",
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
