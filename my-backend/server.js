require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

const port = process.env.PORT || 3000; // Use PORT from .env or default to 3000

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI; // Use MONGO_URI from .env
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Middleware to parse JSON requests
app.use(express.json());

// CORS middleware
app.use(cors({
  origin: [
    'http://localhost:3000', // React dev server default
    'http://localhost:3001'  // In case you use a different port
  ],
  credentials: true
}));

// Routes
const usersRouter = require('./routes/User');
app.use('/api/users', usersRouter);

const purchasesRouter = require('./routes/Purchase');
app.use('/api/purchases', purchasesRouter);

const cooksRouter = require('./routes/Cook');
app.use('/api/cooks', cooksRouter);

// Example route for testing
app.get('/', (req, res) => {
  res.send('Welcome to the REST API!');
});

// Error test route
app.get('/error', (req, res, next) => {
  next(new Error("Test error!"));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


