import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const cartService = {
  // Get user's cart
  getCart: async () => {
    try {
      console.log('Getting cart...');
      const response = await axios.get(`${API_URL}/purchases/cart`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Cart response:', response.data);

      // Ensure we have a valid response structure
      if (!response.data) {
        return { data: { cart: [] } };
      }

      // If cart is not an array, initialize it
      if (!Array.isArray(response.data.cart)) {
        response.data.cart = [];
      }

      // Format the cart data
      const formattedCart = response.data.cart.map(item => ({
        chefId: item.chefId || item.kitchenId,
        kitchenId: item.kitchenId || item.chefId,
        dishName: item.dishName || '',
        quantity: parseInt(item.quantity) || 1,
        price: parseFloat(item.price) || 0,
        image: item.image || '',
        description: item.description || ''
      }));

      // Filter out invalid items
      const validCart = formattedCart.filter(item =>
        item.chefId &&
        item.kitchenId &&
        item.dishName &&
        !isNaN(item.quantity) &&
        !isNaN(item.price)
      );

      return {
        data: {
          cart: validCart,
          totalItems: validCart.length,
          totalPrice: validCart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        }
      };
    } catch (error) {
      console.error('Error getting cart:', error);
      // Return empty cart on error
      return { data: { cart: [] } };
    }
  },

  // Add item to cart
  addToCart: async (item) => {
    try {
      const response = await axios.post(`${API_URL}/purchases/cart`, item, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update cart item quantity
  updateQuantity: async (item, newQuantity) => {
    try {
      const response = await axios.put(`${API_URL}/purchases/cart`, {
        ...item,
        quantity: newQuantity
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Remove item from cart
  removeFromCart: async (item) => {
    try {
      const response = await axios.delete(`${API_URL}/purchases/cart`, {
        data: item,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Clear cart
  clearCart: async () => {
    try {
      const response = await axios.delete(`${API_URL}/purchases/cart/clear`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Complete purchase
  completePurchase: async (purchaseData) => {
    try {
      const response = await axios.post(`${API_URL}/purchases/complete`, purchaseData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create order from cart
  createOrder: async (orderData) => {
    try {
      console.log('Creating order with data:', orderData);

      // Get current cart state
      const cartResponse = await axios.get(`${API_URL}/purchases/cart`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Raw cart response:', cartResponse);

      // Ensure cart data exists
      if (!cartResponse.data || !cartResponse.data.cart) {
        throw new Error('Invalid cart data received');
      }

      const currentCart = cartResponse.data.cart;
      console.log('Current cart items:', currentCart);

      if (currentCart.length === 0) {
        throw new Error('Cart is empty');
      }

      // Calculate total price and validate items
      let totalPrice = 0;
      const validatedItems = [];

      for (const item of currentCart) {
        console.log('Processing cart item:', item);

        // Get the kitchen ID from the correct field
        const kitchenId = item.kitchenId || item.chefId;

        // Skip invalid items
        if (!kitchenId || !item.dishName || !item.quantity || !item.price) {
          console.warn('Skipping invalid cart item:', {
            item,
            kitchenId,
            dishName: item.dishName,
            quantity: item.quantity,
            price: item.price
          });
          continue;
        }

        const quantity = Math.max(1, parseInt(item.quantity) || 1);
        const price = parseFloat(item.price);
        totalPrice += price * quantity;

        validatedItems.push({
          kitchenId: kitchenId.toString(),
          dishName: item.dishName,
          quantity: quantity,
          price: price
        });
      }

      if (validatedItems.length === 0) {
        throw new Error('No valid items in cart. Please check your cart items.');
      }

      // Format the order data to match the backend schema exactly
      const formattedOrder = {
        items: validatedItems.map(item => ({
          ...item,
          kitchenId: item.kitchenId.toString().padStart(24, '0') // Ensure kitchenId is a 24-character string
        })),
        totalPrice: totalPrice
      };

      // Log the exact data being sent to match schema
      console.log('Sending formatted order matching schema:', formattedOrder);

      // Use the correct endpoint for creating a purchase
      const response = await axios.post(`${API_URL}/purchases`, formattedOrder, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Order response:', response.data);

      // Ensure response has the expected structure
      if (!response.data) {
        throw new Error('Invalid response from server');
      }

      return {
        ...response,
        data: {
          ...response.data,
          items: response.data.items || [], // Ensure items array exists
          totalPrice: response.data.totalPrice || 0
        }
      };
    } catch (error) {
      console.error('Error creating order:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // Get order history
  getOrderHistory: () => axios.get(`${API_URL}/users/order-history`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  }),

  // Get specific order
  getOrder: async (orderId) => {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      const response = await axios.get(`${API_URL}/purchases/${orderId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Ensure response has the expected structure
      if (!response.data) {
        throw new Error('Invalid response from server');
      }

      return {
        ...response,
        data: {
          ...response.data,
          items: response.data.items || [], // Ensure items array exists
          totalPrice: response.data.totalPrice || 0
        }
      };
    } catch (error) {
      console.error('Error getting order:', {
        orderId,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // Get purchase history
  getPurchaseHistory: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/purchases/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch purchase history');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching purchase history:', error);
      throw error;
    }
  }
};

export default cartService;