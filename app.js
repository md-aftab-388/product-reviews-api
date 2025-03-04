const express = require('express');
require('dotenv').config();
const db = require('./config/database');
const reviewRoutes = require('./routes/reviewRoutes');
const cors = require('cors');
const morgan = require('morgan');
// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/reviews', reviewRoutes);

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Product Reviews API',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      getAllReviews: 'GET /reviews',
      getReviewByProductId: 'GET /reviews/:productId',
      createReview: 'POST /reviews',
      getTopRatedProducts: 'GET /reviews/top-rated'
    }
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await db.initialize();
    app.listen(PORT, () => {
      console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await db.closePool();
    console.log('Application terminated gracefully');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown', err);
    process.exit(1);
  }
});

// Start the server
startServer(); 