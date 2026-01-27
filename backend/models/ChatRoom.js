const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
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
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    adminRequested: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['open', 'resolved'],
        default: 'open'
    },
    isPurchased: {
        type: Boolean,
        default: false
    },
    dealStatus: {
        type: String,
        enum: ['pending', 'seller_marked', 'completed'],
        default: 'pending'
    },
    sellerMarkedDone: {
        type: Boolean,
        default: false
    },
    lastMessage: {
        type: String,
        default: ''
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
chatRoomSchema.index({ product: 1, buyer: 1, seller: 1 });
chatRoomSchema.index({ buyer: 1 });
chatRoomSchema.index({ seller: 1 });
chatRoomSchema.index({ admin: 1 });
chatRoomSchema.index({ status: 1 });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
