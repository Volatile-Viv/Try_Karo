const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary
 * @param {string} imageString - Base64 encoded image string
 * @param {string} folder - Folder name in Cloudinary
 * @returns {Promise<Object>} - Cloudinary upload response
 */
const uploadImage = async (imageString, folder = "try-karo") => {
  try {
    if (!imageString) {
      return null;
    }

    // Upload the image
    const result = await cloudinary.uploader.upload(imageString, {
      folder,
      use_filename: true,
      unique_filename: true,
    });

    return {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Image upload failed");
  }
};

module.exports = { uploadImage, cloudinary };
