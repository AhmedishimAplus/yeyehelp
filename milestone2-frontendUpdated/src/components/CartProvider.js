import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/cartService';

const CartContext = createContext();

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderInfo, setOrderInfo] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  // Calculate cart totals
  const calculateTotals = () => {
    console.log('Calculating totals for cart items:', cartItems); // Debug log

    // Filter out invalid items first
    const validItems = cartItems.filter(item => {
      const isValid = item.chefId && 
        item.dishName && 
        !isNaN(item.price) && 
        !isNaN(item.quantity);
      
      if (!isValid) {
        console.warn('Invalid cart item:', item); // Debug log
      }
      return isValid;
    });

    const subtotal = validItems.reduce((sum, item) => {
      const itemPrice = parseFloat(item.price) || 0;
      const itemQuantity = parseInt(item.quantity) || 1;
      const itemTotal = itemPrice * itemQuantity;
      console.log('Calculating item total:', { 
        item, 
        itemPrice, 
        itemQuantity, 
        itemTotal,
        runningTotal: sum + itemTotal 
      }); // Debug log
      return sum + itemTotal;
    }, 0);

    const tax = subtotal * 0.14; // 14% tax rate
    const total = subtotal + tax;
    console.log('Final cart totals:', { subtotal, tax, total }); // Debug log
    return { subtotal, tax, total };
  };

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
    setIsLoading(false);
  }, []);

  // Load cart from backend on mount if authenticated
  useEffect(() => {
    const fetchBackendCart = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
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
        setIsLoading(false);
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

  const addToCart = async (item) => {
    try {
      setError(null);
      
      // Check authentication first
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to add items to your cart');
        return false;
      }

      // Ensure both chefId and kitchenId are present
      if (!item.chefId && !item.kitchenId) {
        console.warn('Attempting to add item without chefId/kitchenId:', item);
        setError('Cannot add item to cart: missing chef/kitchen ID.');
        return false;
      }
      
      // Ensure price is a valid number
      const price = parseFloat(item.price);
      if (isNaN(price) || price < 0) {
        setError('Cannot add item to cart: invalid price.');
        return false;
      }
      item.price = price;

      // Ensure quantity is valid
      const quantity = Math.max(1, parseInt(item.quantity) || 1);
      item.quantity = quantity;

      // Ensure both chefId and kitchenId are set
      item.chefId = item.chefId || item.kitchenId;
      item.kitchenId = item.kitchenId || item.chefId;

      // Check if item already exists in cart
      const existingItem = cartItems.find(
        cartItem => (cartItem.chefId === item.chefId || cartItem.kitchenId === item.kitchenId) && 
                   cartItem.dishName === item.dishName
      );

      if (existingItem) {
        // Update quantity instead of adding new item
        return updateQuantity(item, existingItem.quantity + 1);
      }

      // Debug: log the item being sent to backend
      console.log('addToCart payload:', item);

      // Always try backend first if we have a token
      try {
        const response = await cartService.addToCart(item);
        console.log('Backend response:', response);
        
        if (response.data && Array.isArray(response.data.cart)) {
          // Update cart items with the converted data
          setCartItems(response.data.cart.map(item => ({
            chefId: item.chefId || item.kitchenId,
            kitchenId: item.kitchenId || item.chefId,
            dishName: item.dishName,
            quantity: parseInt(item.quantity) || 1,
            price: parseFloat(item.price) || 0
          })));
          return true;
        }
        throw new Error('Invalid cart response format');
      } catch (err) {
        console.error('Error with backend cart operation:', err);
        if (err.response?.status === 403) {
          setError('Your session has expired. Please log in again.');
          localStorage.removeItem('token');
          window.location.href = '/login';
          return false;
        }
        throw err;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
      setError('Failed to add item to cart: ' + errorMessage);
      console.error('Error adding to cart:', err);
      return false;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      setError(null);
      console.log('Updating quantity:', { itemId, quantity }); // Debug log

      // Ensure quantity is a positive number
      const newQuantity = Math.max(1, parseInt(quantity));
      
      if (localStorage.getItem('token')) {
        try {
          // Convert chefId to kitchenId if needed
          const itemIdToSend = {
            kitchenId: itemId.kitchenId || itemId.chefId,
            dishName: itemId.dishName
          };
          
          await cartService.updateCartItem(itemIdToSend, newQuantity);
          const response = await cartService.getCart();
          if (response.data && Array.isArray(response.data.cart)) {
            setCartItems(response.data.cart);
            return true;
          }
          throw new Error('Invalid cart response format');
        } catch (err) {
          console.error('Error updating cart on backend:', err);
          if (err.response?.status === 403) {
            setError('Your session has expired. Please log in again.');
            localStorage.removeItem('token');
            window.location.href = '/login';
            return false;
          }
          throw err;
        }
      }

      // Local cart update
      setCartItems(prevItems => {
        const updatedItems = prevItems.map(item => {
          const itemKitchenId = item.kitchenId || item.chefId;
          const itemIdKitchenId = itemId.kitchenId || itemId.chefId;
          if (itemKitchenId === itemIdKitchenId && item.dishName === itemId.dishName) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        });
        console.log('Updated cart items:', updatedItems); // Debug log
        return updatedItems;
      });

      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
      setError('Failed to update quantity: ' + errorMessage);
      console.error('Error updating quantity:', err);
      return false;
    }
  };

  const removeFromCart = async (item) => {
    try {
      setError(null);
      
      // Check authentication first
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to remove items from your cart');
        return false;
      }

      // Validate required fields
      if (!item.chefId) {
        setError('Cannot remove item: missing chef ID');
        return false;
      }
      if (!item.dishName) {
        setError('Cannot remove item: missing dish name');
        return false;
      }

      // Always try backend first if we have a token
      try {
        const response = await cartService.removeFromCart(item);
        console.log('Backend response:', response);
        
        if (response.data && Array.isArray(response.data.cart)) {
          // Update cart items with the converted data
          const updatedCart = response.data.cart.map(item => ({
            chefId: item.chefId || item.kitchenId,
            dishName: item.dishName,
            quantity: parseInt(item.quantity) || 1,
            price: parseFloat(item.price) || 0
          }));
          
          // Update state with new cart
          setCartItems(updatedCart);
          
          // Update localStorage
          try {
            localStorage.setItem('cart', JSON.stringify(updatedCart));
          } catch (err) {
            console.error('Error saving cart to localStorage:', err);
          }
          
          return true;
        }
        throw new Error('Invalid cart response format');
      } catch (err) {
        console.error('Error with backend cart operation:', err);
        if (err.response?.status === 403) {
          setError('Your session has expired. Please log in again.');
          localStorage.removeItem('token');
          window.location.href = '/login';
          return false;
        }
        throw err;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
      setError('Failed to remove item from cart: ' + errorMessage);
      console.error('Error removing from cart:', err);
      return false;
    }
  };

  const clearCart = async () => {
    try {
      setError(null);
      setCartItems([]);
      setOrderInfo(null);
      localStorage.removeItem('orderInfo');
      // Optionally clear backend cart if authenticated
      // (implement if you have such an endpoint)
      return true;
    } catch (err) {
      setError('Failed to clear cart. Please try again.');
      console.error('Error clearing cart:', err);
      return false;
    }
  };

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
    isLoading,
    error,
    orderInfo,
    isAuthenticated,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    setCustomerInfo,
    ...calculateTotals(),
    totalItems: cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}