import axios from "axios";

// Using the full URL to the API for direct connection
const API_URL = "http://localhost:8000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Ensure credentials (cookies, auth headers) are sent with requests
  withCredentials: true,
  // Add longer timeout for slower connections
  timeout: 15000,
});

// Add auth token to requests if available
api.interceptors.request.use(
  (config) => {
    // Show request in console during development
    console.log(
      `API Request: ${config.method.toUpperCase()} ${config.baseURL}${
        config.url
      }`,
      config.params || {}
    );

    const token = localStorage.getItem("token");
    if (token) {
      // Set Authorization header with Bearer token for all requests
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Adding auth token to request");
    } else {
      console.log("No auth token available");
    }
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log(`API Response [${response.status}]:`, response.data);
    return response;
  },
  (error) => {
    // Log failed responses
    console.error("API Error Response:", error);
    if (error.response) {
      console.error(`Status: ${error.response.status}`, error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.request);
    }
    return Promise.reject(error);
  }
);

// Products API
export const getProducts = async (params) => {
  try {
    console.log("Fetching products with params:", params);
    const response = await api.get("/products", { params });

    // Add safety checks
    if (!response.data || !response.data.success) {
      console.error("Invalid response format from getProducts", response);
      return { data: { data: [] } };
    }

    return response.data;
  } catch (error) {
    console.error("Error in getProducts:", error);
    // Return empty data instead of throwing to prevent UI crashes
    return { success: false, data: { data: [] } };
  }
};

export const getProduct = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error fetching product" };
  }
};

export const createProduct = async (productData) => {
  try {
    // Log the token for debugging
    const token = localStorage.getItem("token");
    console.log(
      "Token used for product creation:",
      token ? "Token exists" : "No token"
    );

    // Make the API call
    const response = await api.post("/products", productData);
    console.log("Product creation response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in createProduct:", error);
    if (error.response) {
      // Server responded with an error
      console.error("Server response:", error.response.data);
      throw error.response.data || { message: "Error creating product" };
    } else if (error.request) {
      // No response received
      console.error("No response from server:", error.request);
      throw { message: "Server not responding. Please try again later." };
    } else {
      // Request setup error
      throw { message: error.message || "Error creating product" };
    }
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error updating product" };
  }
};

export const updateProductInventory = async (id, quantity) => {
  try {
    const response = await api.put(`/products/${id}/checkout`, { quantity });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Error updating product inventory" }
    );
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error deleting product" };
  }
};

// Reviews API
export const getProductReviews = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}/reviews`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error fetching reviews" };
  }
};

export const getUserReviews = async () => {
  try {
    const response = await api.get("/reviews/me");

    // Add safety checks for the response
    if (!response.data || !response.data.success) {
      console.error("Invalid response format from getUserReviews", response);
      return { data: [] };
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    // Return empty data instead of throwing to prevent UI crashes
    return { success: false, count: 0, data: [] };
  }
};

export const createReview = async (productId, reviewData) => {
  try {
    // Log the token for debugging
    const token = localStorage.getItem("token");
    console.log(
      "Token used for review creation:",
      token ? "Token exists" : "No token"
    );
    console.log("Creating review for product:", productId);
    console.log("Review data:", reviewData);

    const response = await api.post(
      `/products/${productId}/reviews`,
      reviewData
    );
    console.log("Review created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in createReview:", error);
    if (error.response) {
      // Server responded with an error
      console.error("Server response:", error.response.data);
      throw error.response.data || { message: "Error creating review" };
    } else if (error.request) {
      // No response received
      console.error("No response from server:", error.request);
      throw { message: "Server not responding. Please try again later." };
    } else {
      // Request setup error
      throw { message: error.message || "Error creating review" };
    }
  }
};

// Users API
export const registerUser = async (userData) => {
  try {
    const response = await api.post("/users/register", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error registering user" };
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/users/login", credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error logging in" };
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get("/users/me");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error fetching user data" };
  }
};

export const getUserProducts = async () => {
  try {
    const response = await api.get("/products/user");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error fetching user products" };
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put("/users/profile", profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error updating profile" };
  }
};

export const updateUserPassword = async (passwordData) => {
  try {
    const response = await api.put("/users/password", passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error updating password" };
  }
};

// Get user insights
export const getUserInsights = async () => {
  try {
    const response = await api.get("/users/insights");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error fetching user insights" };
  }
};

// Categories for the filter
export const CATEGORIES = [
  "web-app",
  "mobile-app",
  "saas",
  "design",
  "game",
  "ai",
  "productivity",
  "e-commerce",
  "Food",
  "Beverage",
  "Travel",
  "other",
];

// Status options for the filter
export const STATUSES = ["live", "in-testing", "closed"];

export default api;
