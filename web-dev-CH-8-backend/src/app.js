const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/rating', ratingRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user', userRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('CH-8 Backend API is running...');
});

module.exports = app;
