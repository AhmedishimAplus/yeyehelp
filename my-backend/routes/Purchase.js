const express = require('express');
const User = require('../models/User');
const Cook = require('../models/Cook'); // Assuming Cook contains menu items with prices
const Purchase = require('../models/Purchase');
const authenticateToken = require('../middlewares/authenticateToken');

const router = express.Router();

// Add to Cart
router.post('/cart', authenticateToken, async (req, res) => {
    const { kitchenId, dishName, quantity, price } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate required fields
        if (!kitchenId || !dishName || !quantity || !price) {
            return res.status(400).json({
                message: 'Missing required fields',
                required: ['kitchenId', 'dishName', 'quantity', 'price']
            });
        }

        // Validate data types
        if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
            return res.status(400).json({ message: 'Invalid price' });
        }
        if (isNaN(parseInt(quantity)) || parseInt(quantity) < 1) {
            return res.status(400).json({ message: 'Invalid quantity' });
        }

        // Check if the dish is already in the cart
        const existingCartItem = user.cart.find(
            item => item.kitchenId === kitchenId && item.dishName === dishName
        );

        if (existingCartItem) {
            // Update the quantity if the dish is already in the cart
            existingCartItem.quantity += parseInt(quantity);
            existingCartItem.price = parseFloat(price); // Update price
        } else {
            // Add a new item to the cart
            user.cart.push({
                kitchenId,
                dishName,
                quantity: parseInt(quantity),
                price: parseFloat(price)
            });
        }

        await user.save();
        res.status(200).json({
            message: 'Item added to cart successfully',
            cart: user.cart
        });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update Cart Item
router.put('/cart', authenticateToken, async (req, res) => {
    const { kitchenId, dishName, quantity, price } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate required fields
        if (!kitchenId || !dishName || !quantity || !price) {
            return res.status(400).json({
                message: 'Missing required fields',
                required: ['kitchenId', 'dishName', 'quantity', 'price']
            });
        }

        // Validate data types
        if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
            return res.status(400).json({ message: 'Invalid price' });
        }
        if (isNaN(parseInt(quantity)) || parseInt(quantity) < 1) {
            return res.status(400).json({ message: 'Invalid quantity' });
        }

        // Find the item in the cart
        const cartItem = user.cart.find(
            item => item.kitchenId === kitchenId && item.dishName === dishName
        );

        if (!cartItem) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        // Update the item
        cartItem.quantity = parseInt(quantity);
        cartItem.price = parseFloat(price);

        await user.save();
        res.status(200).json({
            message: 'Cart item updated successfully',
            cart: user.cart
        });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Remove from Cart
router.delete('/cart', authenticateToken, async (req, res) => {
    const { kitchenId, dishName } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Filter out the item to be removed
        const initialCartLength = user.cart.length;
        user.cart = user.cart.filter(
            item => !(item.kitchenId === kitchenId && item.dishName === dishName)
        );

        if (user.cart.length === initialCartLength) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        await user.save();
        res.status(200).json({ message: 'Item removed from cart successfully', cart: user.cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Clear entire cart for authenticated user
router.delete('/cart/clear', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.cart = [];
        await user.save();
        res.status(200).json({ message: 'Cart cleared successfully', cart: user.cart });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add to Favorites
router.post('/favorites', authenticateToken, async (req, res) => {
    const { dishId } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the dish is already in favorites
        const existingFavorite = user.favorites.find(fav => fav.dishId === dishId);
        if (existingFavorite) {
            return res.status(409).json({ message: 'Dish is already in favorites' });
        }

        // Fetch the dish details from the database
        const cook = await Cook.findOne({ 'menu._id': dishId });
        if (!cook) {
            return res.status(404).json({ message: 'Dish not found' });
        }

        const dish = cook.menu.id(dishId);
        if (!dish) {
            return res.status(404).json({ message: 'Dish not found in the menu' });
        }

        // Add the dish details to the favorites array
        user.favorites.push({
            dishName: dish.dishName,
            description: dish.description,
            price: dish.price,
            dishImage: dish.image || null, // Save dish image URL
        });

        await user.save();
        res.status(200).json({ message: 'Dish added to favorites successfully', favorites: user.favorites });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Remove from Favorites
router.delete('/favorites', authenticateToken, async (req, res) => {
    const { dishId } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Filter out the dish to be removed
        const initialFavoritesLength = user.favorites.length;
        user.favorites = user.favorites.filter(id => id !== dishId);

        if (user.favorites.length === initialFavoritesLength) {
            return res.status(404).json({ message: 'Dish not found in favorites' });
        }

        await user.save();
        res.status(200).json({ message: 'Dish removed from favorites successfully', favorites: user.favorites });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get Total Price of Cart
router.get('/cart/total', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let totalPrice = 0;

        for (const cartItem of user.cart) {
            const cook = await Cook.findById(cartItem.kitchenId);
            if (!cook) {
                return res.status(404).json({ message: `Kitchen with ID ${cartItem.kitchenId} not found` });
            }

            const menuItem = cook.menu.find(item => item.dishName === cartItem.dishName);
            if (!menuItem) {
                return res.status(404).json({ message: `Dish ${cartItem.dishName} not found in kitchen ${cartItem.kitchenId}` });
            }

            totalPrice += menuItem.price * cartItem.quantity;
        }

        res.status(200).json({ message: 'Total price calculated successfully', totalPrice });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Purchase Cart Items
router.post('/purchase', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.cart.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        let totalPrice = 0;
        const purchaseItems = [];

        for (const cartItem of user.cart) {
            const cook = await Cook.findById(cartItem.kitchenId);
            if (!cook) {
                return res.status(404).json({ message: `Kitchen with ID ${cartItem.kitchenId} not found` });
            }

            const menuItem = cook.menu.find(item => item.dishName === cartItem.dishName);
            if (!menuItem) {
                return res.status(404).json({ message: `Dish ${cartItem.dishName} not found in kitchen ${cartItem.kitchenId}` });
            }

            const itemTotalPrice = menuItem.price * cartItem.quantity;
            totalPrice += itemTotalPrice;

            purchaseItems.push({
                kitchenId: cartItem.kitchenId,
                dishName: cartItem.dishName,
                quantity: cartItem.quantity,
                price: menuItem.price
            });
        }

        // Create a new purchase
        const newPurchase = new Purchase({
            userId: user._id,
            items: purchaseItems,
            totalPrice
        });

        await newPurchase.save();

        // Add purchase ID to orderHistory
        user.orderHistory.push({ purchaseId: newPurchase._id });

        // Empty the cart
        user.cart = [];

        await user.save();

        res.status(201).json({ message: 'Purchase completed successfully', purchase: newPurchase });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get Cart (for authenticated user)
router.get('/cart', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ cart: user.cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all purchases from a specific kitchen
router.get('/kitchen/:kitchenId/purchases', authenticateToken, async (req, res) => {
    const { kitchenId } = req.params;

    try {
        // Find all purchases that include items from the specified kitchen
        const purchases = await Purchase.find({ 'items.kitchenId': kitchenId });

        if (purchases.length === 0) {
            return res.status(404).json({ message: 'No purchases found for this kitchen' });
        }

        // Filter items to include only those from the specified kitchen
        const filteredPurchases = purchases.map(purchase => {
            const filteredItems = purchase.items.filter(item => item.kitchenId.toString() === kitchenId);

            return {
                purchaseId: purchase._id,
                userId: purchase.userId,
                items: filteredItems, // Only items from the specified kitchen
                purchasedAt: purchase.purchasedAt
            };
        }).filter(purchase => purchase.items.length > 0); // Remove purchases with no matching items

        res.status(200).json({ message: 'Purchases retrieved successfully', purchases: filteredPurchases });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Calculate total number of sales and total revenue for a specific kitchen
router.get('/kitchen/:kitchenId/stats', authenticateToken, async (req, res) => {
    const { kitchenId } = req.params;

    try {
        // Find all purchases that include items from the specified kitchen
        const purchases = await Purchase.find({ 'items.kitchenId': kitchenId });

        if (purchases.length === 0) {
            return res.status(404).json({ message: 'No purchases found for this kitchen' });
        }

        // Calculate total sales and total revenue
        let totalSales = 0;
        let totalRevenue = 0;

        purchases.forEach(purchase => {
            purchase.items.forEach(item => {
                if (item.kitchenId.toString() === kitchenId) {
                    totalSales += item.quantity; // Add the quantity of items sold
                    totalRevenue += item.price * item.quantity; // Add the revenue from the item
                }
            });
        });

        // Return the result
        res.status(200).json({
            message: `You appeared in ${totalSales} sales and total combined sales is ${totalRevenue} amount`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create new purchase
router.post('/', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { items, totalPrice, paymentMethod, customerInfo } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'No items provided for purchase' });
        }

        // Create a new purchase
        const newPurchase = new Purchase({
            userId: user._id,
            items: items.map(item => ({
                kitchenId: item.kitchenId,
                dishName: item.dishName,
                quantity: item.quantity,
                price: item.price
            })),
            totalPrice,
            paymentMethod,
            customerInfo,
            status: 'pending'
        });

        await newPurchase.save();

        // Add purchase ID to orderHistory
        user.orderHistory.push({ purchaseId: newPurchase._id });

        // Empty the cart
        user.cart = [];

        await user.save();

        res.status(201).json({
            message: 'Purchase completed successfully',
            purchase: newPurchase
        });
    } catch (error) {
        console.error('Error creating purchase:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get specific purchase by ID
router.get('/:purchaseId', authenticateToken, async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.purchaseId);
        if (!purchase) {
            return res.status(404).json({ message: 'Purchase not found' });
        }
        res.status(200).json({ message: 'Purchase retrieved successfully', purchase });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Complete Purchase
router.post('/complete', authenticateToken, async (req, res) => {
    const { paymentMethod } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.cart || user.cart.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        if (!paymentMethod || !['cash', 'visa'].includes(paymentMethod)) {
            return res.status(400).json({ message: 'Invalid payment method' });
        }

        // Calculate total price
        const totalPrice = user.cart.reduce((total, item) => total + (item.price * item.quantity), 0);

        // Create new purchase
        const purchase = new Purchase({
            userId: user._id,
            items: user.cart,
            totalPrice,
            paymentMethod,
            status: 'completed'
        });

        // Update cook sales statistics
        for (const item of user.cart) {
            const cook = await Cook.findById(item.kitchenId);
            if (cook) {
                cook.salesStats.totalSales += item.quantity;
                cook.salesStats.totalOrders += 1;
                cook.salesStats.totalRevenue += (item.price * item.quantity);
                await cook.save();
            }
        }

        // Save purchase and clear cart
        await purchase.save();
        user.orderHistory.push(purchase._id);
        user.cart = [];
        await user.save();

        res.status(200).json({
            message: 'Purchase completed successfully',
            purchase
        });
    } catch (error) {
        console.error('Error completing purchase:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get user's purchase history
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const purchases = await Purchase.find({ userId: req.user.id })
            .sort({ purchasedAt: -1 }); // Sort by date, newest first

        res.status(200).json({
            success: true,
            purchases: purchases.map(purchase => ({
                purchasedAt: purchase.purchasedAt,
                items: purchase.items,
                totalPrice: purchase.totalPrice,
                paymentMethod: purchase.paymentMethod,
                status: purchase.status
            }))
        });
    } catch (error) {
        console.error('Error getting purchase history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch purchase history'
        });
    }
});

module.exports = router;