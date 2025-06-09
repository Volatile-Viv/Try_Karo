import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts, CATEGORIES, STATUSES } from "../services/api";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import Loader from "../components/Loader";
import { useLoading } from "../components/GlobalLoadingIndicator";
import { useAuth } from "../context/AuthContext";

const ProductsPage = () => {
  // Get global loading context
  const { startLoading, stopLoading } = useLoading();

  // Get auth context
  const { user, isAuthenticated } = useAuth();

  // Check if user is a brand
  const isBrand = isAuthenticated && user?.role === "Brand";

  // State for products and loading
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for pagination
  const [pagination, setPagination] = useState(null);
  const [totalItems, setTotalItems] = useState(0);

  // Search params for filtering
  const [searchParams, setSearchParams] = useSearchParams();

  // Get current values from URL or defaults
  const currentPage = parseInt(searchParams.get("page") || "1");
  const currentCategory = searchParams.get("category") || "";
  const currentStatus = searchParams.get("status") || "";
  const searchQuery = searchParams.get("search") || "";

  // Function to load products with filters
  const loadProducts = async () => {
    setLoading(true);
    startLoading();
    setError(null);

    try {
      console.log("Starting product fetch with params:", {
        page: currentPage,
        category: currentCategory,
        status: currentStatus,
        search: searchQuery,
      });

      // Build query parameters
      const params = {
        page: currentPage,
        limit: 10,
      };

      if (currentCategory) params.category = currentCategory;
      if (currentStatus) params.status = currentStatus;
      if (searchQuery) params.search = searchQuery;

      // Fetch products from API
      const response = await getProducts(params);
      console.log("Products loaded successfully:", response);

      setProducts(response.data);
      setPagination(response.pagination);
      setTotalItems(response.total);
    } catch (err) {
      console.error("Error loading products:", err);
      const errorMessage = err.message || "Failed to load products";
      setError(errorMessage);

      // Add more detailed error information for debugging
      if (err.response) {
        console.error(
          "Server responded with:",
          err.response.status,
          err.response.data
        );
        setError(`${errorMessage} (Status: ${err.response.status})`);
      } else if (err.request) {
        console.error("No response received from server");
        setError(
          `No response received from server. Check if backend is running and accessible.`
        );
      } else {
        console.error("Error setting up request:", err.message);
      }

      setProducts([]);
    } finally {
      setLoading(false);
      stopLoading();
    }
  };

  // Load products when filters change
  useEffect(() => {
    loadProducts();
  }, [currentPage, currentCategory, currentStatus, searchQuery]);

  // Handle page change
  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", page.toString());
    setSearchParams(newParams);
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    const newParams = new URLSearchParams(searchParams);
    if (category) {
      newParams.set("category", category);
    } else {
      newParams.delete("category");
    }
    newParams.set("page", "1"); // Reset to first page
    setSearchParams(newParams);
  };

  // Handle status change
  const handleStatusChange = (status) => {
    const newParams = new URLSearchParams(searchParams);
    if (status) {
      newParams.set("status", status);
    } else {
      newParams.delete("status");
    }
    newParams.set("page", "1"); // Reset to first page
    setSearchParams(newParams);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchTerm = formData.get("search");

    const newParams = new URLSearchParams(searchParams);
    if (searchTerm) {
      newParams.set("search", searchTerm);
    } else {
      newParams.delete("search");
    }
    newParams.set("page", "1"); // Reset to first page
    setSearchParams(newParams);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchParams({ page: "1" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        {isBrand ? "All Products" : "Trial Products"}
      </h1>

      {/* Search and filters */}
      <div className="mb-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        {/* Search form */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex">
            <input
              type="text"
              name="search"
              placeholder="Search products..."
              defaultValue={searchQuery}
              className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Search
            </button>
          </div>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Category
            </label>
            <select
              id="category"
              value={currentCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              value={currentStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Status</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Clear filters button - only show if filters are applied */}
          {(currentCategory || currentStatus || searchQuery) && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none text-sm text-gray-600 dark:text-gray-300 ml-auto"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 border-l-4 border-red-500 p-4 mb-8">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Products grid */}
      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No products found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {currentCategory || currentStatus || searchQuery
              ? "Try changing your filters or search term"
              : "Be the first to add a product!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              isBrand={isBrand}
              isOwnProduct={isBrand && product.maker?._id === user?._id}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        pagination={pagination}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        totalItems={totalItems}
      />
    </div>
  );
};

export default ProductsPage;
