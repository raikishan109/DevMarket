const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: [true, 'Review comment is required'],
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Ensure one review per buyer per product
reviewSchema.index({ product: 1, buyer: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
