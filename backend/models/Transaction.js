const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        enum: ['sale', 'purchase', 'commission', 'withdrawal'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    relatedModel: {
        type: String,
        enum: ['Sale', 'Order']
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
    },
    balanceAfter: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

transactionSchema.index({ user: 1 });
transactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
