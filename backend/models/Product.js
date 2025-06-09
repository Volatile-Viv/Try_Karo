const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
      maxlength: [2000, "Description cannot be more than 2000 characters"],
    },
    image: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: [true, "Please specify a category"],
      enum: [
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
      ],
    },
    link: {
      type: String,
      required: [true, "Please add a testing link"],
      match: [
        /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/,
        "Please add a valid URL",
      ],
    },
    status: {
      type: String,
      enum: ["live", "in-testing", "closed"],
      default: "live",
    },
    tags: [String],
    maker: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    avgRating: {
      type: Number,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot be more than 5"],
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Please add a price"],
      min: [0, "Price cannot be negative"],
    },
    currency: {
      type: String,
      required: [true, "Please specify a currency"],
      default: "INR",
      enum: ["USD", "EUR", "GBP", "INR", "JPY", "CAD", "AUD"],
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    inventory: {
      type: Number,
      required: [true, "Please specify the inventory quantity"],
      min: [0, "Inventory cannot be negative"],
      default: 0,
    },
    manageInventory: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field for reviews
ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false,
});

// Add a pre-save hook to update inStock based on inventory level
ProductSchema.pre("save", function (next) {
  // If inventory is 0 or less, product is not in stock
  this.inStock = this.inventory > 0;
  next();
});

// Cascade delete reviews when a product is deleted
ProductSchema.pre("remove", async function (next) {
  await this.model("Review").deleteMany({ product: this._id });
  next();
});

module.exports = mongoose.model("Product", ProductSchema);
