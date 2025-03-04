const Review = require('../models/reviewModel');
const Product = require('../models/productModel');
const { z } = require('zod');

// Review schema validation
const reviewSchema = z.object({
  productId: z.string().or(z.number()).transform(val => Number(val)),
  rating: z.number().min(1).max(5).or(z.string().transform(val => Number(val))),
  comment: z.string().max(1000).optional(),
});

// Create a new review
exports.createReview = async (req, res) => {
  try {
    // Validate request body
    const validatedData = reviewSchema.parse(req.body);
    
    // Check if product exists
    const product = await Product.getById(validatedData.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${validatedData.productId} not found`
      });
    }
    
    // Create review
    const review = await Review.create(validatedData);
    
    return res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review data',
        errors: err.errors
      });
    }
    
    console.error('Error creating review:', err);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating the review'
    });
  }
};

// Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.getAll();
    
    return res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching reviews'
    });
  }
};

// Get reviews by product ID
exports.getReviewsByProductId = async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    
    // Check if product exists
    const product = await Product.getById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${productId} not found`
      });
    }
    
    const reviews = await Review.getByProductId(productId);
    
    return res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching reviews'
    });
  }
};

// Get top rated products
exports.getTopRatedProducts = async (req, res) => {
  try {
    const topProducts = await Review.getTopRated();
    
    return res.json({
      success: true,
      count: topProducts.length,
      data: topProducts.map(product => ({
        id: product.id,
        name: product.name,
        average_rating: parseFloat(product.average_rating).toFixed(1),
        review_count: parseInt(product.review_count),
        category: product.category
      }))
    });
  } catch (err) {
    console.error('Error fetching top rated products:', err);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching top rated products'
    });
  }
};
