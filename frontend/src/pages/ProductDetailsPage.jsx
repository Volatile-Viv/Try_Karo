import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProduct, deleteProduct } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";
import Loader from "../components/Loader";
import ReviewList from "../components/ReviewList";
import ReviewForm from "../components/ReviewForm";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isMaker, isTester } = useAuth();
  const { addToCart, isInCart } = useCart();
  const { convertProductPrice, formatPrice, getCurrencyByCode, currency } =
    useCurrency();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Check if user is a brand
  const isBrand = isAuthenticated && user?.role === "Brand";

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const response = await getProduct(id);

        // Log the product data to debug stock issues
        console.log("Product loaded:", {
          id: response.data._id,
          title: response.data.title,
          inStock: response.data.inStock,
          manageInventory: response.data.manageInventory,
          stock: response.data.stock,
        });

        setProduct(response.data);
        setError(null);
      } catch (err) {
        console.error("Error loading product:", err);
        setError(err.message || "Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // Handle delete product
  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteProduct(id);
      navigate("/products");
    } catch (err) {
      console.error("Error deleting product:", err);
      setError(err.message || "Failed to delete product");
      setLoading(false);
    }
  };

  // Handle adding product to cart
  const handleAddToCart = () => {
    if (!product) {
      console.error("Cannot add to cart: Product is null");
      return;
    }

    // Use inventory value if available, otherwise use stock
    const availableStock =
      product.inventory !== undefined ? product.inventory : product.stock;

    // Log the current product state
    console.log("Adding product to cart:", {
      id: product._id,
      title: product.title,
      inStock: product.inStock,
      manageInventory: product.manageInventory,
      stock: product.stock,
      inventory: product.inventory,
      availableStock,
      quantity: quantity,
    });

    // Don't allow adding if out of stock
    if (product.inStock === false) {
      console.log("Cannot add: Product is out of stock (inStock is false)");
      alert("Sorry, this product is out of stock!");
      return;
    }

    // Check if product has valid stock
    if (
      product.manageInventory &&
      (availableStock === undefined || availableStock === null)
    ) {
      console.log("Cannot add: Product has undefined stock");
      alert(
        "Sorry, there was an issue with this product's inventory. Please try again later."
      );
      return;
    }

    // Check if product is out of stock (redundant with inStock check, but safer)
    if (product.manageInventory && availableStock <= 0) {
      console.log(
        "Cannot add: Product stock is zero or negative:",
        availableStock
      );
      alert("Sorry, this product is out of stock!");
      return;
    }

    // Check if adding would exceed stock
    if (product.manageInventory && quantity > availableStock) {
      console.log(
        `Cannot add: Requested quantity (${quantity}) exceeds available stock (${availableStock})`
      );
      alert(`Sorry, we only have ${availableStock} items available.`);
      return;
    }

    const success = addToCart(product, quantity);
    console.log("Add to cart result:", success);

    if (success) {
      setAddedToCart(true);

      // Reset added to cart status after 3 seconds
      setTimeout(() => {
        setAddedToCart(false);
      }, 3000);
    }
  };

  // Check if user can edit/delete this product
  const canModify =
    isAuthenticated &&
    (user?._id === product?.maker?._id || // User is the Brand
      user?.role === "admin"); // User is admin

  // Check if user can review this product
  const canReview = isAuthenticated && isTester && product?.status !== "closed";

  // Debug log for review form visibility
  console.log("Review form conditions:", {
    isAuthenticated,
    isTester,
    productStatus: product?.status,
    userRole: user?.role,
    canReview,
  });

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
          <Link
            to="/products"
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) return null;

  // Use inventory value if available, otherwise use stock
  const availableStock =
    product.inventory !== undefined ? product.inventory : product.stock;

  // Ensure stock and inStock values are consistent
  const isActuallyInStock = product.manageInventory
    ? availableStock > 0
    : product.inStock;

  // Get product's original currency or default to USD
  const productCurrency = product.currency || "USD";
  const productCurrencyInfo = getCurrencyByCode(productCurrency);

  // Get the converted price in the user's currency
  const convertedPrice =
    parseFloat(product.price) > 0
      ? convertProductPrice(parseFloat(product.price), productCurrency)
      : 0;

  // Format the price with the current currency symbol
  const formattedPrice =
    parseFloat(product.price) > 0 ? formatPrice(convertedPrice) : "Free Trial";

  // Original price in product's currency
  const originalPrice =
    parseFloat(product.price) > 0
      ? formatPrice(parseFloat(product.price), productCurrency)
      : "Free Trial";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back button */}
      <Link
        to="/products"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <svg
          className="w-5 h-5 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back to Products
      </Link>

      {/* Product Header */}
      <div className="flex flex-col md:flex-row justify-between mb-8">
        <div>
          <div className="flex items-center mb-2">
            <h1 className="text-3xl font-bold text-gray-900 mr-3">
              {product.title}
            </h1>
            <span
              className={`badge ${
                product.status === "live"
                  ? "bg-green-100 text-green-800"
                  : product.status === "in-testing"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {product.status}
            </span>
          </div>
          <div className="flex items-center text-gray-600 mb-4">
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2">
              {product.category}
            </span>
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-100 px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {canModify && (
          <div className="flex space-x-3 mt-4 md:mt-0">
            <Link
              to={`/products/${id}/edit`}
              className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105 active:scale-95 transition-all duration-150"
            >
              <svg
                className="mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Product
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 active:bg-red-800 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transform hover:scale-105 active:scale-95 transition-all duration-150"
            >
              <svg
                className="mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
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
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="md:col-span-2">
          {/* Image */}
          {product.image && (
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-80 object-contain rounded-lg shadow-md mb-6"
            />
          )}

          {/* Description */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Description
            </h2>
            <p className="text-gray-700 whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Reviews */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
              <div className="flex items-center">
                <div className="flex items-center mr-2">
                  <svg
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <span className="text-gray-700 ml-1">
                    {product.avgRating ? product.avgRating.toFixed(1) : "N/A"}
                  </span>
                </div>
                <span className="text-gray-500">
                  ({product.totalRatings || 0} reviews)
                </span>
              </div>
            </div>

            {/* Review Form */}
            {canReview ? (
              <ReviewForm
                productId={id}
                onReviewAdded={(newReview) => {
                  // Update local reviews
                  setProduct((prevProduct) => ({
                    ...prevProduct,
                    reviews: [newReview, ...(prevProduct.reviews || [])],
                    totalRatings: (prevProduct.totalRatings || 0) + 1,
                    // For simplicity, we'll update the average on reload
                  }));
                }}
              />
            ) : (
              isAuthenticated && (
                <div className="bg-yellow-50 p-4 mb-6 rounded-md border border-yellow-200">
                  <p className="text-yellow-700 mb-2">
                    {!isTester
                      ? "You need to be a tester to review this product."
                      : product?.status === "closed"
                      ? "This product is closed and not accepting reviews."
                      : "You cannot review this product."}
                  </p>
                  {!isTester && (
                    <p className="text-sm text-yellow-600">
                      Your current role: {user?.role || "Not set"}
                    </p>
                  )}
                </div>
              )
            )}

            {/* Reviews List */}
            <ReviewList reviews={product.reviews || []} />
          </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-1">
          {/* Brand Info */}
          {product.maker && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Brand
              </h3>
              <div className="flex items-center">
                <img
                  src={
                    product.maker.avatar ||
                    "https://via.placeholder.com/60?text=M"
                  }
                  alt={product.maker.name}
                  className="w-12 h-12 rounded-full mr-3"
                />
                <div>
                  <p className="font-medium">{product.maker.name}</p>
                  {product.maker.bio && (
                    <p className="text-sm text-gray-600 mt-1">
                      {product.maker.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Product Info */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Product Info
            </h3>
            <ul className="space-y-3">
              <li className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium">
                  {product.status === "live"
                    ? "Live"
                    : product.status === "in-testing"
                    ? "In Testing"
                    : "Closed"}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium">{product.category}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-medium">
                  {formattedPrice}
                  {parseFloat(product.price) > 0 &&
                    productCurrency !== currency.code && (
                      <span className="text-xs text-gray-500 block">
                        (Original: {originalPrice})
                      </span>
                    )}
                </span>
              </li>
              {product.manageInventory && (
                <li className="flex justify-between">
                  <span className="text-gray-600">Stock Status:</span>
                  <span
                    className={`font-medium ${
                      isActuallyInStock
                        ? availableStock < 10
                          ? "text-orange-600"
                          : "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {isActuallyInStock
                      ? `In Stock (${availableStock} available)`
                      : "Out of Stock"}

                    {isActuallyInStock && availableStock < 10 && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 animate-pulse">
                        Low Stock
                      </span>
                    )}
                  </span>
                </li>
              )}
              <li className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">
                  {new Date(product.createdAt).toLocaleDateString()}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="font-medium">
                  {new Date(product.updatedAt).toLocaleDateString()}
                </span>
              </li>
            </ul>
          </div>

          {/* Test Link */}
          {!isBrand && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Test Link
              </h3>
              <a
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary w-full text-center block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mb-3 transition-colors"
              >
                Try Product
              </a>
              <p className="text-xs text-gray-500 mb-4">
                This will open the product in a new tab
              </p>
            </div>
          )}

          {/* Add to Cart */}
          {!isBrand && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {parseFloat(product.price) > 0
                  ? `Get This Product (${formattedPrice})`
                  : "Get This Trial Product"}
              </h3>

              {!isActuallyInStock ? (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-center">
                  <svg
                    className="w-6 h-6 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="font-medium">Out of Stock</p>
                  <p className="text-sm mt-1">
                    This product is currently unavailable
                  </p>
                </div>
              ) : (
                <div className="mb-4">
                  <label
                    htmlFor="quantity"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Quantity
                  </label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={!isAuthenticated}
                      className={`p-2 border border-gray-300 rounded-l-md text-gray-600 ${
                        isAuthenticated
                          ? "hover:bg-gray-100"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
                      </svg>
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      max={product.manageInventory ? availableStock : undefined}
                      value={quantity}
                      onChange={(e) => {
                        const newQuantity = parseInt(e.target.value) || 1;
                        // Limit quantity to stock if managed
                        if (product.manageInventory && availableStock) {
                          setQuantity(
                            Math.min(Math.max(1, newQuantity), availableStock)
                          );
                        } else {
                          setQuantity(Math.max(1, newQuantity));
                        }
                      }}
                      disabled={!isAuthenticated}
                      className={`p-2 w-16 text-center border-y border-gray-300 ${
                        !isAuthenticated && "opacity-50 cursor-not-allowed"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (product.manageInventory && availableStock) {
                          setQuantity(Math.min(quantity + 1, availableStock));
                        } else {
                          setQuantity(quantity + 1);
                        }
                      }}
                      disabled={
                        !isAuthenticated ||
                        (product.manageInventory && quantity >= availableStock)
                      }
                      className={`p-2 border border-gray-300 rounded-r-md text-gray-600 ${
                        isAuthenticated &&
                        (!product.manageInventory || quantity < availableStock)
                          ? "hover:bg-gray-100"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>

                  {product.manageInventory && availableStock < 10 && (
                    <div className="mt-2 p-2 bg-orange-50 border border-orange-100 rounded-md">
                      <p className="text-orange-600 text-sm flex items-center font-medium animate-pulse">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Only {availableStock} left in stock - order soon!
                      </p>
                    </div>
                  )}

                  {parseFloat(product.price) > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      Total: {formatPrice(convertedPrice * quantity)}
                    </p>
                  )}
                </div>
              )}

              {isAuthenticated ? (
                <button
                  onClick={handleAddToCart}
                  disabled={
                    addedToCart || !isActuallyInStock || isInCart(product._id)
                  }
                  className={`w-full py-2 px-4 rounded ${
                    addedToCart
                      ? "bg-green-500 text-white"
                      : isInCart(product._id)
                      ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      : !isActuallyInStock
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {addedToCart
                    ? "Added to Cart!"
                    : isInCart(product._id)
                    ? "Already in Cart"
                    : !isActuallyInStock
                    ? "Out of Stock"
                    : `Add to Cart ${
                        parseFloat(product.price) > 0
                          ? "- " + formattedPrice
                          : ""
                      }`}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100 text-sm text-yellow-700">
                    Please log in or sign up to add products to your cart
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to="/login"
                      className="flex-1 py-2 px-4 rounded bg-blue-600 hover:bg-blue-700 text-white text-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      className="flex-1 py-2 px-4 rounded bg-gray-100 hover:bg-gray-200 text-gray-800 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              )}

              {isAuthenticated && isInCart(product._id) && !addedToCart && (
                <div className="mt-2 text-center">
                  <Link
                    to="/cart"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View in Cart
                  </Link>
                </div>
              )}

              <p className="text-xs text-gray-500 mt-4">
                {parseFloat(product.price) > 0
                  ? "This product requires payment before use."
                  : "Trial products are free to test. Add them to your cart for tracking purposes."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
            <div className="flex items-center mb-4 text-red-600">
              <svg
                className="h-8 w-8 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="text-xl font-bold text-gray-900">
                Confirm Delete
              </h3>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete "
              <span className="font-semibold">{product.title}</span>"? This
              action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-150 transform active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-150 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </span>
                ) : (
                  "Delete Product"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;
