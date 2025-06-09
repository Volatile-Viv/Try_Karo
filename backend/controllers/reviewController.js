const Review = require("../models/Review");
const Product = require("../models/Product");
const { validationResult } = require("express-validator");

// @desc    Get reviews for a product
// @route   GET /api/products/:productId/reviews
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate({
        path: "tester",
        select: "name avatar",
      })
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get a single review
// @route   GET /api/reviews/:id
// @access  Public
exports.getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate({
        path: "tester",
        select: "name avatar",
      })
      .populate({
        path: "product",
        select: "title image",
      });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error(error);

    // Check if error is due to invalid ObjectId
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Create a review
// @route   POST /api/products/:productId/reviews
// @access  Private (Users only)
exports.createReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if product exists
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if product is in active status
    if (product.status === "closed") {
      return res.status(400).json({
        success: false,
        message: "This product is no longer accepting reviews",
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: req.params.productId,
      tester: req.user.id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    // Create review
    const reviewData = {
      rating: req.body.rating,
      text: req.body.text,
      tester: req.user.id,
      product: req.params.productId,
    };

    if (req.body.image) {
      reviewData.image = req.body.image;
    }

    const review = await Review.create(reviewData);

    // Populate tester info before returning
    const populatedReview = await Review.findById(review._id).populate({
      path: "tester",
      select: "name avatar",
    });

    res.status(201).json({
      success: true,
      data: populatedReview,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (Review owner only)
exports.updateReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Make sure user is review owner
    if (review.tester.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this review",
      });
    }

    // Update fields
    const fieldsToUpdate = {
      rating: req.body.rating,
      text: req.body.text,
    };

    if (req.body.image) {
      fieldsToUpdate.image = req.body.image;
    }

    review = await Review.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    }).populate({
      path: "tester",
      select: "name avatar",
    });

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Review owner or Admin)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Make sure user is review owner or admin
    if (review.tester.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this review",
      });
    }

    await review.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Add comment to a review
// @route   POST /api/reviews/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Create new comment
    const newComment = {
      text: req.body.text,
      user: req.user.id,
    };

    // Add comment to review
    review.comments.unshift(newComment);

    // Save review
    await review.save();

    // Return updated review with populated comments
    const updatedReview = await Review.findById(req.params.id)
      .populate({
        path: "tester",
        select: "name avatar",
      })
      .populate({
        path: "comments.user",
        select: "name avatar role",
      });

    res.status(200).json({
      success: true,
      data: updatedReview,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Delete comment from a review
// @route   DELETE /api/reviews/:id/comments/:commentId
// @access  Private (Comment owner, Review owner, or Admin)
exports.deleteComment = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Find comment
    const comment = review.comments.find(
      (comment) => comment._id.toString() === req.params.commentId
    );

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if user is comment owner, review owner, or admin
    if (
      comment.user.toString() !== req.user.id &&
      review.tester.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment",
      });
    }

    // Remove comment
    review.comments = review.comments.filter(
      (comment) => comment._id.toString() !== req.params.commentId
    );

    // Save review
    await review.save();

    // Return updated review
    const updatedReview = await Review.findById(req.params.id)
      .populate({
        path: "tester",
        select: "name avatar",
      })
      .populate({
        path: "comments.user",
        select: "name avatar role",
      });

    res.status(200).json({
      success: true,
      data: updatedReview,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get comments for a review
// @route   GET /api/reviews/:id/comments
// @access  Public
exports.getComments = async (req, res) => {
  // ... existing code ...
};

// @desc    Get all reviews written by the logged in user
// @route   GET /api/reviews/me
// @access  Private
exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ tester: req.user.id })
      .populate({
        path: "product",
        select: "title images category status makerName",
      })
      .sort("-createdAt");

    // Make sure reviews have valid product data
    const validReviews = reviews.filter((review) => review.product);

    res.status(200).json({
      success: true,
      count: validReviews.length,
      data: validReviews,
    });
  } catch (error) {
    console.error("Error in getUserReviews:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
