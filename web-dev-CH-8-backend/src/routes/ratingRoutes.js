const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { authenticateToken } = require('../middleware/auth');

// All rating routes require authentication
router.post('/:menuId', authenticateToken, ratingController.rateMenu);
router.get('/my', authenticateToken, ratingController.getUserRatings);

module.exports = router;
