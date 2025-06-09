import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createProduct } from "../services/api";
import { useAuth } from "../context/AuthContext";
import ProductForm from "../components/ProductForm";

const CreateProductPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isMaker, user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use useEffect for navigation to avoid executing during render
  useEffect(() => {
    if (!isAuthenticated || !isMaker) {
      console.log("Redirecting: Not authenticated or not a Brand");
      navigate("/login");
    } else {
      console.log("User authenticated as Brand:", user?.role);
    }
  }, [isAuthenticated, isMaker, navigate, user]);

  const handleSubmit = async (productData) => {
    setLoading(true);
    setError(null);

    if (!token) {
      console.error("No token available for product creation");
      setError("Authentication required. Please login again.");
      setLoading(false);
      return;
    }

    try {
      console.log("Submitting product data:", productData);
      const response = await createProduct(productData);
      console.log("Product created successfully:", response);
      // Navigate to the product details page after successful creation
      navigate(`/products/${response.data._id}`);
    } catch (err) {
      console.error("Error creating product:", err);

      // Display a more user-friendly error message
      if (err.message === "Server error") {
        setError(
          "There was a problem creating your product. Please check all fields and try again."
        );
      } else {
        setError(err.message || "Failed to create product. Please try again.");
      }
      setLoading(false);
    }
  };

  // If not authenticated or not a Brand, don't render the form
  if (!isAuthenticated || !isMaker) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back navigation */}
      <Link
        to="/products"
        className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6 group transition-colors"
      >
        <svg
          className="w-5 h-5 mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform"
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
      
      <h1 className="text-2xl font-bold mb-4">Create New Product</h1>
      {token ? (
        <ProductForm
          onSubmit={handleSubmit}
          isLoading={loading}
          error={error}
        />
      ) : (
        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
          <p className="text-yellow-700">
            Authentication token missing. Please{" "}
            <a href="/login" className="underline">
              login again
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
};

export default CreateProductPage;
