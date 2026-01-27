const express = require('express');
const router = express.Router();
const { getWallet, getTransactions, addMoney, submitPayment, getMyPayments, submitWithdrawal, getMyWithdrawals } = require('../controllers/walletController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, getWallet);
router.get('/transactions', authMiddleware, getTransactions);
router.post('/add', authMiddleware, addMoney);
router.post('/payment', authMiddleware, submitPayment);
router.get('/payments', authMiddleware, getMyPayments);
router.post('/withdrawal', authMiddleware, submitWithdrawal);
router.get('/withdrawals', authMiddleware, getMyWithdrawals);

module.exports = router;
