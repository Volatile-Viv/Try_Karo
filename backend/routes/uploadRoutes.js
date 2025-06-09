const express = require("express");
const { uploadImageToCloud } = require("../controllers/uploadController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/upload
// @desc    Upload image to Cloudinary
// @access  Private
router.post("/", protect, uploadImageToCloud);

module.exports = router;
