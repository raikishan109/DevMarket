const Payment = require('../models/Payment');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

exports.getPendingPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ status: 'pending' })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            payments
        });
    } catch (error) {
        console.error('Get pending payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching payments'
        });
    }
};

exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('user', 'name email')
            .populate('processedBy', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            payments
        });
    } catch (error) {
        console.error('Get all payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching payments'
        });
    }
};

exports.approvePayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { adminNote } = req.body;

        const payment = await Payment.findById(paymentId);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        if (payment.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Payment already processed'
            });
        }

        payment.status = 'approved';
        payment.adminNote = adminNote || '';
        payment.processedBy = req.user._id;
        payment.processedAt = new Date();
        await payment.save();

        await Transaction.create({
            user: payment.user,
            type: 'credit',
            amount: payment.amount,
            category: 'sale',
            description: `${payment.paymentType === 'crypto' ? 'Crypto' : 'UPI'} payment approved`,
            status: 'completed'
        });

        await User.findByIdAndUpdate(payment.user, {
            $inc: { walletBalance: payment.amount }
        });

        res.json({
            success: true,
            message: 'Payment approved successfully',
            payment
        });
    } catch (error) {
        console.error('Approve payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while approving payment'
        });
    }
};

exports.rejectPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { adminNote } = req.body;

        const payment = await Payment.findById(paymentId);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        if (payment.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Payment already processed'
            });
        }

        payment.status = 'failed';
        payment.adminNote = adminNote || '';
        payment.processedBy = req.user._id;
        payment.processedAt = new Date();
        await payment.save();

        res.json({
            success: true,
            message: 'Payment rejected',
            payment
        });
    } catch (error) {
        console.error('Reject payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while rejecting payment'
        });
    }
};
