import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/cartService';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderInfo, setOrderInfo] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await cartService.getCart();
      setCartItems(response.cart || []);
      setError(null);
    } catch (err) {
      setError('Failed to load cart');
      console.error('Error loading cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (item) => {
    try {
      const response = await cartService.addToCart(item);
      setCartItems(response.cart || []);
      setError(null);
    } catch (err) {
      setError('Failed to add item to cart');
      throw err;
    }
  };

  const updateQuantity = async (item, newQuantity) => {
    try {
      const response = await cartService.updateQuantity(item, newQuantity);
      setCartItems(response.cart || []);
      setError(null);
    } catch (err) {
      setError('Failed to update quantity');
      throw err;
    }
  };

  const removeFromCart = async (item) => {
    try {
      const response = await cartService.removeFromCart(item);
      setCartItems(response.cart || []);
      setError(null);
    } catch (err) {
      setError('Failed to remove item');
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setCartItems([]);
      setError(null);
    } catch (err) {
      setError('Failed to clear cart');
      throw err;
    }
  };

  // Calculate cart totals
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const tax = subtotal * 0.14; // 14% tax
  const total = subtotal + tax;

  // Load cart items and order info from localStorage when component mounts
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedOrderInfo = localStorage.getItem('orderInfo');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Ensure each item has both chefId and kitchenId
        const formattedCart = parsedCart.map(item => ({
          chefId: item.chefId || item.kitchenId,
          kitchenId: item.kitchenId || item.chefId,
          dishName: item.dishName,
          quantity: parseInt(item.quantity) || 1,
          price: parseFloat(item.price) || 0,
          image: item.image,
          description: item.description
        }));
        setCartItems(formattedCart);
      } catch (err) {
        console.error('Error loading cart from localStorage:', err);
        setError('Failed to load cart data. Please refresh the page.');
      }
    }
    if (savedOrderInfo) {
      try {
        setOrderInfo(JSON.parse(savedOrderInfo));
      } catch (err) {
        console.error('Error loading order info from localStorage:', err);
        setError('Failed to load delivery information. Please re-enter your details.');
      }
    }
    setLoading(false);
  }, []);

  // Load cart from backend on mount if authenticated
  useEffect(() => {
    const fetchBackendCart = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await cartService.getCart();
        if (response.data && Array.isArray(response.data.cart)) {
          // Filter out invalid items
          const validCart = response.data.cart.filter(item =>
            item.chefId &&
            item.dishName &&
            !isNaN(item.price) &&
            !isNaN(item.quantity)
          );
          setCartItems(validCart);
        }
      } catch (err) {
        console.error('Error loading cart from backend:', err);
        if (err.response?.status === 403) {
          setError('Your session has expired. Please log in again.');
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBackendCart();
  }, []);

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    try {
      // Filter out invalid items before saving
      const validCart = cartItems.filter(item =>
        item.chefId &&
        item.dishName &&
        !isNaN(item.price) &&
        !isNaN(item.quantity)
      );
      localStorage.setItem('cart', JSON.stringify(validCart));
    } catch (err) {
      console.error('Error saving cart to localStorage:', err);
      setError('Failed to save cart. Please check your browser storage settings.');
    }
  }, [cartItems]);

  // Save order info to localStorage whenever it changes
  useEffect(() => {
    try {
      if (orderInfo) {
        localStorage.setItem('orderInfo', JSON.stringify(orderInfo));
      } else {
        localStorage.removeItem('orderInfo');
      }
    } catch (err) {
      console.error('Error saving order info to localStorage:', err);
      setError('Failed to save delivery information. Please try again.');
    }
  }, [orderInfo]);

  const setCustomerInfo = (info) => {
    try {
      if (!info.name || !info.location) {
        throw new Error('Name and location are required');
      }
      setOrderInfo(info);
      setError(null);
    } catch (err) {
      setError('Failed to save customer information. Please ensure all fields are filled.');
      console.error('Error setting customer info:', err);
    }
  };

  const value = {
    cartItems,
    loading,
    error,
    orderInfo,
    isAuthenticated,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    setCustomerInfo,
    subtotal,
    tax,
    total,
    totalItems: cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};