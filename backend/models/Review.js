const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, "Please add a rating"],
      min: 1,
      max: 5,
    },
    text: {
      type: String,
      required: [true, "Please add review text"],
      maxlength: [1000, "Review cannot be more than 1000 characters"],
    },
    image: {
      type: String,
    },
    tester: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
    },
    comments: [
      {
        text: {
          type: String,
          required: [true, "Please add comment text"],
          maxlength: [500, "Comment cannot be more than 500 characters"],
        },
        user: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Prevent user from submitting more than one review per product
ReviewSchema.index({ product: 1, tester: 1 }, { unique: true });

// Update product average rating after review is saved
ReviewSchema.post("save", async function () {
  await this.constructor.getAverageRating(this.product);
});

// Update product average rating after review is deleted
ReviewSchema.post("remove", async function () {
  await this.constructor.getAverageRating(this.product);
});

// Static method to get average rating
ReviewSchema.statics.getAverageRating = async function (productId) {
  const obj = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 },
      },
    },
  ]);

  try {
    const Product = mongoose.model("Product");

    if (obj.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        avgRating: Math.round(obj[0].avgRating * 10) / 10,
        totalRatings: obj[0].totalRatings,
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        avgRating: 0,
        totalRatings: 0,
      });
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = mongoose.model("Review", ReviewSchema);
