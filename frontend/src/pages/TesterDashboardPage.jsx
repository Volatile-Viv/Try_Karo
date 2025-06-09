import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProducts, getUserReviews } from "../services/api";
import Loader from "../components/Loader";
import Avatar from "../components/Avatar";

const TesterDashboardPage = () => {
  const { user, isAuthenticated, isTester } = useAuth();
  const [testedProducts, setTestedProducts] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch user's tested products and reviews
  useEffect(() => {
    const fetchTestedProductsAndReviews = async () => {
      if (!isAuthenticated || !isTester) {
        return;
      }

      try {
        setLoading(true);

        // Get all products
        const productsResponse = await getProducts();

        // Get user's reviews
        const reviewsResponse = await getUserReviews();

        // Set reviews from the API response - with safety checks
        const reviews = Array.isArray(reviewsResponse.data)
          ? reviewsResponse.data
          : [];
        setMyReviews(reviews);

        // Extract products that the user has tested (reviewed)
        const reviewedProductIds = reviews
          .filter((review) => review && review.product && review.product._id)
          .map((review) => review.product._id);

        // Add safety check to ensure productsResponse.data.data exists and is an array
        const allProducts = Array.isArray(productsResponse.data?.data)
          ? productsResponse.data.data
          : [];

        const testedProductsList = allProducts.filter(
          (product) =>
            product && product._id && reviewedProductIds.includes(product._id)
        );

        setTestedProducts(testedProductsList);
        setError(null);
      } catch (err) {
        console.error("Error fetching tester data:", err);
        setError(err.message || "Failed to load your testing data");
        // Set empty arrays to prevent rendering errors
        setMyReviews([]);
        setTestedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestedProductsAndReviews();
  }, [isAuthenticated, isTester]);

  // Redirect if not logged in or not a tester
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: "/tester/dashboard",
          message: "Please log in to access your tester dashboard",
        },
      });
    } else if (isAuthenticated && !isTester) {
      navigate("/products", {
        state: {
          message: "Only testers can access this dashboard",
        },
      });
    }
  }, [isAuthenticated, isTester, navigate]);

  if (!isAuthenticated || !isTester) {
    return null; // Will redirect in the useEffect
  }

  if (loading) return <Loader />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tester Dashboard</h1>
        <div className="flex space-x-4">
          <Link
            to="/products"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Find Products to Test
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Tester Info Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Tester Avatar */}
          <div className="flex-shrink-0">
            <div className="relative">
              <Avatar
                user={user}
                size="lg"
                className="border-4 border-blue-100"
              />
              <div className="absolute bottom-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Tester Account
              </div>
            </div>
          </div>

          {/* Tester Details */}
          <div className="flex-grow text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {user?.name || "Tester"}
            </h2>
            <p className="text-gray-600 mb-2">{user?.email}</p>

            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <h3 className="text-sm uppercase text-gray-500 font-semibold mb-2">
                About You
              </h3>
              <p className="text-gray-700 whitespace-pre-line">
                {user?.bio ||
                  "No bio provided yet. Edit your profile to add a description."}
              </p>
            </div>

            <div className="mt-4">
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  Joined:{" "}
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {testedProducts.length} Products Tested
                </div>
                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                  {myReviews.length} Reviews Written
                </div>
                <Link
                  to="/profile"
                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm hover:bg-purple-200 transition-colors"
                >
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-500 uppercase text-sm">
            Products Tested
          </h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {testedProducts.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-500 uppercase text-sm">
            Reviews Written
          </h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {myReviews.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-500 uppercase text-sm">
            Average Rating Given
          </h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {myReviews.length > 0
              ? (
                  myReviews.reduce((sum, review) => sum + review.rating, 0) /
                  myReviews.length
                ).toFixed(1)
              : "N/A"}
          </p>
        </div>
      </div>

      {/* Testing Activity */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Your Testing History
          </h2>
        </div>

        {testedProducts.length === 0 ? (
          <div className="p-6 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No products tested yet
            </h3>
            <p className="mt-1 text-gray-500">
              Start testing products to see your history here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Your Rating
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tested Date
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testedProducts.map((product) => {
                  // Find the user's review for this product
                  const myReview = myReviews.find(
                    (r) => r.product?._id === product._id
                  );

                  return (
                    <tr key={product._id}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-md object-cover"
                              src={
                                product.images?.[0] ||
                                "https://via.placeholder.com/150"
                              }
                              alt={product.title}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              <Link
                                to={`/products/${product._id}`}
                                className="hover:underline"
                              >
                                {product.title}
                              </Link>
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.makerName || "Unknown Brand"}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {myReview ? (
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900 mr-1">
                              {myReview.rating}
                            </span>
                            <div className="text-yellow-400 flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= myReview.rating
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">
                            No rating
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {myReview
                          ? new Date(myReview.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        <Link
                          to={`/products/${product._id}`}
                          className="text-blue-600 hover:text-blue-900 mx-2"
                        >
                          View
                        </Link>
                        {myReview ? (
                          <Link
                            to={`/products/${product._id}#review`}
                            className="text-green-600 hover:text-green-900 mx-2"
                          >
                            Edit Review
                          </Link>
                        ) : (
                          <Link
                            to={`/products/${product._id}#review`}
                            className="text-yellow-600 hover:text-yellow-900 mx-2"
                          >
                            Add Review
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Combined Call-to-Action */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Find More Products
          </h2>
        </div>
        <div className="p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            Browse and test new products
          </h3>
          <p className="mt-1 text-gray-500 mb-4">
            Discover new products to test and earn rewards for your feedback.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            Browse All Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TesterDashboardPage;
