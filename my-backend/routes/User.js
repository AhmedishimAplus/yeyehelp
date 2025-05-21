const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middlewares/authenticateToken');
const User = require('../models/User'); // Import the User model

const router = express.Router();
const SECRET_KEY = 'your-secret-key'; // Use a secure key in production

// Register route
router.post('/register', async (req, res) => {
  const { name, email, password, phone, address, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  // Validate the role
  const allowedRoles = ['admin', 'store owner', 'user'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role. Allowed roles are admin, store owner, and user.' });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone: phone || '', // Default to empty string if not provided
      address: address || '', // Default to empty string if not provided
      favorites: [], // Default to empty array
      orderHistory: [], // Default to empty array
      cart: [], // Default to empty array
      role, // Assign the validated role
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: 'User registered' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign({ email: user.email, id: user._id, name: user.name, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    console.log(token);

    res.json({ message: 'Login successful', token, user: { name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Protected route example
router.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: `Hello, ${req.user.name}` });
});

// Display Cart Array
router.get('/cart', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Cart retrieved successfully', cart: user.cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Display Favorites Array
router.get('/favorites', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Favorites retrieved successfully', favorites: user.favorites });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Display Order History Array
router.get('/order-history', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('orderHistory.purchaseId'); // Populate purchase details
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Order history retrieved successfully', orderHistory: user.orderHistory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update User
router.put('/update', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update only the fields provided in the request body
    const { name, email, phone, address, password } = req.body;

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    // If password is provided, hash it before saving
    if (password !== undefined) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete User
router.delete('/delete', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
