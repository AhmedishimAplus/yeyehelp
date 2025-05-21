import api from '../utils/api';

export const cartService = {
  // Get user's cart
  getCart: async () => {
    try {
      console.log('Getting cart...');
      const response = await api.get('/purchases/cart');
      console.log('Cart response:', response.data);

      // Format the cart data to ensure all required fields are present
      if (response.data && Array.isArray(response.data.cart)) {
        const formattedCart = response.data.cart.map(item => {
          // Ensure both chefId and kitchenId are set
          const chefId = item.chefId || item.kitchenId;
          const kitchenId = item.kitchenId || item.chefId;
          
          return {
            chefId,
            kitchenId,
            dishName: item.dishName,
            quantity: parseInt(item.quantity) || 1,
            price: parseFloat(item.price) || 0,
            image: item.image,
            description: item.description
          };
        });

        // Filter out any invalid items
        const validCart = formattedCart.filter(item => 
          item.chefId && 
          item.kitchenId && 
          item.dishName && 
          !isNaN(item.quantity) && 
          !isNaN(item.price)
        );

        return {
          ...response,
          data: {
            ...response.data,
            cart: validCart
          }
        };
      }
      return response;
    } catch (error) {
      console.error('Error getting cart:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Add item to cart
  addToCart: async (item) => {
    try {
      console.log('Adding item to cart:', item);
      
      // Validate item data
      if (!item.chefId && !item.kitchenId) {
        throw new Error('Missing chefId/kitchenId');
      }
      if (!item.dishName) {
        throw new Error('Missing dishName');
      }
      if (!item.price || isNaN(parseFloat(item.price))) {
        throw new Error('Invalid or missing price');
      }

      // Ensure all required fields are present and properly formatted
      const payload = {
        kitchenId: (item.chefId || item.kitchenId).toString(), // Convert to string for ObjectId
        dishName: item.dishName,
        quantity: Math.max(1, parseInt(item.quantity) || 1),
        price: parseFloat(item.price) // Ensure price is a number
      };

      // Log the exact payload being sent
      console.log('Sending cart payload:', payload);
      
      // First check if item already exists in cart
      const cartResponse = await api.get('/cart');
      const currentCart = cartResponse.data.cart || [];
      const existingItem = currentCart.find(
        cartItem => cartItem.kitchenId === payload.kitchenId && cartItem.dishName === payload.dishName
      );

      let response;
      if (existingItem) {
        // Update quantity if item exists
        response = await api.put('/cart', {
          kitchenId: payload.kitchenId,
          dishName: payload.dishName,
          quantity: existingItem.quantity + payload.quantity,
          price: payload.price // Ensure price is updated
        });
      } else {
        // Add new item if it doesn't exist
        response = await api.post('/cart', payload);
      }

      console.log('Cart operation response:', response.data);

      // Verify the cart item was added/updated correctly
      const updatedCartResponse = await api.get('/cart');
      const updatedCart = updatedCartResponse.data.cart || [];
      const updatedItem = updatedCart.find(
        cartItem => cartItem.kitchenId === payload.kitchenId && cartItem.dishName === payload.dishName
      );
      
      if (!updatedItem) {
        throw new Error('Failed to add item to cart');
      }

      // Return the updated cart item with the correct format for the frontend
      return {
        ...response,
        data: {
          ...response.data,
          cart: updatedCart.map(item => ({
            chefId: item.kitchenId,
            kitchenId: item.kitchenId,
            dishName: item.dishName,
            quantity: item.quantity,
            price: parseFloat(item.price) // Ensure price is included and parsed as float
          }))
        }
      };
    } catch (error) {
      console.error('Error adding to cart:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },
  
  // Update cart item quantity
  updateCartItem: async (itemId, quantity) => {
    try {
      console.log('Updating cart item:', { itemId, quantity });
      
      // Get current cart to find the item's price
      const cartResponse = await api.get('/purchases/cart');
      const currentCart = cartResponse.data.cart || [];
      const existingItem = currentCart.find(
        item => item.kitchenId === itemId.kitchenId && item.dishName === itemId.dishName
      );

      if (!existingItem) {
        throw new Error('Item not found in cart');
      }

      const payload = {
        kitchenId: itemId.kitchenId,
        dishName: itemId.dishName,
        quantity: Math.max(1, parseInt(quantity)),
        price: parseFloat(existingItem.price) // Keep the existing price
      };
      
      console.log('Sending update payload:', payload);
      const response = await api.put('/purchases/cart', payload);
      console.log('Update response:', response.data);
      return response;
    } catch (error) {
      console.error('Error updating cart item:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },
  
  // Remove item from cart
  removeFromCart: async (item) => {
    try {
      console.log('Removing item from cart:', item);
      
      // Validate item data
      if (!item.chefId) {
        throw new Error('Missing chefId');
      }
      if (!item.dishName) {
        throw new Error('Missing dishName');
      }

      // Format payload for backend
      const payload = {
        kitchenId: item.chefId.toString(),
        dishName: item.dishName
      };

      console.log('Sending remove payload:', payload);
      
      const response = await api.delete('/purchases/cart', { data: payload });
      console.log('Remove response:', response.data);

      // Verify the cart item was removed correctly
      const updatedCartResponse = await api.get('/purchases/cart');
      const updatedCart = updatedCartResponse.data.cart || [];
      
      // Return the updated cart with the correct format for the frontend
      return {
        ...response,
        data: {
          ...response.data,
          cart: updatedCart.map(item => ({
            chefId: item.kitchenId,
            dishName: item.dishName,
            quantity: parseInt(item.quantity) || 1,
            price: parseFloat(item.price) || 0
          }))
        }
      };
    } catch (error) {
      console.error('Error removing from cart:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },
  
  // Create order from cart
  createOrder: async (orderData) => {
    try {
      console.log('Creating order with data:', orderData);
      
      // Get current cart state
      const cartResponse = await api.get('/purchases/cart');
      console.log('Raw cart response:', cartResponse);
      const currentCart = cartResponse.data.cart || [];
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
      const response = await api.post('/purchases', formattedOrder);
      console.log('Order response:', response.data);
      return response;
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
  getOrderHistory: () => api.get('/users/order-history'),
  
  // Get specific order
  getOrder: (orderId) => api.get(`/purchases/${orderId}`),
};

export default cartService;