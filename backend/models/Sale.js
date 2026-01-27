const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    chatRoom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatRoom',
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    platformCommission: {
        type: Number,
        default: 0
    },
    sellerEarnings: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['completed'],
        default: 'completed'
    }
}, {
    timestamps: true
});

// Indexes
saleSchema.index({ product: 1 });
saleSchema.index({ buyer: 1 });
saleSchema.index({ seller: 1 });
saleSchema.index({ chatRoom: 1 });

module.exports = mongoose.model('Sale', saleSchema);
