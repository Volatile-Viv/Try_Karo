import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import PropTypes from "prop-types";
import { CATEGORIES, STATUSES } from "../services/api";
import { CURRENCIES } from "../context/CurrencyContext";

const ProductForm = ({ initialData, onSubmit, isLoading, error }) => {
  const navigate = useNavigate();
  const isEditMode = !!initialData?._id;

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category: initialData?.category || "web-app",
    link: initialData?.link || "",
    image: initialData?.image || "",
    status: initialData?.status || "live",
    tags: initialData?.tags ? initialData.tags.join(", ") : "",
    price: initialData?.price || 0,
    currency: initialData?.currency || "USD",
    inventory: initialData?.inventory || 0,
    manageInventory:
      initialData?.manageInventory !== undefined
        ? initialData.manageInventory
        : true,
    inStock: initialData?.inStock !== undefined ? initialData.inStock : true,
  });

  // Initialize form with initial data when available
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        category: initialData.category || "",
        link: initialData.link || "",
        image: initialData.image || "",
        status: initialData.status || "live",
        tags: initialData.tags ? initialData.tags.join(", ") : "",
        price: initialData.price?.toString() || "0",
        currency: initialData.currency || "INR",
        inventory: initialData.inventory?.toString() || "",
        stock: initialData.stock?.toString() || "0",
        manageInventory: initialData.manageInventory !== false,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Process tags from comma-separated string to array
    const processedData = {
      ...formData,
      tags: formData.tags
        ? formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
    };

    // Handle inventory and stock
    if (formData.manageInventory) {
      if (formData.inventory) {
        processedData.inventory = parseInt(formData.inventory);
      }
    } else {
      // If not managing inventory, set high value to indicate unlimited
      processedData.inventory = 9999;
    }

    // Set inStock based on inventory levels
    processedData.inStock = parseInt(processedData.inventory) > 0;

    onSubmit(processedData);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditMode ? "Edit Product" : "Add New Product"}
      </h1>

      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-500 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Product Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter product title"
            required
            maxLength={100}
          />
          <p className="mt-1 text-xs text-gray-500">Max 100 characters</p>
        </div>

        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            rows="5"
            value={formData.description}
            onChange={handleChange}
            className="form-input"
            placeholder="Describe your product..."
            required
            maxLength={2000}
          ></textarea>
          <p className="mt-1 text-xs text-gray-500">
            Max 2000 characters. Be detailed about what your product does and
            what kind of feedback you're looking for.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-input"
              required
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status === "live"
                    ? "Live"
                    : status === "in-testing"
                    ? "In Testing"
                    : "Closed"}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Products marked as "Closed" will not accept new reviews
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="link"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Testing Link *
          </label>
          <input
            type="url"
            id="link"
            name="link"
            value={formData.link}
            onChange={handleChange}
            className="form-input"
            placeholder="https://yourdomain.com"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Provide a link where testers can try your product
          </p>
        </div>

        <div className="mb-4">
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Image URL
          </label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className="form-input"
            placeholder="https://example.com/image.jpg"
          />
          <p className="mt-1 text-xs text-gray-500">
            Provide a URL for a product image or screenshot
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Product Price
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="form-input"
              placeholder="0"
              min="0"
              step="0.01"
            />
            <p className="mt-1 text-xs text-gray-500">
              Set your product price (enter 0 for free trial products)
            </p>
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="currency"
            >
              Currency
            </label>
            <div className="mt-1">
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center mb-2">
            <input
              id="manageInventory"
              name="manageInventory"
              type="checkbox"
              checked={formData.manageInventory}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label
              htmlFor="manageInventory"
              className="ml-2 block text-gray-700 text-sm font-bold"
            >
              Manage Inventory & Stock
            </label>
          </div>

          {formData.manageInventory && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="inventory"
                >
                  Inventory
                </label>
                <input
                  type="number"
                  id="inventory"
                  name="inventory"
                  value={formData.inventory}
                  onChange={handleChange}
                  min="0"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Maximum items available overall"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Total items you plan to sell (optional)
                </p>
              </div>
            </div>
          )}

          {!formData.manageInventory && (
            <p className="mt-1 text-xs text-gray-500">
              Stock will be set to unlimited
            </p>
          )}
        </div>

        <div className="mb-6">
          <label
            htmlFor="tags"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tags
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="form-input"
            placeholder="react, web app, productivity"
          />
          <p className="mt-1 text-xs text-gray-500">
            Comma-separated tags to help users find your product
          </p>
        </div>

        <div className="flex justify-between">
          <Link
            to={isEditMode ? `/products/${initialData._id}` : "/products"}
            className="btn btn-outline"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? "Saving..." : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

ProductForm.propTypes = {
  initialData: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    category: PropTypes.string,
    link: PropTypes.string,
    image: PropTypes.string,
    status: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    price: PropTypes.number,
    currency: PropTypes.string,
    inventory: PropTypes.number,
    manageInventory: PropTypes.bool,
    inStock: PropTypes.bool,
  }),
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
};

export default ProductForm;
