# Product Management App

A full-stack web application for managing product inventory with user authentication, product CRUD operations, and filtering capabilities.

## Overview

This Product Management App provides businesses with a streamlined way to manage their product catalog. It features a secure user authentication system, comprehensive product management functionality, and intuitive filtering options to help users quickly find products based on specific criteria.

## Features

### Authentication
- Secure user registration and login
- JWT-based authentication
- Password encryption with bcryptjs

### Product Management
- Create new products with auto-generated product IDs
- View all products in a responsive grid layout
- Update existing product information
- Delete products
- Feature products to highlight specific items

### Filtering System
- Filter products by price range
- Filter products by minimum rating
- Combined filtering (price and rating)
- Quick access to featured products

## Tech Stack

### Frontend
- **React** (v18.3.1): UI component library
- **Vite** (v6.0.5): Fast, modern frontend build tool
- **Axios**: HTTP client for API requests
- **Tailwind CSS** (v4.0.0): Utility-first CSS framework
- **ESLint**: Code linting and formatting

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: Authentication token generation and verification
- **bcryptjs**: Password hashing
- **dotenv**: Environment variable management
- **CORS**: Cross-Origin Resource Sharing configuration

## Project Structure

```
product-management-app/
│
├── frontend/                # React frontend application
│   ├── src/                 # Source files
│   │   ├── App.jsx          # Main application component
│   │   ├── main.jsx         # Application entry point
│   │   └── index.css        # Global styles
│   ├── public/              # Static assets
│   ├── .env                 # Frontend environment variables
│   ├── vite.config.js       # Vite configuration
│   ├── eslint.config.js     # ESLint configuration
│   └── package.json         # Frontend dependencies
│
└── backend/                 # Node.js backend
    ├── server.js            # Express server and API routes
    ├── index.js             # Server entry point
    ├── .env                 # Backend environment variables
    └── package.json         # Backend dependencies
```

## Setup & Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB account or local MongoDB installation
- Git

### Backend Setup
1. Clone the repository:
   ```
   git clone [repository-url]
   cd product-management-app/backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   TOKEN_SECRET=your_jwt_secret
   NODE_ENV=development
   PORT=5000
   ```

4. Start the backend server:
   ```
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd ../frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the backend URL:
   ```
   VITE_BACKEND_URL=http://localhost:5000
   ```
   
   Note: For production, set this to your deployed backend URL.

4. Start the frontend development server:
   ```
   npm run dev
   ```

## Usage Guide

### User Authentication
1. Register a new account with your email and password
2. Log in with your credentials
3. The system will automatically generate and store a JWT token for session management

### Product Management
1. **Adding Products:** Fill in the product form with name, price, company, rating, and optional featured status
2. **Viewing Products:** All products are displayed in a responsive grid layout
3. **Updating Products:** Click the Edit button on a product card to modify its details
4. **Deleting Products:** Click the Delete button on a product card to remove it from the database

### Filtering Products
1. **Price Filter:** Use the slider to set a maximum price threshold
2. **Rating Filter:** Use the slider to set a minimum rating threshold
3. **Apply Filters:** Click the "Apply Filters" button to see products that match both criteria
4. **Featured Products:** Click the "Featured Products" button to view only featured items
5. **All Products:** Reset filters and view all products by clicking "All Products"

## API Endpoints

### Authentication
- **POST /signup**: Register a new user
- **POST /login**: Authenticate user and receive JWT token

### Products
- **GET /products**: Retrieve all products (requires authentication)
- **POST /products**: Add a new product (requires authentication)
- **PUT /products/:id**: Update a specific product (requires authentication)
- **DELETE /products/:id**: Delete a specific product (requires authentication)

### Product Filtering
- **GET /products/featured**: Get featured products (requires authentication)
- **GET /products/price/:maxPrice**: Get products below a price threshold (requires authentication)
- **GET /products/rating/:minRating**: Get products above a rating threshold (requires authentication)

## Security

- User passwords are hashed using bcryptjs before storage
- JWT tokens are used for authentication and API access
- CORS is configured to restrict access to specified origins
- Environment variables are used for storing sensitive information
- Input validation on both client and server sides

## Deployment

### Backend
The backend is deployed on Railway at:
https://product-management-app-production-9ac2.up.railway.app

### Frontend
The frontend is deployed on Vercel at:
https://product-management-app-dun.vercel.app

## License

ISC License
