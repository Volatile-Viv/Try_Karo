import { createContext, useContext, useState, useEffect } from 'react';

// Create context
const ThemeContext = createContext();

// Hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

// Provider component
export const ThemeProvider = ({ children }) => {
  // Get saved theme from localStorage or default to light
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    // If a theme preference exists in localStorage, use it
    if (savedTheme !== null) {
      return JSON.parse(savedTheme);
    }
    // Otherwise check for system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Save to localStorage and update HTML class when theme changes
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    
    // Add or remove dark class from document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Function to toggle theme
  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // Value object to be provided to consumers
  const value = {
    isDarkMode,
    toggleDarkMode
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeContext; 