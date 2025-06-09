import PropTypes from "prop-types";

const ReviewList = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-md">
        <p className="text-gray-600">
          No reviews yet. Be the first to review this product!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div
          key={review._id}
          className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
        >
          <div className="flex items-start">
            {/* Reviewer Avatar */}
            <img
              src={
                review.tester?.avatar || "https://via.placeholder.com/40?text=T"
              }
              alt={review.tester?.name || "Anonymous"}
              className="w-10 h-10 rounded-full mr-4"
            />

            <div className="flex-1">
              {/* Reviewer Name and Date */}
              <div className="flex justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-800">
                    {review.tester?.name || "Anonymous"}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                {/* Rating */}
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-1">{review.rating}</span>
                  <svg
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                </div>
              </div>

              {/* Review Content */}
              <p className="text-gray-700 mb-3">{review.text}</p>

              {/* Review Image */}
              {review.image && (
                <img
                  src={review.image}
                  alt="Review attachment"
                  className="max-h-48 rounded-md mt-2 mb-3"
                />
              )}

              {/* Comments Section */}
              {review.comments && review.comments.length > 0 && (
                <div className="mt-4 pl-4 border-l-2 border-gray-200">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                    Comments
                  </h5>
                  <div className="space-y-3">
                    {review.comments.map((comment, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-md">
                        <div className="flex items-center mb-1">
                          <img
                            src={
                              comment.user?.avatar ||
                              "https://via.placeholder.com/30?text=U"
                            }
                            alt={comment.user?.name || "User"}
                            className="w-6 h-6 rounded-full mr-2"
                          />
                          <span className="text-sm font-medium">
                            {comment.user?.name || "User"}
                          </span>
                          <span className="text-xs text-gray-500 ml-auto">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

ReviewList.propTypes = {
  reviews: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      rating: PropTypes.number.isRequired,
      text: PropTypes.string.isRequired,
      image: PropTypes.string,
      createdAt: PropTypes.string.isRequired,
      tester: PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
        avatar: PropTypes.string,
      }),
      comments: PropTypes.arrayOf(
        PropTypes.shape({
          text: PropTypes.string.isRequired,
          user: PropTypes.shape({
            _id: PropTypes.string,
            name: PropTypes.string,
            avatar: PropTypes.string,
          }),
          createdAt: PropTypes.string.isRequired,
        })
      ),
    })
  ).isRequired,
};

export default ReviewList;
