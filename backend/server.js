const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS Configuration
const allowedOrigins = [
  'https://product-management-app-dun.vercel.app',
  'http://localhost:5173'
];

app.use(express.json());

// Enhanced MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to Database'))
.catch((error) => {
  console.error('Database Connection Error:', error);
  process.exit(1);
});

// Product Schema
const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  company: {
    type: String,
    required: true
  }
});

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

const Product = mongoose.model('Product', productSchema);
const User = mongoose.model('User', userSchema);

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get('/', (req, res) => {
    res.send('Welcome to the Backend Server for product-management-app');
});

// Signup Route
app.post('/signup', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      email: req.body.email,
      password: hashedPassword
    });
    await user.save();
    res.status(201).send('User registered successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user == null) {
    return res.status(400).send('Cannot find user');
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      const accessToken = jwt.sign(
        { email: user.email }, 
        process.env.TOKEN_SECRET
      );
      res.json({ accessToken: accessToken });
    } else {
      res.send('Not Allowed');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Add Product Route
app.post('/products', authenticateToken, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).send(product);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Get All Products Route
app.get('/products', authenticateToken, async (req, res) => {
  try {
    const products = await Product.find();
    res.send(products);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Update Product Route
app.put('/products/:id', authenticateToken, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    res.send(product);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Delete Product Route
app.delete('/products/:id', authenticateToken, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.send('Product deleted');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Featured Products Route
app.get('/products/featured', authenticateToken, async (req, res) => {
  try {
    const featuredProducts = await Product.find({ featured: true });
    res.send(featuredProducts);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Products by Price Route
app.get('/products/price/:maxPrice', authenticateToken, async (req, res) => {
  try {
    const products = await Product.find({ 
      price: { $lt: req.params.maxPrice } 
    });
    res.send(products);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Products by Rating Route
app.get('/products/rating/:minRating', authenticateToken, async (req, res) => {
  try {
    const products = await Product.find({ 
      rating: { $gt: req.params.minRating } 
    });
    res.send(products);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});