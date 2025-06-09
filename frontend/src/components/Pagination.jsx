import PropTypes from "prop-types";

const Pagination = ({ pagination, currentPage, onPageChange, totalItems }) => {
  // Calculate total pages
  const totalPages = Math.ceil(totalItems / 10); // Assuming 10 items per page

  // Generate page numbers array
  const getPageNumbers = () => {
    const pages = [];
    const maxPageButtons = 5;

    if (totalPages <= maxPageButtons) {
      // If total pages are less than max buttons, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);

      // Calculate start and end of middle pages
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(currentPage + 1, totalPages - 1);

      // Adjust if we're at the start or end
      if (currentPage <= 2) {
        endPage = Math.min(maxPageButtons - 1, totalPages - 1);
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - (maxPageButtons - 2);
      }

      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push("...");
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push("...");
      }

      // Always include last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (!pagination || totalPages <= 1) return null;

  return (
    <div className="flex justify-center my-8">
      <nav className="flex items-center space-x-1">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!pagination.prev}
          className={`px-3 py-1 rounded-md ${
            pagination.prev
              ? "text-gray-700 hover:bg-gray-200"
              : "text-gray-400 cursor-not-allowed"
          }`}
        >
          <span className="sr-only">Previous</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-500">
              ...
            </span>
          ) : (
            <button
              key={`page-${page}`}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded-md ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!pagination.next}
          className={`px-3 py-1 rounded-md ${
            pagination.next
              ? "text-gray-700 hover:bg-gray-200"
              : "text-gray-400 cursor-not-allowed"
          }`}
        >
          <span className="sr-only">Next</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </nav>
    </div>
  );
};

Pagination.propTypes = {
  pagination: PropTypes.shape({
    prev: PropTypes.shape({
      page: PropTypes.number,
      limit: PropTypes.number,
    }),
    next: PropTypes.shape({
      page: PropTypes.number,
      limit: PropTypes.number,
    }),
  }),
  currentPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  totalItems: PropTypes.number.isRequired,
};

export default Pagination;
