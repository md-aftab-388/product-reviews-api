const db = require("../config/database");
const Product = require("../models/productModel");

// Helper function for transactions
async function executeTransaction(callback) {
  const client = await db.getConnection();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Array of sample products to seed the database
const sampleProducts = [
  {
    name: "Smartphone XS",
    description: "Latest smartphone with advanced camera and long battery life",
    price: 799.99,
    category: "electronics",
  },
  {
    name: "Laptop Pro",
    description:
      "Powerful laptop for professionals with 16GB RAM and 512GB SSD",
    price: 1299.99,
    category: "electronics",
  },
  {
    name: "Wireless Headphones",
    description: "Noise-cancelling headphones with 20-hour battery life",
    price: 199.99,
    category: "electronics",
  },
  {
    name: "Running Shoes",
    description: "Lightweight running shoes with cushioned sole",
    price: 89.99,
    category: "sports",
  },
  {
    name: "Yoga Mat",
    description: "Non-slip yoga mat for home workouts",
    price: 29.99,
    category: "sports",
  },
  {
    name: "Coffee Maker",
    description: "Programmable coffee maker with thermal carafe",
    price: 79.99,
    category: "home",
  },
  {
    name: "Blender",
    description: "High-speed blender for smoothies and food processing",
    price: 69.99,
    category: "home",
  },
  {
    name: "Novel - The Mystery",
    description: "Bestselling mystery novel by renowned author",
    price: 14.99,
    category: "books",
  },
  {
    name: "Cookbook",
    description: "Collection of gourmet recipes for home cooking",
    price: 24.99,
    category: "books",
  },
  {
    name: "Smart Watch",
    description: "Fitness tracker and smartwatch with heart rate monitor",
    price: 149.99,
    category: "electronics",
  },
];

// Sample reviews for products
const sampleReviews = [
  {
    productName: "Smartphone XS",
    rating: 5,
    comment: "Amazing camera quality! Battery lasts all day.",
  },
  {
    productName: "Smartphone XS",
    rating: 4,
    comment: "Great phone, but a bit expensive.",
  },
  {
    productName: "Laptop Pro",
    rating: 5,
    comment: "Perfect for work and gaming. Very fast!",
  },
  {
    productName: "Wireless Headphones",
    rating: 3,
    comment: "Good sound but not comfortable for long periods.",
  },
  {
    productName: "Running Shoes",
    rating: 5,
    comment: "Very comfortable for long runs!",
  },
  {
    productName: "Coffee Maker",
    rating: 4,
    comment: "Makes great coffee and keeps it hot for hours.",
  },
];

/**
 * Create database tables if they don't exist
 */
async function createTables() {
  return executeTransaction(async (client) => {
    // Create products table
    console.log("Creating products table if it doesn't exist...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Products table created successfully");

    // Create reviews table
    console.log("Creating reviews table if it doesn't exist...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL,
        rating DECIMAL(2,1) NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);
    console.log("Reviews table created successfully");
    
    return true;
  });
}

/**
 * Find a product by name
 */
async function findProductByName(productName) {
  try {
    const result = await db.query(
      `SELECT id FROM products WHERE LOWER(name) = LOWER($1)`,
      [productName]
    );
    
    if (result.rows.length === 0) {
      console.warn(`Product not found: ${productName}`);
      return null;
    }
    
    return result.rows[0].id;
  } catch (err) {
    console.error(`Error finding product '${productName}':`, err);
    return null;
  }
}

/**
 * Insert sample reviews
 */
async function insertSampleReviews() {
  return executeTransaction(async (client) => {
    // First check if there are existing reviews to avoid duplicates
    const reviewCount = await client.query(`SELECT COUNT(*) FROM reviews`);
    
    if (parseInt(reviewCount.rows[0].count) > 0) {
      console.log(`Found ${reviewCount.rows[0].count} existing reviews, skipping insertion.`);
      return true;
    }
    
    console.log('Adding sample reviews...');
    for (const review of sampleReviews) {
      try {
        // Look up the product ID based on the product name
        const productId = await findProductByName(review.productName);
        
        if (!productId) {
          console.warn(`Skipping review for '${review.productName}' - product not found`);
          continue;
        }
        
        await client.query(
          `INSERT INTO reviews (product_id, rating, comment) 
           VALUES ($1, $2, $3)`,
          [productId, review.rating, review.comment]
        );
        
        console.log(`Added review for product '${review.productName}' (ID: ${productId})`);
      } catch (err) {
        console.error(`Error adding review for product '${review.productName}':`, err);
      }
    }
    
    return true;
  });
}

/**
 * Run the migration to set up the database schema and seed data
 */
async function runMigration() {
  try {
    console.log("Starting database migration...");
    
    // Initialize database connection pool
    await db.initialize();
    console.log("Database connected");
    
    // Create tables
    await createTables();
    
    // Insert products
    console.log("Adding sample products...");
    for (const product of sampleProducts) {
      try {
        await Product.create(product);
        console.log(`Added product: ${product.name}`);
      } catch (err) {
        if (err.code === '23505') { // PostgreSQL unique violation
          console.warn(`Product '${product.name}' already exists, skipping.`);
        } else {
          console.error(`Error adding product ${product.name}:`, err);
        }
      }
    }
    
    // Insert reviews
    await insertSampleReviews();
    
    console.log("Migration completed successfully");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    try {
      await db.closePool();
    } catch (err) {
      console.error("Error closing database pool:", err);
    }
    process.exit(0);
  }
}

// Run the migration
runMigration();
