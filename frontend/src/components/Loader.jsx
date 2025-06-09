import React from 'react';

const Loader = ({ fullScreen = false, size = "default", text = null }) => {
  // Size variants - making them smaller
  const sizeClasses = {
    small: "h-4 w-4",
    default: "h-8 w-8", 
    large: "h-12 w-12" 
  };

  const containerClasses = fullScreen 
    ? "fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50" 
    : "flex flex-col justify-center items-center p-4"; // reduced padding

  return (
    <div className={containerClasses}>
      <div className="relative">
        {/* Outer spinning circle */}
        <div className={`${sizeClasses[size]} rounded-full border-3 border-blue-200 border-opacity-60`}></div>
        
        {/* Inner spinning arc - faster animation */}
        <div className={`absolute top-0 left-0 ${sizeClasses[size]} rounded-full border-3 border-transparent border-t-blue-600 animate-spin`} style={{ animationDuration: '0.6s' }}></div>
        
        {/* Pulsing dot in the middle - faster animation */}
        <div 
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
            ${size === 'small' ? 'h-1.5 w-1.5' : size === 'large' ? 'h-3 w-3' : 'h-2 w-2'} 
            bg-blue-600 rounded-full animate-pulse`}
          style={{ animationDuration: '0.8s' }}
        >
        </div>
      </div>
      
      {/* Loading text - only shown if explicitly provided */}
      {text && (
        <p className="mt-2 text-blue-600 font-medium animate-pulse text-sm">{text}</p>
      )}
    </div>
  );
};

export default Loader;
