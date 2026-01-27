const Transaction = require('../models/Transaction');
const User = require('../models/User');

exports.getWallet = async (req, res) => {
    try {
        const allTransactions = await Transaction.find({ user: req.user._id });

        let calculatedBalance = 0;
        for (const txn of allTransactions) {
            if (txn.type === 'credit') {
                calculatedBalance += txn.amount;
            } else {
                calculatedBalance -= txn.amount;
            }
        }

        await User.findByIdAndUpdate(req.user._id, {
            walletBalance: calculatedBalance
        });

        const transactions = await Transaction.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            success: true,
            balance: calculatedBalance,
            transactions
        });
    } catch (error) {
        console.error('Get wallet error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching wallet'
        });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const transactions = await Transaction.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Transaction.countDocuments({ user: req.user._id });

        res.json({
            success: true,
            transactions,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching transactions'
        });
    }
};

exports.addMoney = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
        }

        await Transaction.create({
            user: req.user._id,
            type: 'credit',
            amount: Number(amount),
            category: 'sale',
            description: 'Money added to wallet',
            status: 'completed'
        });

        await User.findByIdAndUpdate(req.user._id, {
            $inc: { walletBalance: Number(amount) }
        });

        res.json({
            success: true,
            message: 'Money added successfully'
        });
    } catch (error) {
        console.error('Add money error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding money'
        });
    }
};

exports.submitPayment = async (req, res) => {
    try {
        const { amount, paymentType, cryptoCoin, cryptoNetwork, transactionHash, upiId, utrNumber } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
        }

        if (!paymentType || !['crypto', 'upi'].includes(paymentType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment type'
            });
        }

        const Payment = require('../models/Payment');
        let paymentData = {
            user: req.user._id,
            amount: Number(amount),
            paymentType
        };

        if (paymentType === 'crypto') {
            if (!cryptoCoin || !cryptoNetwork || !transactionHash) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide all crypto payment details'
                });
            }
            paymentData.cryptoCoin = cryptoCoin;
            paymentData.cryptoNetwork = cryptoNetwork;
            paymentData.transactionHash = transactionHash;
        } else if (paymentType === 'upi') {
            if (!upiId || !utrNumber) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide UPI ID and UTR number'
                });
            }
            paymentData.upiId = upiId;
            paymentData.utrNumber = utrNumber;
        }

        const payment = await Payment.create(paymentData);

        res.json({
            success: true,
            message: 'Payment submitted successfully. Waiting for admin approval.',
            payment
        });
    } catch (error) {
        console.error('Submit payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while submitting payment'
        });
    }
};

exports.getMyPayments = async (req, res) => {
    try {
        const Payment = require('../models/Payment');

        const payments = await Payment.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            success: true,
            payments
        });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching payments'
        });
    }
};

exports.submitWithdrawal = async (req, res) => {
    try {
        const { amount, withdrawalType, cryptoCoin, cryptoNetwork, walletAddress, upiId } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
        }

        if (!withdrawalType || !['crypto', 'upi'].includes(withdrawalType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid withdrawal type'
            });
        }

        const user = await User.findById(req.user._id);

        if (user.walletBalance < amount) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance'
            });
        }

        const Withdrawal = require('../models/Withdrawal');

        const pendingWithdrawal = await Withdrawal.findOne({
            user: req.user._id,
            status: 'pending'
        });

        if (pendingWithdrawal) {
            return res.status(400).json({
                success: false,
                message: 'You already have a pending withdrawal request'
            });
        }

        let withdrawalData = {
            user: req.user._id,
            amount: Number(amount),
            withdrawalType
        };

        if (withdrawalType === 'crypto') {
            if (!cryptoCoin || !cryptoNetwork || !walletAddress) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide all crypto withdrawal details'
                });
            }
            if (walletAddress.length < 20) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid wallet address'
                });
            }
            withdrawalData.cryptoCoin = cryptoCoin;
            withdrawalData.cryptoNetwork = cryptoNetwork;
            withdrawalData.walletAddress = walletAddress;
        } else if (withdrawalType === 'upi') {
            if (!upiId) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide UPI ID'
                });
            }
            withdrawalData.upiId = upiId;
        }

        const withdrawal = await Withdrawal.create(withdrawalData);

        res.json({
            success: true,
            message: 'Withdrawal request submitted successfully. Waiting for admin approval.',
            withdrawal
        });
    } catch (error) {
        console.error('Submit withdrawal error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while submitting withdrawal'
        });
    }
};

exports.getMyWithdrawals = async (req, res) => {
    try {
        const Withdrawal = require('../models/Withdrawal');

        const withdrawals = await Withdrawal.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            success: true,
            withdrawals
        });
    } catch (error) {
        console.error('Get withdrawals error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching withdrawals'
        });
    }
};
