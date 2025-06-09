const express = require("express");
const { check } = require("express-validator");
const {
  getReview,
  updateReview,
  deleteReview,
  addComment,
  deleteComment,
  getUserReviews,
} = require("../controllers/reviewController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/reviews/me
// @desc    Get all reviews by logged in user
// @access  Private
router.get("/me", protect, getUserReviews);

// @route   GET /api/reviews/:id
// @desc    Get a single review
// @access  Public
router.get("/:id", getReview);

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private (Review owner only)
router.put(
  "/:id",
  [
    check("rating", "Rating is required and must be between 1-5")
      .optional()
      .isInt({ min: 1, max: 5 }),
    check("text", "Review text is required").optional().not().isEmpty(),
  ],
  protect,
  updateReview
);

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private (Review owner or Admin)
router.delete("/:id", protect, deleteReview);

// @route   POST /api/reviews/:id/comments
// @desc    Add comment to a review
// @access  Private
router.post(
  "/:id/comments",
  [check("text", "Comment text is required").not().isEmpty()],
  protect,
  addComment
);

// @route   DELETE /api/reviews/:id/comments/:commentId
// @desc    Delete comment from a review
// @access  Private (Comment owner, Review owner, or Admin)
router.delete("/:id/comments/:commentId", protect, deleteComment);

module.exports = router;
