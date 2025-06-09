import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { useState, useEffect } from "react";
import Avatar from "./Avatar";

const Navbar = () => {
  const { user, isAuthenticated, logout, isMaker, isTester } = useAuth();
  const { getCartCount } = useCart();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const navigate = useNavigate();

  // Check if user is a brand
  const isBrand = isMaker;

  // Calculate total items in cart
  useEffect(() => {
    if (isAuthenticated && !isBrand) {
      setItemCount(getCartCount());
    } else {
      setItemCount(0);
    }
  }, [getCartCount, isAuthenticated, isBrand]);

  // Reset click animation after a short time
  useEffect(() => {
    if (isClicked) {
      const timer = setTimeout(() => {
        setIsClicked(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isClicked]);

  // Handle cart icon click for non-authenticated users
  const handleCartClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate("/login", {
        state: {
          from: "/cart",
          message: "Please log in to access your cart",
        },
      });
    }
  };

  return (
    <nav className="bg-white shadow dark:bg-gray-800 dark:shadow-gray-700 sticky top-0 z-10 transition-colors duration-200">
      <div className="max-w-full mx-auto px-2 sm:px-4">
        <div className="flex justify-between h-14">
          <div className="flex items-center">
            <div
              className="flex-shrink-0 flex items-center"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => setIsClicked(true)}
            >
              <Link
                to="/"
                className={`text-xl md:text-2xl font-bold relative p-1 rounded-lg
                  ${
                    isClicked
                      ? "transform scale-90"
                      : isHovered
                      ? "transform scale-110"
                      : ""
                  }
                  transition-all duration-300 ease-in-out
                  bg-gradient-to-r from-blue-500 to-blue-700 text-transparent bg-clip-text 
                  hover:from-blue-600 hover:to-blue-800
                  active:from-blue-700 active:to-blue-900
                  hover:shadow-lg focus:outline-none`}
                aria-label="Home"
              >
                Try Karo
                <span
                  className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-blue-700 
                  transform origin-left transition-transform duration-300 ease-out
                  ${isHovered ? "scale-x-100" : "scale-x-0"}`}
                ></span>
                {isHovered && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
                )}
              </Link>
            </div>
            <div className="ml-4 md:ml-6 flex space-x-3 md:space-x-6">
              <Link
                to="/products"
                className="inline-flex items-center px-2 py-1 text-sm font-medium text-gray-900 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 active:text-blue-800 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900 active:bg-blue-100 transform active:scale-95 transition-all duration-150"
              >
                {isBrand ? "All Products" : "Trial Products"}
              </Link>
              {isBrand && (
                <>
                  <Link
                    to="/brand/dashboard"
                    className="inline-flex items-center px-3 py-2 text-sm md:text-base font-medium text-gray-600 dark:text-gray-300 rounded-md hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 active:bg-blue-100 active:text-blue-800 transform active:scale-95 transition-all duration-150"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/products/new"
                    className="inline-flex items-center px-3 py-2 text-sm md:text-base font-medium text-gray-600 dark:text-gray-300 rounded-md hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 active:bg-blue-100 active:text-blue-800 transform active:scale-95 transition-all duration-150"
                  >
                    Add Product
                  </Link>
                </>
              )}
              {isTester && (
                <Link
                  to="/tester/dashboard"
                  className="inline-flex items-center px-3 py-2 text-sm md:text-base font-medium text-gray-600 dark:text-gray-300 rounded-md hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 active:bg-blue-100 active:text-blue-800 transform active:scale-95 transition-all duration-150"
                >
                  My Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-full transition-all duration-150"
              aria-label={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {isDarkMode ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            {/* Cart Icon - Only for non-brand users */}
            {!isBrand && (
              <Link
                to="/cart"
                className="relative group"
                onClick={handleCartClick}
              >
                <div className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-full transition-all duration-150">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
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
                  {isAuthenticated && itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transform transition-transform group-hover:scale-110">
                      {itemCount}
                    </span>
                  )}
                </div>
              </Link>
            )}

            {isAuthenticated ? (
              <>
                <Link
                  to={isBrand ? "/brand/dashboard" : "/profile"}
                  className="flex items-center rounded-full border-2 border-transparent hover:border-blue-500 transition-all duration-200 px-2 py-1 space-x-2 group"
                >
                  <Avatar user={user} size="sm" />
                  <span className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {user.name}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm md:text-base font-medium text-white bg-red-600 hover:bg-red-700 active:bg-red-800 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transform active:scale-95 transition-all duration-150"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm md:text-base font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform active:scale-95 transition-all duration-150"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
