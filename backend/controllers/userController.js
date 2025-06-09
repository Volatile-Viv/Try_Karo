const User = require("../models/User");
const { validationResult } = require("express-validator");
const Product = require("../models/Product");
const Review = require("../models/Review");

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create user
    user = await User.create({
      name,
      email,
      password,
      role: role || "tester",
    });

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      bio: req.body.bio,
    };

    if (req.body.avatar) {
      fieldsToUpdate.avatar = req.body.avatar;
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update password
// @route   PUT /api/users/password
// @access  Private
exports.updatePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.user.id).select("+password");

    // Check current password
    const isMatch = await user.matchPassword(req.body.currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get user insights for brand's products
// @route   GET /api/users/insights
// @access  Private (Brand only)
exports.getUserInsights = async (req, res) => {
  try {
    // Ensure user is a brand
    if (req.user.role !== 'Brand') {
      return res.status(403).json({
        success: false,
        message: 'Only brands can access user insights',
      });
    }

    // Get all products created by this brand
    const products = await Product.find({ maker: req.user.id });
    
    if (products.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          reviewCount: 0,
          averageRating: 0,
          ageDistribution: [],
          productPerformance: [],
          userInterests: []
        }
      });
    }

    // Get product IDs
    const productIds = products.map(product => product._id);

    // Get all reviews for these products
    const reviews = await Review.find({ product: { $in: productIds } })
      .populate({
        path: 'tester',
        select: 'name age gender interests'
      })
      .populate({
        path: 'product',
        select: 'title category'
      });

    // Calculate review metrics
    const reviewCount = reviews.length;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : 0;

    // Calculate age distribution from users who reviewed
    const ageDistribution = {};
    const userInterests = {};
    const genderDistribution = { 'Male': 0, 'Female': 0, 'Other': 0, 'Not Specified': 0 };

    reviews.forEach(review => {
      const user = review.tester;
      
      // Age distribution
      if (user && user.age) {
        const ageRange = getAgeRange(user.age);
        ageDistribution[ageRange] = (ageDistribution[ageRange] || 0) + 1;
      }

      // User interests
      if (user && user.interests && Array.isArray(user.interests)) {
        user.interests.forEach(interest => {
          userInterests[interest] = (userInterests[interest] || 0) + 1;
        });
      }

      // Gender distribution
      if (user && user.gender) {
        genderDistribution[user.gender] = (genderDistribution[user.gender] || 0) + 1;
      } else {
        genderDistribution['Not Specified'] = (genderDistribution['Not Specified'] || 0) + 1;
      }
    });

    // Calculate product performance
    const productPerformance = [];
    for (const product of products) {
      const productReviews = reviews.filter(review => 
        review.product._id.toString() === product._id.toString()
      );
      
      const avgRating = productReviews.length > 0 
        ? productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length 
        : 0;
      
      productPerformance.push({
        id: product._id,
        title: product.title,
        reviewCount: productReviews.length,
        averageRating: avgRating.toFixed(1),
        category: product.category
      });
    }

    // Return insights data
    res.status(200).json({
      success: true,
      data: {
        reviewCount,
        averageRating,
        ageDistribution: formatForChart(ageDistribution),
        genderDistribution: formatForChart(genderDistribution),
        productPerformance,
        userInterests: formatForChart(userInterests, 5)
      }
    });

  } catch (error) {
    console.error('Error fetching user insights:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user insights'
    });
  }
};

// Helper function to get age range
function getAgeRange(age) {
  if (age < 18) return 'Under 18';
  if (age < 25) return '18-24';
  if (age < 35) return '25-34';
  if (age < 45) return '35-44';
  if (age < 55) return '45-54';
  return '55+';
}

// Helper function to format data for charts
function formatForChart(data, limit = null) {
  const sortedEntries = Object.entries(data)
    .sort((a, b) => b[1] - a[1]);
  
  // If limit is provided, take only top N items
  const limitedEntries = limit ? sortedEntries.slice(0, limit) : sortedEntries;
  
  return limitedEntries.map(([label, value]) => ({
    label,
    value
  }));
}

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = exports;
