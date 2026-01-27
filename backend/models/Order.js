const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    developer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    platformCommission: {
        type: Number,
        required: true
    },
    developerEarnings: {
        type: Number,
        required: true
    },
    paymentId: {
        type: String,
        required: true
    },
    razorpayOrderId: {
        type: String,
        required: true
    },
    razorpaySignature: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'refunded'],
        default: 'completed'
    },
    refundReason: {
        type: String,
        default: ''
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for faster queries
orderSchema.index({ buyer: 1 });
orderSchema.index({ developer: 1 });
orderSchema.index({ product: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
