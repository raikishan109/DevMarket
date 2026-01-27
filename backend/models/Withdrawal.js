const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    withdrawalType: {
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
    walletAddress: {
        type: String
    },
    // UPI fields
    upiId: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
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

withdrawalSchema.index({ user: 1 });
withdrawalSchema.index({ status: 1 });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
