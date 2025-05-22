const express = require('express');
const Cook = require('../models/Cook');
const authenticateToken = require('../middlewares/authenticateToken');
const checkRole = require('../middlewares/checkRole'); // Import the checkRole middleware

const router = express.Router();

// Middleware to check roles




// Create a new cook (Store owner or Admin only)
router.post(
    '/',
    authenticateToken,
    checkRole(['store owner', 'admin']),
    async (req, res) => {
        const { name, location, rating, menu, phone, verified, image } = req.body;

        try {
            // Ensure `menu` is an array
            const parsedMenu = Array.isArray(menu) ? menu : JSON.parse(menu);

            const newCook = new Cook({
                name,
                location,
                rating,
                menu: parsedMenu, // Use the parsed menu
                phone,
                verified,
                userId: req.user.id,
                image: image || null, // Save cook image URL
            });

            await newCook.save();
            res.status(201).json({ message: 'Cook created successfully', cook: newCook });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
);

// Add a menu item (Store owner or Admin only)
router.post(
    '/:id/menu',
    authenticateToken,
    checkRole(['store owner', 'admin']),
    async (req, res) => {
        const { dishName, price, description, available, image } = req.body;

        try {
            const cook = await Cook.findById(req.params.id);
            if (!cook) {
                return res.status(404).json({ message: 'Cook not found' });
            }

            // Ensure only the owner or admin can add menu items
            if (req.user.role === 'store owner' && cook.userId.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Access denied' });
            }

            // Check if the dishName already exists in the menu
            const duplicateDish = cook.menu.some(item => item.dishName === dishName);
            if (duplicateDish) {
                return res.status(409).json({ message: 'Dish name already exists' });
            }

            // Create the new menu item
            const newMenuItem = {
                dishName,
                price,
                description,
                available: available !== undefined ? available : true,
                image: image || null, // Save menu item image URL
            };

            cook.menu.push(newMenuItem);
            await cook.save();

            res.status(201).json({ message: 'Menu item added successfully', cook });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
);


// Update a menu item by ID (Store owner or Admin only)
router.put(
    '/:id/menu/:menuItemId',
    authenticateToken,
    checkRole(['store owner', 'admin']),
    async (req, res) => {
        const { dishName, price, description, available, image } = req.body;

        try {
            const cook = await Cook.findById(req.params.id);
            if (!cook) {
                return res.status(404).json({ message: 'Cook not found' });
            }

            // Ensure only the owner or admin can update menu items
            if (req.user.role === 'store owner' && cook.userId.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Access denied' });
            }

            // Find the menu item by its ID
            const menuItem = cook.menu.id(req.params.menuItemId);
            if (!menuItem) {
                return res.status(404).json({ message: 'Menu item not found' });
            }

            // Check if the new dishName already exists in the menu
            if (dishName !== undefined && dishName !== menuItem.dishName) {
                const duplicateDish = cook.menu.some(item => item.dishName === dishName);
                if (duplicateDish) {
                    return res.status(409).json({ message: 'Dish name already exists' });
                }
                menuItem.dishName = dishName; // Update dishName if it doesn't exist
            }

            // Update only the provided fields
            if (price !== undefined) menuItem.price = price;
            if (description !== undefined) menuItem.description = description;
            if (available !== undefined) menuItem.available = available;
            if (image !== undefined) menuItem.image = image;

            await cook.save();

            res.status(200).json({ message: 'Menu item updated successfully', cook });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
);




// Delete a menu item by ID (Store owner only)
router.delete(
    '/:cookId/menu/:menuItemId',
    authenticateToken,
    checkRole(['store owner']),
    async (req, res) => {
        try {
            const { cookId, menuItemId } = req.params;

            const cook = await Cook.findById(cookId);
            if (!cook) {
                return res.status(404).json({ message: 'Cook not found' });
            }

            // Ensure only the owner can delete menu items
            if (cook.userId.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Access denied' });
            }

            // Remove the menu item by its ID
            const menuItem = cook.menu.id(menuItemId);
            if (!menuItem) {
                return res.status(404).json({ message: 'Menu item not found' });
            }

            menuItem.remove(); // Remove the menu item
            await cook.save();

            res.status(200).json({ message: 'Menu item deleted successfully', cook });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
);

// Delete a cook (Store owner or Admin only)
router.delete(
    '/:id',
    authenticateToken,
    checkRole(['store owner', 'admin']),
    async (req, res) => {
        try {
            const { id } = req.params;

            const cook = await Cook.findById(id);
            if (!cook) {
                return res.status(404).json({ message: 'Cook not found' });
            }

            // Ensure only the owner or admin can delete the cook
            if (req.user.role === 'store owner' && cook.userId.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Access denied' });
            }

            await cook.deleteOne();
            res.status(200).json({ message: 'Cook deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
);

// Update a cook (Store owner or Admin only)
router.put(
    '/:id',
    authenticateToken,
    checkRole(['store owner', 'admin']),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { name, location, rating, phone, verified, image } = req.body;

            const cook = await Cook.findById(id);
            if (!cook) {
                return res.status(404).json({ message: 'Cook not found' });
            }

            // Ensure only the owner or admin can update the cook
            if (req.user.role === 'store owner' && cook.userId.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Access denied' });
            }

            // Update only the provided fields
            if (name !== undefined) cook.name = name;
            if (location !== undefined) cook.location = location;
            if (rating !== undefined) cook.rating = rating;
            if (phone !== undefined) cook.phone = phone;
            if (verified !== undefined) cook.verified = verified;
            if (image !== undefined) cook.image = image;

            await cook.save();

            res.status(200).json({ message: 'Cook updated successfully', cook });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
);

// Get all cooks
router.get(
    '/',// Allow all roles to view cooks
    async (req, res) => {
        try {
            const cooks = await Cook.find();
            res.status(200).json({ message: 'Cooks retrieved successfully', cooks });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
);

// Get a single cook by ID
router.get(
    '/:id', // Allow all roles to view a single cook
    async (req, res) => {
        try {
            const cook = await Cook.findById(req.params.id);
            if (!cook) {
                return res.status(404).json({ message: 'Cook not found' });
            }
            res.status(200).json({ message: 'Cook retrieved successfully', cook });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
);



module.exports = router;