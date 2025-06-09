const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  updatePassword,
  getUserProfile,
  getUserInsights,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");

// @route   POST /api/users/register
// @desc    Register user
// @access  Public
router.post("/register", registerUser);

// @route   POST /api/users/login
// @desc    Login user & get token
// @access  Public
router.post("/login", loginUser);

// @route   GET /api/users/me
// @desc    Get current user
// @access  Private
router.get("/me", protect, getCurrentUser);

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get("/profile", protect, getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", protect, updateProfile);

// @route   PUT /api/users/password
// @desc    Update user password
// @access  Private
router.put("/password", protect, updatePassword);

// @route   GET /api/users/insights
// @desc    Get user insights
// @access  Private
router.get("/insights", protect, getUserInsights);

module.exports = router;
