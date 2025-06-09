import { createContext, useContext, useState, useEffect } from 'react';

// List of available currencies with their symbols and conversion rates (relative to USD)
export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.37 },
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.93 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 149.27 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.38 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.52 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rate: 7.22 },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', rate: 5.06 },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', rate: 89.69 },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', rate: 1342.53 },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso', rate: 16.72 },
];

// Create context
const CurrencyContext = createContext();

// Hook to use the currency context
export const useCurrency = () => useContext(CurrencyContext);

// Provider component
export const CurrencyProvider = ({ children }) => {
  // Get saved currency from localStorage or default to INR
  const [currency, setCurrency] = useState(() => {
    const savedCurrency = localStorage.getItem('userCurrency');
    if (savedCurrency) {
      const parsed = JSON.parse(savedCurrency);
      // Verify the currency exists in our list
      if (CURRENCIES.some(c => c.code === parsed.code)) {
        return parsed;
      }
    }
    
    // Always use INR as default currency regardless of locale
    return CURRENCIES.find(c => c.code === 'INR');
  });

  // Save to localStorage when currency changes
  useEffect(() => {
    localStorage.setItem('userCurrency', JSON.stringify(currency));
  }, [currency]);

  // Function to change currency
  const changeCurrency = (currencyCode) => {
    const newCurrency = CURRENCIES.find(c => c.code === currencyCode);
    if (newCurrency) {
      setCurrency(newCurrency);
    }
  };

  // Get currency by code
  const getCurrencyByCode = (code) => {
    return CURRENCIES.find(c => c.code === code) || CURRENCIES[0]; // Default to INR if not found
  };

  // Convert price from one currency to another
  const convertBetweenCurrencies = (price, fromCurrencyCode, toCurrencyCode) => {
    if (!price || isNaN(parseFloat(price))) return 0;
    
    const fromCurrency = getCurrencyByCode(fromCurrencyCode);
    const toCurrency = getCurrencyByCode(toCurrencyCode);
    
    // Convert to USD as base currency first, then to target currency
    const priceInUSD = parseFloat(price) / fromCurrency.rate;
    return priceInUSD * toCurrency.rate;
  };
  
  // Convert product price to user's currency
  const convertProductPrice = (price, productCurrency) => {
    return convertBetweenCurrencies(price, productCurrency || 'USD', currency.code);
  };

  // Format a price with the current currency symbol
  const formatPrice = (price, currencyCode = currency.code) => {
    if (price === 0 || !price) return 'Free';
    
    const currencyToUse = getCurrencyByCode(currencyCode);
    
    // For INR, use specific Indian format with ₹ symbol
    if (currencyToUse.code === 'INR') {
      const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
      
      // Ensure ₹ symbol is displayed correctly
      return formattedAmount.replace(/INR/, '₹');
    }
    
    // For other currencies, use regular formatting
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyToUse.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
    
    return formattedPrice;
  };

  // Value object to be provided to consumers
  const value = {
    currency,
    currencies: CURRENCIES,
    changeCurrency,
    convertProductPrice,
    convertBetweenCurrencies,
    formatPrice,
    getCurrencyByCode
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export default CurrencyContext; 