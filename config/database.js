const { Pool } = require('pg');
require('dotenv').config();

/**
 * DbConnection class implementing the singleton pattern
 * for PostgreSQL database connections
 */
class DbConnection {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    this.poolInitialized = false;
    
    // Log pool events for debugging
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  /**
   * Get the singleton instance
   * @returns {DbConnection} The singleton instance
   */
  static getInstance() {
    if (!DbConnection.instance) {
      DbConnection.instance = new DbConnection();
    }
    return DbConnection.instance;
  }

  /**
   * Initialize the connection pool
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.poolInitialized) {
      console.log('Pool already initialized');
      return;
    }

    try {
      // Test the connection
      const client = await this.pool.connect();
      client.release();
      
      console.log('Connection pool created successfully');
      this.poolInitialized = true;
    } catch (err) {
      console.error('Error creating connection pool', err);
      throw err;
    }
  }

  /**
   * Get a connection from the pool
   * @returns {Promise<PoolClient>} PostgreSQL client
   */
  async getConnection() {
    if (!this.poolInitialized) {
      await this.initialize();
    }
    return await this.pool.connect();
  }

  /**
   * Execute a query and return the result
   * @param {string} text - SQL query text
   * @param {Array} params - Query parameters
   * @returns {Promise<QueryResult>} Query result
   */
  async query(text, params) {
    if (!this.poolInitialized) {
      await this.initialize();
    }
    try {
      return await this.pool.query(text, params);
    } catch (err) {
      console.error(`Query error: ${text.substring(0, 100)}...`);
      throw err;
    }
  }

  /**
   * Execute a transaction with multiple queries
   * @param {Function} callback - Function that receives a client and executes queries
   * @returns {Promise<any>} Result of the transaction
   */
  async transaction(callback) {
    const client = await this.getConnection();
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

  /**
   * Close the connection pool
   * @returns {Promise<void>}
   */
  async closePool() {
    if (!this.poolInitialized) {
      console.log('Pool not initialized, nothing to close');
      return;
    }
    
    try {
      await this.pool.end();
      console.log('Pool closed');
      this.poolInitialized = false;
    } catch (err) {
      console.error('Error closing pool', err);
      throw err;
    }
  }
}

// Export the singleton instance methods
module.exports = {
  initialize: async () => await DbConnection.getInstance().initialize(),
  getConnection: async () => await DbConnection.getInstance().getConnection(),
  query: async (text, params) => await DbConnection.getInstance().query(text, params),
  transaction: async (callback) => await DbConnection.getInstance().transaction(callback),
  closePool: async () => await DbConnection.getInstance().closePool()
}; 