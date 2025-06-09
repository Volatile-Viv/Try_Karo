import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Loader from './Loader';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("fadeIn");

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setIsTransitioning(true);
      setTransitionStage("fadeOut");
      
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage("fadeIn");
        
        const fadeInTimeout = setTimeout(() => {
          setIsTransitioning(false);
        }, 300); // Match the CSS transition duration
        
        return () => clearTimeout(fadeInTimeout);
      }, 300); // Match the CSS transition duration
      
      return () => clearTimeout(timeout);
    }
  }, [location, displayLocation]);

  return (
    <div 
      className={`transition-opacity duration-300 ease-in-out ${
        transitionStage === "fadeIn" ? "opacity-100" : "opacity-0"
      }`}
    >
      {isTransitioning && <Loader fullScreen size="large" />}
      {children}
    </div>
  );
};

export default PageTransition; 