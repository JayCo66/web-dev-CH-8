const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Admin only: list all users & update role
router.get('/', authenticateToken, requireAdmin, userController.getUsers);
router.put('/:id/role', authenticateToken, requireAdmin, userController.updateUserRole);

module.exports = router;
