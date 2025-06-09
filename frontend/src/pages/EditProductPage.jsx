import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProduct, updateProduct } from "../services/api";
import { useAuth } from "../context/AuthContext";
import ProductForm from "../components/ProductForm";
import Loader from "../components/Loader";

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const response = await getProduct(id);
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

  // Check if user can edit this product
  const canEdit =
    isAuthenticated &&
    product &&
    (user?._id === product?.maker?._id || // User is the maker
      isAdmin); // User is admin

  // Redirect if user can't edit
  useEffect(() => {
    if (!loading && product && !canEdit) {
      navigate(`/products/${id}`);
    }
  }, [loading, product, canEdit, navigate, id]);

  const handleSubmit = async (productData) => {
    setSubmitting(true);
    setError(null);

    try {
      await updateProduct(id, productData);
      navigate(`/products/${id}`);
    } catch (err) {
      console.error("Error updating product:", err);
      setError(err.message || "Failed to update product. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  if (error && !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!product || !canEdit) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <ProductForm
        initialData={product}
        onSubmit={handleSubmit}
        isLoading={submitting}
        error={error}
      />
    </div>
  );
};

export default EditProductPage;
