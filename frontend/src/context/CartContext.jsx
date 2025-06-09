import { createContext, useContext, useState, useEffect } from "react";
import { updateProductInventory } from "../services/api";

// Create the context
const CartContext = createContext();

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

// Provider component
export const CartProvider = ({ children }) => {
  // Initialize cart from localStorage or empty array
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Track cart total
  const [cartTotal, setCartTotal] = useState(0);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));

    // Calculate total
    const total = cartItems.reduce((sum, item) => {
      const itemPrice = parseFloat(item.price) || 0;
      return sum + itemPrice * item.quantity;
    }, 0);
    setCartTotal(total);
  }, [cartItems]);

  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    // Use inventory value if available, otherwise use stock
    const availableStock =
      product.inventory !== undefined ? product.inventory : product.stock;

    console.log("Adding to cart:", {
      product_id: product._id,
      title: product.title,
      inStock: product.inStock,
      manageInventory: product.manageInventory,
      stock: product.stock,
      inventory: product.inventory,
      availableStock,
      quantity,
    });

    // Check if product object is valid
    if (!product || typeof product !== "object") {
      console.error("Invalid product object:", product);
      alert("Error: Invalid product data");
      return false;
    }

    // Log the stock check criteria
    console.log("Stock check criteria:", {
      isInStockFalse: product.inStock === false,
      hasZeroStock:
        product.manageInventory &&
        (availableStock === 0 || availableStock === undefined),
      wouldExceedStockIfManaged: product.manageInventory && availableStock > 0,
    });

    // Check if product is out of stock by inStock property
    if (product.inStock === false) {
      console.log("Product marked as out of stock (inStock: false)");
      alert("Sorry, this product is out of stock!");
      return false;
    }

    // Check if stock is zero or undefined
    if (
      product.manageInventory &&
      (availableStock === 0 || availableStock === undefined)
    ) {
      console.log("Product has zero or undefined stock:", availableStock);
      alert("Sorry, this product is out of stock!");
      return false;
    }

    // Check if adding would exceed available inventory
    if (product.manageInventory && availableStock > 0) {
      const existingItem = cartItems.find((item) => item._id === product._id);
      const currentInCart = existingItem ? existingItem.quantity : 0;

      console.log("Stock check:", {
        available: availableStock,
        currentInCart,
        requestedQuantity: quantity,
        wouldExceed: currentInCart + quantity > availableStock,
      });

      if (currentInCart + quantity > availableStock) {
        if (availableStock === 0) {
          alert(`Sorry, this product is out of stock!`);
        } else {
          alert(
            `Sorry, we only have ${availableStock} items in stock${
              currentInCart > 0
                ? `. You already have ${currentInCart} in your cart.`
                : "."
            }`
          );
        }
        return false;
      }
    }

    setCartItems((prevItems) => {
      // Check if product already exists in cart
      const existingItemIndex = prevItems.findIndex(
        (item) => item._id === product._id
      );

      if (existingItemIndex > -1) {
        // Update quantity if product exists
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        console.log(
          "Updated existing cart item:",
          updatedItems[existingItemIndex]
        );
        return updatedItems;
      } else {
        // Ensure price is included when adding new item
        const newProduct = {
          ...product,
          quantity,
          // Make sure price is included and is a string
          price: product.price !== undefined ? product.price.toString() : "0",
        };
        console.log("Added new item to cart:", newProduct);
        return [...prevItems, newProduct];
      }
    });

    return true; // Return true to indicate success
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item._id !== productId)
    );
  };

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return true;
    }

    // Find the product in the cart
    const cartItem = cartItems.find((item) => item._id === productId);

    if (!cartItem) {
      console.log("Item not found in cart:", productId);
      return false;
    }

    // Use inventory value if available, otherwise use stock
    const availableStock =
      cartItem.inventory !== undefined ? cartItem.inventory : cartItem.stock;

    console.log("Updating quantity:", {
      productId,
      requestedQuantity: quantity,
      itemInCart: cartItem,
      stock: cartItem?.stock,
      inventory: cartItem?.inventory,
      availableStock,
    });

    // Check if updating would exceed available inventory
    if (
      cartItem.manageInventory &&
      availableStock !== undefined &&
      quantity > availableStock
    ) {
      if (availableStock === 0) {
        alert(`This product is now out of stock!`);
      } else {
        alert(`Sorry, we only have ${availableStock} items in stock.`);
      }
      return false;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === productId ? { ...item, quantity } : item
      )
    );

    return true;
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Get total number of items in cart
  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Check if product is in cart
  const isInCart = (productId) => {
    return cartItems.some((item) => item._id === productId);
  };

  // Process checkout and update product stock
  const checkout = async () => {
    try {
      // For each product in cart, update its stock
      const updatePromises = cartItems.map((item) => {
        // Only update stock for products with inventory management
        if (item.manageInventory) {
          console.log(
            `Updating stock for ${item.title}, reducing by ${item.quantity}`
          );
          return updateProductInventory(item._id, item.quantity);
        }
        return Promise.resolve();
      });

      // Wait for all stock updates to complete
      await Promise.all(updatePromises);

      // Clear the cart after successful checkout
      clearCart();

      return { success: true };
    } catch (error) {
      console.error("Checkout error:", error);
      return {
        success: false,
        error: error.message || "Failed to complete checkout",
      };
    }
  };

  // Value object to be provided to consumers
  const value = {
    cartItems,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    isInCart,
    checkout,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
