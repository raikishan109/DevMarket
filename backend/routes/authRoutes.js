const express = require('express');
const router = express.Router();
const { register, login, adminLogin, getMe, updateProfile } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// @route   POST /api/auth/register
router.post('/register', register);

// @route   POST /api/auth/login
router.post('/login', login);

// @route   POST /api/auth/admin-login
router.post('/admin-login', adminLogin);

// @route   GET /api/auth/me
router.get('/me', authMiddleware, getMe);

// @route   PUT /api/auth/profile
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;
