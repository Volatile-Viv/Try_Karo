import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserInsights from '../components/UserInsights';
import Loader from '../components/Loader';

const DashboardPage = () => {
  const { user, isAuthenticated, isMaker } = useAuth();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Redirect if not logged in or not a brand
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: '/dashboard',
          message: 'Please log in to access your brand dashboard'
        }
      });
    } else if (isAuthenticated && !isMaker) {
      navigate('/products', {
        state: {
          message: 'Only brands can access the dashboard'
        }
      });
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, isMaker, navigate]);

  if (!isAuthenticated || !isMaker) {
    return null; // Will redirect in the useEffect
  }

  if (loading) return <Loader />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Brand Insights Dashboard</h1>
        <Link
          to="/brand/dashboard"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg
            className="-ml-1 mr-2 h-5 w-5 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Description */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-blue-800 mb-2">User Insights Overview</h2>
        <p className="text-blue-700 mb-4">
          This dashboard provides detailed analytics about your users and products, helping you understand your audience better and make data-driven decisions.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-medium text-gray-700 mb-2">What You'll Find Here:</h3>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Overall user review metrics and ratings</li>
              <li>User demographics (age, gender)</li>
              <li>User interests and preferences</li>
              <li>Product performance comparison</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-medium text-gray-700 mb-2">How To Use This Data:</h3>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Identify your most successful products</li>
              <li>Understand your target audience demographics</li>
              <li>Discover user interests for future product development</li>
              <li>Address areas with lower ratings or engagement</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Brand Info Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Brand Logo/Avatar */}
          <div className="flex-shrink-0">
            <div className="relative">
              <img 
                src={user?.avatar || "https://via.placeholder.com/150?text=Brand"} 
                alt={user?.name} 
                className="h-32 w-32 object-cover rounded-full border-4 border-blue-100"
              />
              <div className="absolute bottom-0 right-0 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                Brand Account
              </div>
            </div>
          </div>
          
          {/* Brand Details */}
          <div className="flex-grow text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{user?.name || 'Your Brand'}</h2>
            <p className="text-gray-600 mb-2">{user?.email}</p>
            
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <h3 className="text-sm uppercase text-gray-500 font-semibold mb-2">Analytics Overview</h3>
              <p className="text-gray-700">
                This dashboard provides comprehensive insights about your users, including reviews, demographics, and product performance data.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Insights Section */}
      <UserInsights />
    </div>
  );
};

export default DashboardPage; 