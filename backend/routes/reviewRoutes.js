const express = require('express');
const router = express.Router();
const { createReview, getProductReviews } = require('../controllers/reviewController');
const { authMiddleware } = require('../middleware/auth');

// Public route
router.get('/:productId', getProductReviews);

// Private route (Buyer)
router.post('/', authMiddleware, createReview);

module.exports = router;
