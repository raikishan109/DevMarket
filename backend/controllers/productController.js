const Product = require('../models/Product');
const User = require('../models/User');
const Review = require('../models/Review');

// @route   POST /api/products
// @desc    Create a new product (Developer only)
// @access  Private
exports.createProduct = async (req, res) => {
    try {
        const {
            name,
            category,
            problemSolved,
            solution,
            targetAudience,
            features,
            price,
            demoLink,
            accessLink,
            screenshots
        } = req.body;

        // Validation
        if (!name || !category || !problemSolved || !solution || !targetAudience || !price || !accessLink) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Get platform commission from settings
        const Settings = require('../models/Settings');
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ platformCommission: 10 });
        }

        const basePrice = Number(price);
        const platformFeePercentage = settings.platformCommission / 100;
        const platformFee = Math.round(basePrice * platformFeePercentage * 100) / 100;
        const finalPrice = Math.round((basePrice + platformFee) * 100) / 100;

        const product = await Product.create({
            name,
            category,
            problemSolved,
            solution,
            targetAudience,
            features: features || [],
            basePrice: basePrice,
            price: finalPrice,
            demoLink: demoLink || '',
            accessLink,
            screenshots: screenshots || [],
            developer: req.user._id,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Product created successfully and pending approval',
            product
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating product'
        });
    }
};

// @route   GET /api/products
// @desc    Get all approved products
// @access  Public
exports.getAllProducts = async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice, sort } = req.query;

        // Build query
        let query = { status: 'approved' };

        if (category && category !== 'all') {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { problemSolved: { $regex: search, $options: 'i' } }
            ];
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Sort options
        let sortOption = {};
        if (sort === 'price-low') {
            sortOption.price = 1;
        } else if (sort === 'price-high') {
            sortOption.price = -1;
        } else if (sort === 'rating') {
            sortOption.averageRating = -1;
        } else {
            sortOption.createdAt = -1; // newest first
        }

        const products = await Product.find(query)
            .populate('developer', 'name email')
            .sort(sortOption);

        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching products'
        });
    }
};

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('developer', 'name email bio website');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Get reviews for this product
        const reviews = await Review.find({ product: product._id })
            .populate('buyer', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            product,
            reviews
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching product'
        });
    }
};

// @route   GET /api/products/developer/my-products
// @desc    Get developer's own products
// @access  Private (Developer)
exports.getDeveloperProducts = async (req, res) => {
    try {
        const products = await Product.find({ developer: req.user._id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.error('Get developer products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching products'
        });
    }
};

// @route   PUT /api/products/:id
// @desc    Update product (Developer only - own products)
// @access  Private
exports.updateProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if user owns this product
        if (product.developer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this product'
            });
        }

        // Update product
        product = await Product.findByIdAndUpdate(
            req.params.id,
            { ...req.body, status: 'pending' }, // Reset to pending after edit
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Product updated and pending re-approval',
            product
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating product'
        });
    }
};

// @route   DELETE /api/products/:id
// @desc    Delete product (Developer only - own products)
// @access  Private
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if user owns this product
        if (product.developer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this product'
            });
        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting product'
        });
    }
};
