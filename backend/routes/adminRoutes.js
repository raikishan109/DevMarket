const express = require('express');
const router = express.Router();
const {
    getPendingProducts,
    getApprovedProducts,
    approveProduct,
    rejectProduct,
    removeProduct,
    deleteProductPermanently,
    getAllDevelopers,
    verifyDeveloper,
    unverifyDeveloper,
    getStats,
    getSettings,
    updateSettings,
    addCryptoAddress,
    removeCryptoAddress,
    addUpiId,
    removeUpiId,
    processRefund,
    createSubAdmin,
    getAllSubAdmins,
    deleteSubAdmin,
    getAllUsers,
    deleteUser,
    toggleBanUser,
    getCompletedSales
} = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// All routes require admin authentication
router.use(authMiddleware);
router.use(adminMiddleware);

// Product management
router.get('/products/pending', getPendingProducts);
router.get('/products/approved', getApprovedProducts);
router.put('/products/:id/approve', approveProduct);
router.put('/products/:id/reject', rejectProduct);
router.put('/products/:id/remove', removeProduct);
router.delete('/products/:id/permanent', deleteProductPermanently);

// Developer management
router.get('/developers', getAllDevelopers);
router.put('/developers/:id/verify', verifyDeveloper);
router.put('/developers/:id/unverify', unverifyDeveloper);

// Statistics
router.get('/stats', getStats);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Payment System Management
router.post('/settings/crypto-address', addCryptoAddress);
router.delete('/settings/crypto-address', removeCryptoAddress);
router.post('/settings/upi-id', addUpiId);
router.delete('/settings/upi-id', removeUpiId);

// Refunds
router.put('/orders/:id/refund', processRefund);

// Sub-admin management (only main admins can manage sub-admins)
const { mainAdminOnly } = require('../middleware/subAdminMiddleware');
router.post('/sub-admins', mainAdminOnly, createSubAdmin);
router.get('/sub-admins', mainAdminOnly, getAllSubAdmins);
router.delete('/sub-admins/:id', mainAdminOnly, deleteSubAdmin);

// User management
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/ban', toggleBanUser);

// Sales
router.get('/sales', getCompletedSales);

// Payment Management
const { getPendingPayments, getAllPayments, approvePayment, rejectPayment } = require('../controllers/adminPaymentController');
router.get('/payments/pending', getPendingPayments);
router.get('/payments', getAllPayments);
router.put('/payments/:paymentId/approve', approvePayment);
router.put('/payments/:paymentId/reject', rejectPayment);

// Withdrawal Management
const { getPendingWithdrawals, getAllWithdrawals, approveWithdrawal, rejectWithdrawal } = require('../controllers/adminWithdrawalController');
router.get('/withdrawals/pending', getPendingWithdrawals);
router.get('/withdrawals', getAllWithdrawals);
router.put('/withdrawals/:withdrawalId/approve', approveWithdrawal);
router.put('/withdrawals/:withdrawalId/reject', rejectWithdrawal);

// Platform Wallet Management
const { getPlatformWallet, getPlatformTransactions } = require('../controllers/adminWalletController');
router.get('/platform-wallet', getPlatformWallet);
router.get('/platform-wallet/transactions', getPlatformTransactions);

module.exports = router;
