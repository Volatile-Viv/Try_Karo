const express = require("express");
const { check } = require("express-validator");
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getUserProducts,
  updateInventory,
} = require("../controllers/productController");
const { getReviews, createReview } = require("../controllers/reviewController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get("/", (req, res, next) => {
  console.log("GET /api/products request received", {
    query: req.query,
    headers: req.headers,
    method: req.method,
  });

  // Call the actual controller
  getProducts(req, res, next);
});

// @route   GET /api/products/user
// @desc    Get products created by current user
// @access  Private
router.get("/user", protect, getUserProducts);

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get("/:id", getProduct);

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Brand)
router.post(
  "/",
  [
    check("title", "Title is required").not().isEmpty(),
    check("description", "Description is required").not().isEmpty(),
    check("category", "Category is required").not().isEmpty(),
    check("link", "Testing link is required").not().isEmpty(),
  ],
  protect,
  authorize("Brand", "admin"),
  createProduct
);

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Product owner or Admin)
router.put("/:id", protect, updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Product owner or Admin)
router.delete("/:id", protect, deleteProduct);

// @route   PUT /api/products/:id/inventory
// @desc    Update product inventory
// @access  Private (Product owner or Admin)
router.put("/:id/inventory", protect, updateInventory);

// @route   PUT /api/products/:id/checkout
// @desc    Update product inventory during checkout (any authenticated user)
// @access  Private
router.put("/:id/checkout", protect, (req, res) => {
  req.isCheckout = true; // Flag to bypass owner authorization
  updateInventory(req, res);
});

// Review routes

// @route   GET /api/products/:productId/reviews
// @desc    Get reviews for a product
// @access  Public
router.get("/:productId/reviews", getReviews);

// @route   POST /api/products/:productId/reviews
// @desc    Create a review
// @access  Private (Tester role only)
router.post(
  "/:productId/reviews",
  [
    check("rating", "Rating is required and must be between 1-5")
      .not()
      .isEmpty()
      .isInt({ min: 1, max: 5 }),
    check("text", "Review text is required").not().isEmpty(),
  ],
  protect,
  authorize("Tester"),
  createReview
);

module.exports = router;
