const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// POST /reviews - Submit a new product review
router.post('/', reviewController.createReview);

// GET /reviews - Retrieve all reviews
router.get('/', reviewController.getAllReviews);

// GET /reviews/top-rated - Get top 3 most positively reviewed products
router.get('/top-rated', reviewController.getTopRatedProducts);


// GET /reviews/:productId - Retrieve all reviews for a specific product
router.get('/:productId', reviewController.getReviewsByProductId);


module.exports = router; 