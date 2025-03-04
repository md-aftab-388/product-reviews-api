const z = require('zod');

// Create a Zod schema for review validation
const reviewSchema = z.object({
  productId: z.string({
    required_error: 'Product ID is required',
  }).min(1, { message: 'Product ID cannot be empty' }),
  
  rating: z.number({
    required_error: 'Rating is required',
    invalid_type_error: 'Rating must be a number',
  }).int({ message: 'Rating must be an integer' })
    .min(1, { message: 'Rating must be at least 1' })
    .max(5, { message: 'Rating must be at most 5' }),
  
  comment: z.string().max(1000, { 
    message: 'Comment must be less than 1000 characters' 
  }).optional().nullable(),
});

/**
 * Validates review data using Zod schema
 * @param {Object} reviewData - The review data to validate
 * @returns {Object} The validation result with isValid and errors properties
 */
function validateReview(reviewData) {
  try {
    // Parse will throw an error if validation fails
    reviewSchema.parse(reviewData);
    return {
      isValid: true,
      errors: []
    };
  } catch (error) {
    // Extract and format validation errors from Zod
    const errors = error.errors ? 
      error.errors.map(err => `${err.path.join('.')}: ${err.message}`) : 
      ['Invalid review data'];
    
    return {
      isValid: false,
      errors
    };
  }
}

module.exports = {
  validateReview
}; 