import { useState } from "react";
import PropTypes from "prop-types";
import { createReview } from "../services/api";
import { useAuth } from "../context/AuthContext";

const ReviewForm = ({ productId, onReviewAdded }) => {
  const { user, token, isTester } = useAuth();
  const [formData, setFormData] = useState({
    rating: 5,
    text: "",
    image: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setError(null);
    setSuccess(false);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate user role and authentication
    if (!token) {
      setError("You must be logged in to submit a review.");
      setLoading(false);
      return;
    }

    if (!user || !isTester) {
      setError(
        "Only testers can submit reviews. Your current role is: " +
          (user ? user.role : "unknown")
      );
      setLoading(false);
      return;
    }

    try {
      console.log("Submitting review for product:", productId);
      console.log("Review data:", formData);
      console.log("User role:", user.role);

      const response = await createReview(productId, formData);
      console.log("Review submitted successfully:", response);

      setSuccess(true);
      setFormData({ ...formData, text: "" }); // Clear text but keep rating
      if (onReviewAdded) {
        onReviewAdded(response.data);
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      setError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8 bg-gray-50 p-4 rounded-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Write a Review
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-md border border-green-200">
          Your review has been submitted successfully!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="rating"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Rating
          </label>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData({ ...formData, rating: star })}
                className="focus:outline-none"
              >
                <svg
                  className={`w-8 h-8 ${
                    formData.rating >= star
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </button>
            ))}
            <span className="ml-2 text-gray-700">
              {formData.rating} out of 5
            </span>
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="text"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Review
          </label>
          <textarea
            id="text"
            name="text"
            rows="4"
            value={formData.text}
            onChange={handleChange}
            className="form-input"
            placeholder="Write your review here..."
            required
          ></textarea>
        </div>

        <div className="mb-6">
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Image URL (Optional)
          </label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className="form-input"
            placeholder="https://example.com/screenshot.jpg"
          />
          <p className="mt-1 text-xs text-gray-500">
            You can add a screenshot or image to your review
          </p>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
};

ReviewForm.propTypes = {
  productId: PropTypes.string.isRequired,
  onReviewAdded: PropTypes.func,
};

export default ReviewForm;
