const { uploadImage } = require("../utils/cloudinary");

// @desc    Upload image to Cloudinary
// @route   POST /api/upload
// @access  Private
exports.uploadImageToCloud = async (req, res) => {
  try {
    if (!req.body.image) {
      return res.status(400).json({
        success: false,
        message: "Please provide an image",
      });
    }

    const result = await uploadImage(
      req.body.image,
      req.body.folder || "try-karo"
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Image upload failed",
    });
  }
};
