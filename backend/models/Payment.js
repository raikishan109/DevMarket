const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentType: {
        type: String,
        enum: ['crypto', 'upi'],
        required: true
    },
    // Crypto fields
    cryptoCoin: {
        type: String,
        enum: ['USDT', 'USDC', null]
    },
    cryptoNetwork: {
        type: String,
        enum: ['BEP20', 'Polygon', null]
    },
    transactionHash: {
        type: String
    },
    // UPI fields
    upiId: {
        type: String
    },
    utrNumber: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'failed'],
        default: 'pending'
    },
    adminNote: {
        type: String
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    processedAt: {
        type: Date
    }
}, {
    timestamps: true
});

paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
