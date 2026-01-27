const express = require('express');
const router = express.Router();
const {
    buyNow,
    createOrder,
    verifyPayment,
    getMyPurchases,
    getMySales,
    getRazorpayKey
} = require('../controllers/orderController');
const { authMiddleware, buyerMiddleware, developerMiddleware } = require('../middleware/auth');

// Public route
router.get('/razorpay-key', getRazorpayKey);

// Buy Now route (wallet-based purchase)
router.post('/buy-now', authMiddleware, buyNow);

// Buyer routes
router.post('/create-order', authMiddleware, createOrder);
router.post('/verify-payment', authMiddleware, verifyPayment);
router.get('/my-purchases', authMiddleware, getMyPurchases);

// Developer routes
router.get('/my-sales', authMiddleware, developerMiddleware, getMySales);

module.exports = router;
