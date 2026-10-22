const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public routes
router.get('/', menuController.getMenus);
router.get('/:id', menuController.getMenuById);

// Admin only routes
router.post('/', authenticateToken, requireAdmin, menuController.createMenu);
router.delete('/:id', authenticateToken, requireAdmin, menuController.deleteMenu);

module.exports = router;
