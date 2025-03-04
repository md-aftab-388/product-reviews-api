const db = require('../config/database');

class Review {
  static async create(reviewData) {
    try {
      const result = await db.query(
        `INSERT INTO reviews (product_id, rating, comment) 
         VALUES ($1, $2, $3) 
         RETURNING id, product_id, rating, comment, created_at`,
        [
          reviewData.productId,
          reviewData.rating,
          reviewData.comment
        ]
      );
      
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  static async getAll() {
    try {
      const result = await db.query(
        `SELECT r.id, r.product_id, p.name as product_name, r.rating, r.comment, r.created_at
         FROM reviews r
         JOIN products p ON r.product_id = p.id
         ORDER BY r.created_at DESC`
      );
      
      return result.rows;
    } catch (err) {
      throw err;
    }
  }

  static async getByProductId(productId) {
    try {
      const result = await db.query(
        `SELECT r.id, r.product_id, p.name as product_name, r.rating, r.comment, r.created_at
         FROM reviews r
         JOIN products p ON r.product_id = p.id
         WHERE r.product_id = $1
         ORDER BY r.created_at DESC`,
        [productId]
      );
      
      return result.rows;
    } catch (err) {
      throw err;
    }
  }

  static async getTopRated(limit = 3) {
    try {
      const result = await db.query(
        `SELECT p.id, p.name, p.description, p.price, p.category, 
                AVG(r.rating) as average_rating, COUNT(r.id) as review_count
         FROM products p
         JOIN reviews r ON p.id = r.product_id
         GROUP BY p.id, p.name, p.description, p.price, p.category
         ORDER BY average_rating DESC
         LIMIT $1`,
        [limit]
      );
      
      return result.rows;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Review; 