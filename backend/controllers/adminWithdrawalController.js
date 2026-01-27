const Withdrawal = require('../models/Withdrawal');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

exports.getPendingWithdrawals = async (req, res) => {
    try {
        const withdrawals = await Withdrawal.find({ status: 'pending' })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            withdrawals
        });
    } catch (error) {
        console.error('Get pending withdrawals error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching withdrawals'
        });
    }
};

exports.getAllWithdrawals = async (req, res) => {
    try {
        const withdrawals = await Withdrawal.find()
            .populate('user', 'name email')
            .populate('processedBy', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            withdrawals
        });
    } catch (error) {
        console.error('Get all withdrawals error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching withdrawals'
        });
    }
};

exports.approveWithdrawal = async (req, res) => {
    try {
        const { withdrawalId } = req.params;
        const { adminNote } = req.body;

        const withdrawal = await Withdrawal.findById(withdrawalId);

        if (!withdrawal) {
            return res.status(404).json({
                success: false,
                message: 'Withdrawal not found'
            });
        }

        if (withdrawal.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Withdrawal already processed'
            });
        }

        const user = await User.findById(withdrawal.user);

        if (user.walletBalance < withdrawal.amount) {
            return res.status(400).json({
                success: false,
                message: 'User has insufficient balance'
            });
        }

        withdrawal.status = 'completed';
        withdrawal.adminNote = adminNote || '';
        withdrawal.processedBy = req.user._id;
        withdrawal.processedAt = new Date();
        await withdrawal.save();

        await Transaction.create({
            user: withdrawal.user,
            type: 'debit',
            amount: withdrawal.amount,
            category: 'withdrawal',
            description: `${withdrawal.withdrawalType === 'crypto' ? 'Crypto' : 'UPI'} withdrawal approved`,
            status: 'completed'
        });

        await User.findByIdAndUpdate(withdrawal.user, {
            $inc: { walletBalance: -withdrawal.amount }
        });

        res.json({
            success: true,
            message: 'Withdrawal approved successfully',
            withdrawal
        });
    } catch (error) {
        console.error('Approve withdrawal error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while approving withdrawal'
        });
    }
};

exports.rejectWithdrawal = async (req, res) => {
    try {
        const { withdrawalId } = req.params;
        const { adminNote } = req.body;

        const withdrawal = await Withdrawal.findById(withdrawalId);

        if (!withdrawal) {
            return res.status(404).json({
                success: false,
                message: 'Withdrawal not found'
            });
        }

        if (withdrawal.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Withdrawal already processed'
            });
        }

        withdrawal.status = 'failed';
        withdrawal.adminNote = adminNote || '';
        withdrawal.processedBy = req.user._id;
        withdrawal.processedAt = new Date();
        await withdrawal.save();

        res.json({
            success: true,
            message: 'Withdrawal rejected',
            withdrawal
        });
    } catch (error) {
        console.error('Reject withdrawal error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while rejecting withdrawal'
        });
    }
};
