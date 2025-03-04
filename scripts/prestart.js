const { Pool } = require('pg');
require('dotenv').config();

const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
};

const MAX_ATTEMPTS = 5;
const RETRY_DELAY = 5000;

async function checkDatabaseConnection(attempt = 1) {
  console.log(`Attempt ${attempt}/${MAX_ATTEMPTS} to connect to PostgreSQL database...`);
  
  const pool = new Pool(dbConfig);
  
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL database');
    
    client.release();
    await pool.end();
    console.log('Connection closed');
    return true;
  } catch (err) {
    console.error(`Failed to connect to database: ${err.message}`);
    
    try {
      await pool.end();
    } catch (poolErr) {
      console.error('Error ending pool:', poolErr);
    }
    
    if (attempt < MAX_ATTEMPTS) {
      console.log(`Retrying in ${RETRY_DELAY/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return await checkDatabaseConnection(attempt + 1);
    } else {
      console.error('Maximum connection attempts reached. Exiting...');
      process.exit(1);
    }
  }
}

async function run() {
  try {
    const connected = await checkDatabaseConnection();
    if (connected) {
      console.log('Database prestart check completed successfully');
    }
  } catch (error) {
    console.error('Unhandled error in prestart script:', error);
    process.exit(1);
  }
}

run(); 