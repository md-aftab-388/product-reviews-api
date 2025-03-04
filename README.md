# Product Reviews API

A RESTful API for managing product reviews, connecting to a PostgreSQL database (Neon).

## Features

- Submit new product reviews
- Retrieve all reviews
- Retrieve reviews for a specific product
- Get top 3 most positively reviewed products
- Product management

## Technologies Used

- Node.js
- Express.js
- PostgreSQL (Neon serverless PostgreSQL)
- node-postgres package
- Zod for validation

## Prerequisites

- Node.js (v14 or higher)
- Access to a PostgreSQL database (Neon account)

## Installation

1. Clone the repository:

   ```
   https://github.com/md-aftab-388/product-reviews-api.git
   cd product-reviews-api
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require
   PORT=3000
   NODE_ENV=development
   ```

## Running the Application

### Database Setup

Run the migration script to set up the database tables and add sample products:

```
npm run migrate
```

### Starting the API

Start the server:

```
npm start
```

For development with auto-restart:

```
npm run dev
```

## API Endpoints

### Reviews

- `POST /reviews` - Submit a new product review
- `GET /reviews` - Retrieve all reviews
- `GET /reviews/:productId` - Retrieve all reviews for a specific product
- `GET /reviews/top-rated` - Get top 3 most positively reviewed products

## Environment Variables

Create a `.env` file in the root directory with the necessary configuration:

```
# Database Connection String (using Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:your_password@ep-hostname.aws.neon.tech/neondb?sslmode=require

# Application Configuration
PORT=3000
NODE_ENV=development
```

## API Testing

A Postman collection (`product_reviews_api.postman_collection.json`) is included in the repository for testing the API endpoints. Import this collection into Postman to get started.

To use the collection:

1. Open Postman
2. Click "Import" and select the JSON file
3. Set the "baseUrl" variable to your server address (default: http://localhost:3000)
4. Start testing the API endpoints

## Security Considerations

- The API uses environment variables for secure credential management
- PostgreSQL connections use SSL for secure data transmission
- Input validation is performed using Zod schema validation
