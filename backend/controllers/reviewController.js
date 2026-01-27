const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @route   POST /api/reviews
// @desc    Create a review for a purchased product
// @access  Private (Buyer)
exports.createReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;

        // Validation
        if (!productId || !rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if user purchased this product
        const order = await Order.findOne({
            buyer: req.user._id,
            product: productId,
            status: 'completed'
        });

        if (!order) {
            return res.status(403).json({
                success: false,
                message: 'You can only review products you have purchased'
            });
        }

        // Check if review already exists
        const existingReview = await Review.findOne({
            product: productId,
            buyer: req.user._id
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product'
            });
        }

        // Create review
        const review = await Review.create({
            product: productId,
            buyer: req.user._id,
            rating,
            comment
        });

        // Update product rating
        await updateProductRating(productId);

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            review
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating review'
        });
    }
};

// @route   GET /api/reviews/:productId
// @desc    Get all reviews for a product
// @access  Public
exports.getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .populate('buyer', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: reviews.length,
            reviews
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching reviews'
        });
    }
};

// Helper function to update product rating
const updateProductRating = async (productId) => {
    try {
        const reviews = await Review.find({ product: productId });

        if (reviews.length === 0) {
            await Product.findByIdAndUpdate(productId, {
                averageRating: 0,
                totalReviews: 0
            });
            return;
        }

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;

        await Product.findByIdAndUpdate(productId, {
            averageRating: averageRating.toFixed(1),
            totalReviews: reviews.length
        });
    } catch (error) {
        console.error('Update rating error:', error);
    }
};
