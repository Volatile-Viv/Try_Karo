import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } =
    useCart();
  const { isAuthenticated, user } = useAuth();
  const { convertProductPrice, formatPrice, currency } = useCurrency();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is a brand
  const isBrand = isAuthenticated && user?.role === "Brand";

  // Initialize cart data and handle redirects
  useEffect(() => {
    const initializeCart = async () => {
      try {
        if (!isAuthenticated) {
          navigate("/login", {
            state: {
              from: "/cart",
              message: "Please log in to access your cart",
            },
          });
        } else if (isBrand) {
          navigate("/brand/dashboard", {
            state: {
              message:
                "Brands do not have access to shopping cart functionality",
            },
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeCart();
  }, [isAuthenticated, isBrand, navigate]);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    updateQuantity(productId, parseInt(newQuantity));
  };

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not authenticated or is a brand, show nothing (will redirect in useEffect)
  if (!isAuthenticated || isBrand) {
    return null;
  }

  // Calculate subtotal using original prices without any conversion
  const subtotal = cartItems.reduce((total, item) => {
    // Get price based on currency - convert USD to INR if needed
    const itemPrice =
      parseFloat(item.price) > 0
        ? item.currency === "USD"
          ? convertProductPrice(parseFloat(item.price), "USD")
          : parseFloat(item.price)
        : 0;
    return total + itemPrice * item.quantity;
  }, 0);

  // No need for separate original total as we're always using original prices
  const hasItemsWithPrice = cartItems.some(
    (item) => parseFloat(item.price) > 0
  );

  // Function to format prices specifically as INR
  const formatINR = (price) => {
    if (price === 0 || !price) return "Free";

    const formattedAmount = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

    // Ensure ₹ symbol is displayed correctly
    return formattedAmount.replace(/INR/, "₹");
  };

  return (
    <div className="max-w-full mx-auto px-2 sm:px-3 py-2 sm:py-4 w-full overflow-x-hidden">
      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-4 sm:py-6">
          <svg
            className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 dark:text-gray-500 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            ></path>
          </svg>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mb-4 text-center max-w-md">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm sm:text-base font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg
              className="mr-2 -ml-1 h-4 w-4 sm:h-5 sm:w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          {/* Cart Items */}
          <div className="md:w-2/3 w-full">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-2 sm:p-3 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Cart Items ({cartItems.length})
                </h2>
              </div>

              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {cartItems.map((item) => {
                  // Handle USD to INR conversion if needed
                  const convertedPrice =
                    parseFloat(item.price) > 0
                      ? item.currency === "USD"
                        ? convertProductPrice(parseFloat(item.price), "USD")
                        : parseFloat(item.price)
                      : 0;

                  // Format the price with INR currency
                  const displayPrice =
                    parseFloat(item.price) > 0
                      ? formatINR(convertedPrice * item.quantity)
                      : "Free";

                  // For single item price display
                  const singleItemPrice =
                    parseFloat(item.price) > 0
                      ? formatINR(convertedPrice)
                      : "Free";

                  // Original price in original currency (for USD items)
                  const originalPrice =
                    item.currency === "USD" && parseFloat(item.price) > 0
                      ? `$${parseFloat(item.price).toFixed(2)}`
                      : null;

                  return (
                    <li
                      key={item._id}
                      className="flex flex-col sm:flex-row p-2 sm:p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                    >
                      {/* Product Image */}
                      <div className="sm:w-16 h-16 flex-shrink-0 mb-2 sm:mb-0 sm:mr-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-gray-500 dark:text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col">
                        <div className="flex-1">
                          <h3 className="text-base sm:text-lg font-medium text-gray-800 dark:text-gray-200 mb-1 line-clamp-1">
                            <Link
                              to={`/products/${item._id}`}
                              className="hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              {item.title}
                            </Link>
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                            {item.description}
                          </p>
                          <div className="flex items-center text-sm mb-2">
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-0.5 text-xs rounded-full">
                              {item.category}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                            <div className="flex items-center border dark:border-gray-600 rounded-md">
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item._id,
                                    item.quantity - 1
                                  )
                                }
                                className="px-2 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                max={
                                  item.manageInventory
                                    ? item.inventory
                                    : undefined
                                }
                                value={item.quantity}
                                onChange={(e) =>
                                  handleQuantityChange(item._id, e.target.value)
                                }
                                className="w-8 sm:w-10 text-center border-x dark:border-gray-600 py-1 focus:outline-none bg-transparent dark:text-white"
                              />
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item._id,
                                    item.quantity + 1
                                  )
                                }
                                className="px-2 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none"
                                disabled={
                                  item.manageInventory &&
                                  item.quantity >= item.inventory
                                }
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item._id)}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 focus:outline-none text-xs sm:text-sm flex items-center"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 sm:h-4 sm:w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Remove
                            </button>
                          </div>
                          <div className="text-right min-w-20">
                            <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                              {displayPrice}
                            </p>
                            {originalPrice && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Original: {originalPrice}{" "}
                                {item.quantity > 1 ? `× ${item.quantity}` : ""}
                              </p>
                            )}
                            {item.quantity > 1 && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {singleItemPrice} each
                              </p>
                            )}
                            {item.manageInventory && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Stock: {item.inventory} available
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="p-2 sm:p-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => clearCart()}
                      className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Clear Cart
                    </button>
                    <Link
                      to="/products"
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:w-1/3 w-full">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden md:sticky md:top-16">
              <div className="p-2 sm:p-3 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Order Summary
                </h2>
              </div>

              <div className="p-2 sm:p-3">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      Subtotal
                    </span>
                    <span className="font-medium dark:text-white text-sm sm:text-base">
                      {subtotal > 0 ? formatINR(subtotal) : "Free"}
                    </span>
                  </div>
                  {/* Currency conversion notice */}
                  {cartItems.some((item) => item.currency === "USD") && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                      * USD prices converted to INR at current exchange rate
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      Trial Fee
                    </span>
                    <span className="font-medium dark:text-white text-sm sm:text-base">
                      {formatINR(0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      Shipping
                    </span>
                    <span className="font-medium dark:text-white text-sm sm:text-base">
                      {formatINR(0)}
                    </span>
                  </div>
                  <div className="pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                    <span className="text-base sm:text-lg font-semibold dark:text-white">
                      Total
                    </span>
                    <span className="text-base sm:text-lg font-semibold dark:text-white">
                      {subtotal > 0 ? formatINR(subtotal) : "Free"}
                    </span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="w-full mt-3 sm:mt-4 py-2 px-4 rounded-md font-medium text-white text-sm sm:text-base bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 inline-flex items-center justify-center"
                >
                  Proceed to Checkout{" "}
                  {subtotal > 0 ? `- ${formatINR(subtotal)}` : ""}
                </Link>

                <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {hasItemsWithPrice ? (
                    <p>Your cart contains both paid and free trial products.</p>
                  ) : (
                    <p>These are trial products available for free testing.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
