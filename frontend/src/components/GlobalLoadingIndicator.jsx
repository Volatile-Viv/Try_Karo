import { useState, useEffect, createContext, useContext } from 'react';
import Loader from './Loader';

// Create a context to manage loading state globally
export const LoadingContext = createContext({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {}
});

// Hook to use the loading context
export const useLoading = () => useContext(LoadingContext);

// Provider component to wrap the app
export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const startLoading = () => {
    setIsLoading(true);
  };
  
  const stopLoading = () => {
    setIsLoading(false);
  };
  
  const value = {
    isLoading,
    startLoading,
    stopLoading
  };
  
  return (
    <LoadingContext.Provider value={value}>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-4 w-auto">
            <Loader size="default" />
          </div>
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  );
};

// Indicator component that can be placed in the app
const GlobalLoadingIndicator = () => {
  const { isLoading } = useLoading();
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (isLoading) {
      setVisible(true);
    } else {
      // Small delay to allow for animation
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  
  if (!visible) return null;
  
  return (
    <div className={`fixed top-4 right-4 z-50 transition-opacity duration-300 ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
      <div className="bg-white rounded-full shadow-lg p-2">
        <Loader size="small" />
      </div>
    </div>
  );
};

export default GlobalLoadingIndicator; 