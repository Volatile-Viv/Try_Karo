import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

const CartIcon = () => {
  const { cartItems, getCartCount, removeFromCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { convertProductPrice, formatPrice } = useCurrency();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  
  const cartCount = getCartCount();
  
  // Toggle dropdown
  const toggleDropdown = () => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          from: '/cart',
          message: 'Please log in to access your cart'
        } 
      });
      return;
    }
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  // Close dropdown when clicking outside
  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };
  
  return (
    <div className="relative" onMouseLeave={closeDropdown}>
      <button 
        className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
        onClick={toggleDropdown}
        aria-label="Shopping cart"
      >
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
        
        {/* Cart count badge - only show for authenticated users */}
        {isAuthenticated && cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </button>
      
      {/* Dropdown - only show for authenticated users */}
      {isAuthenticated && isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-20">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">Your Cart ({cartCount} items)</h3>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Your cart is empty
              </div>
            ) : (
              <ul>
                {cartItems.map(item => {
                  // Get the converted price in user's currency
                  const itemPrice = parseFloat(item.price) > 0 
                    ? convertProductPrice(parseFloat(item.price), item.currency || 'USD') 
                    : 0;
                  
                  return (
                    <li key={item._id} className="flex items-center p-3 hover:bg-gray-50 border-b border-gray-100">
                      <div className="h-10 w-10 flex-shrink-0 mr-3">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="h-full w-full object-cover rounded" />
                        ) : (
                          <div className="h-full w-full bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
                            No img
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity}
                        </p>
                        {parseFloat(item.price) > 0 && (
                          <p className="text-xs text-blue-600 font-medium">
                            {formatPrice(itemPrice * item.quantity)}
                          </p>
                        )}
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromCart(item._id);
                        }}
                        className="text-gray-400 hover:text-red-500"
                        aria-label="Remove item"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          
          <div className="p-3 border-t border-gray-200">
            <Link 
              to="/cart" 
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
              onClick={closeDropdown}
            >
              View Cart
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartIcon; 