import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useCart } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const ProductCard = ({ product, isBrand, isOwnProduct }) => {
  const { addToCart, removeFromCart, isInCart } = useCart();
  const { formatPrice } = useCurrency();
  const { isAuthenticated } = useAuth();
  const [addedToCart, setAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showQuantity, setShowQuantity] = useState(false);

  // Default image if not provided
  const imageUrl =
    product.image || "https://via.placeholder.com/300x200?text=No+Image";

  // Check if product is a trial product (price is 0)
  const isTrialProduct = parseFloat(product.price) === 0;

  // Check if product is out of stock
  // If manageInventory is false, use the inStock flag directly
  // Otherwise check stock or inventory values (prioritize inventory if present)
  const availableStock =
    product.inventory !== undefined ? product.inventory : product.stock;
  const isOutOfStock = product.manageInventory
    ? availableStock <= 0
    : !product.inStock;

  // Handle add to cart
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      // Navigate to login if not authenticated
      window.location.href = "/login";
      return;
    }

    // Don't allow adding if out of stock
    if (isOutOfStock) {
      return;
    }

    const success = addToCart(product, quantity);

    if (success) {
      setAddedToCart(true);
      setShowQuantity(false);

      // Reset added to cart status after 1.5 seconds
      setTimeout(() => {
        setAddedToCart(false);
      }, 1500);
    }
  };

  // Handle remove from cart
  const handleRemoveFromCart = () => {
    removeFromCart(product._id);
  };

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      // If inventory is managed, don't allow more than available
      if (product.manageInventory && value > availableStock) {
        setQuantity(availableStock);
      } else {
        setQuantity(value);
      }
    }
  };

  // Toggle quantity selector
  const toggleQuantity = () => {
    if (!isAuthenticated || isOutOfStock || isInCart(product._id)) {
      return;
    }
    setShowQuantity(!showQuantity);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
      <div className="relative">
        <Link to={`/products/${product._id}`}>
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-48 object-cover"
          />
          <div
            className={`absolute top-0 left-0 px-3 py-1 rounded-br-lg font-medium text-sm
            ${
              isOwnProduct
                ? "bg-green-600 text-white"
                : "bg-blue-600 text-white"
            }`}
          >
            {isOwnProduct
              ? "Your Trial Product"
              : isTrialProduct
              ? "Trial Product"
              : "Product"}
          </div>

          {isOutOfStock && (
            <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-lg font-medium text-sm bg-red-600 text-white animate-pulse">
              Out of Stock
            </div>
          )}
        </Link>
      </div>
      <div className="p-4">
        <Link to={`/products/${product._id}`} className="block">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 truncate">
              {product.title}
            </h3>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                product.status === "live"
                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300"
                  : product.status === "in-testing"
                  ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300"
                  : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300"
              }`}
            >
              {product.status}
            </span>
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>

          <div className="flex justify-between items-center">
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {product.category}
            </span>
            {product.avgRating > 0 ? (
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <span className="ml-1 text-sm text-gray-600">
                  {product.avgRating.toFixed(1)}
                </span>
                <span className="ml-1 text-xs text-gray-500">
                  ({product.totalRatings})
                </span>
              </div>
            ) : (
              <span className="text-xs text-gray-500">No ratings</span>
            )}
          </div>

          {/* Display inventory information if managed */}
          {product.manageInventory ? (
            <div className="mt-2 text-sm">
              <span
                className={
                  isOutOfStock
                    ? "text-red-600 dark:text-red-400 font-medium"
                    : availableStock < 10
                    ? "text-orange-600 dark:text-orange-400 font-medium"
                    : "text-gray-600 dark:text-gray-400"
                }
              >
                {isOutOfStock
                  ? "Out of Stock"
                  : availableStock < 10
                  ? `Only ${availableStock} left in stock!`
                  : `${availableStock} in stock`}
              </span>

              {availableStock > 0 && availableStock < 10 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300 animate-pulse">
                  Low Stock
                </span>
              )}
            </div>
          ) : (
            product.inventory > 0 && (
              <div className="mt-2 text-sm">
                <span className="text-green-600 dark:text-green-400 font-medium">
                  In Stock
                </span>
              </div>
            )
          )}

          {product.maker && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center">
              <img
                src={
                  product.maker.avatar ||
                  "https://via.placeholder.com/40?text=M"
                }
                alt={product.maker.name}
                className="w-6 h-6 rounded-full mr-2"
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                By {isOwnProduct ? "You" : product.maker.name}
              </span>
            </div>
          )}
        </Link>

        {/* Price and Add to Cart section */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          {isAuthenticated ? (
            <div>
              {showQuantity ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max={product.manageInventory ? availableStock : undefined}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || isInCart(product._id)}
                    className={`flex-1 py-2 px-4 rounded ${
                      isInCart(product._id)
                        ? "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                        : isOutOfStock
                        ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    {isInCart(product._id)
                      ? "Already in Cart"
                      : isOutOfStock
                      ? "Out of Stock"
                      : "Add to Cart"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={toggleQuantity}
                  disabled={isOutOfStock || isInCart(product._id)}
                  className={`w-full py-2 px-4 rounded ${
                    isInCart(product._id)
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                      : isOutOfStock
                      ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {isInCart(product._id)
                    ? "Already in Cart"
                    : isOutOfStock
                    ? "Out of Stock"
                    : "Add to Cart"}
                </button>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="block w-full py-2 px-4 text-center bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Login to Add to Cart
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    image: PropTypes.string,
    category: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    avgRating: PropTypes.number,
    totalRatings: PropTypes.number,
    stock: PropTypes.number,
    inventory: PropTypes.number,
    inStock: PropTypes.bool,
    manageInventory: PropTypes.bool,
    maker: PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
      avatar: PropTypes.string,
    }),
    currency: PropTypes.string,
  }).isRequired,
  isBrand: PropTypes.bool,
  isOwnProduct: PropTypes.bool,
};

export default ProductCard;
