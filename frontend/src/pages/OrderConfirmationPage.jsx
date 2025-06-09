import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OrderConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const { orderId, message } = location.state || {};

  useEffect(() => {
    // If no order details or not authenticated, redirect to products
    if (!orderId || !message || !isAuthenticated) {
      navigate("/products");
    }
  }, [orderId, message, isAuthenticated, navigate]);

  if (!orderId || !message || !isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Order Confirmed!
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mb-2">{message}</p>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Order ID: {orderId}
        </p>

        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Thank you for your order. We'll send you a confirmation email with
            your order details.
          </p>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/products"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
