const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['AI Tools', 'Automation', 'Websites', 'Mobile Apps', 'Other']
    },
    problemSolved: {
        type: String,
        required: [true, 'Problem solved is required'],
        trim: true
    },
    solution: {
        type: String,
        required: [true, 'Solution description is required']
    },
    targetAudience: {
        type: String,
        required: true
    },
    features: [{
        type: String
    }],
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0
    },
    basePrice: {
        type: Number,
        required: false,
        min: 0
    },
    demoLink: {
        type: String,
        default: ''
    },
    accessLink: {
        type: String,
        required: [true, 'Access link is required']
    },
    screenshots: [{
        type: String
    }],
    developer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'removed'],
        default: 'pending'
    },
    rejectionReason: {
        type: String,
        default: ''
    },
    sales: {
        type: Number,
        default: 0
    },
    earnings: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes for faster queries
productSchema.index({ status: 1 });
productSchema.index({ category: 1 });
productSchema.index({ developer: 1 });
productSchema.index({ averageRating: -1 });

module.exports = mongoose.model('Product', productSchema);
