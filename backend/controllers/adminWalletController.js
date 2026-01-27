const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const Sale = require('../models/Sale');

// @route   GET /api/admin/platform-wallet
// @desc    Get platform wallet balance and stats
// @access  Private (Admin)
exports.getPlatformWallet = async (req, res) => {
    try {
        // Get main admin (platform owner)
        const mainAdmin = await User.findOne({ role: 'admin', isSubAdmin: { $ne: true } });

        if (!mainAdmin) {
            return res.status(404).json({
                success: false,
                message: 'Main admin not found'
            });
        }

        // Get all platform transactions
        const allTransactions = await Transaction.find({ user: mainAdmin._id })
            .sort({ createdAt: -1 });

        // Calculate earnings from commissions
        const [orders, sales] = await Promise.all([
            Order.find({ status: 'completed' }),
            Sale.find()
        ]);

        const commissionEarnings = orders.reduce((sum, order) => sum + (order.platformCommission || 0), 0) +
            sales.reduce((sum, sale) => sum + (sale.platformCommission || 0), 0);

        // Calculate total credits and debits
        const totalCredits = allTransactions
            .filter(t => t.type === 'credit')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalDebits = allTransactions
            .filter(t => t.type === 'debit')
            .reduce((sum, t) => sum + t.amount, 0);

        res.json({
            success: true,
            wallet: {
                balance: mainAdmin.walletBalance || 0,
                totalEarnings: totalCredits,
                totalWithdrawals: totalDebits,
                commissionEarnings,
                otherIncome: totalCredits - commissionEarnings
            }
        });
    } catch (error) {
        console.error('Error fetching platform wallet:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching platform wallet'
        });
    }
};

// @route   GET /api/admin/platform-wallet/transactions
// @desc    Get platform wallet transaction history
// @access  Private (Admin)
exports.getPlatformTransactions = async (req, res) => {
    try {
        // Get main admin (platform owner)
        const mainAdmin = await User.findOne({ role: 'admin', isSubAdmin: { $ne: true } });

        if (!mainAdmin) {
            return res.status(404).json({
                success: false,
                message: 'Main admin not found'
            });
        }

        // Get all transactions for the platform
        const transactions = await Transaction.find({ user: mainAdmin._id })
            .sort({ createdAt: -1 })
            .limit(100);

        res.json({
            success: true,
            count: transactions.length,
            transactions
        });
    } catch (error) {
        console.error('Error fetching platform transactions:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching transactions'
        });
    }
};
