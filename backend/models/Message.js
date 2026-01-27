const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    chatRoom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatRoom',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderRole: {
        type: String,
        enum: ['buyer', 'seller', 'admin'],
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for faster queries
messageSchema.index({ chatRoom: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

module.exports = mongoose.model('Message', messageSchema);
