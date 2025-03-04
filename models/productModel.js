const db = require('../config/database');

class Product {
  static async create(productData) {
    try {
      const result = await db.query(
        `INSERT INTO products (name, description, price, category) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, name, description, price, category, created_at`,
        [
          productData.name,
          productData.description,
          productData.price,
          productData.category
        ]
      );
      
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  static async getById(id) {
    try {
      const result = await db.query(
        `SELECT id, name, description, price, category, created_at
         FROM products 
         WHERE id = $1`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

}

module.exports = Product; 