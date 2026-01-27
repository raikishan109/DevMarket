const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Settings = require('../models/Settings');
const Transaction = require('../models/Transaction');

// Initialize Razorpay (optional - only if keys are provided)
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'rzp_test_your_key_id') {
    try {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        console.log('✅ Razorpay initialized');
    } catch (error) {
        console.log('⚠️  Razorpay not configured - payment features disabled');
    }
} else {
    console.log('⚠️  Razorpay keys not set - payment features disabled');
}

// @route   POST /api/orders/buy-now
// @desc    Direct purchase using wallet balance
// @access  Private
exports.buyNow = async (req, res) => {
    try {
        const { productId } = req.body;

        // Get product
        const product = await Product.findById(productId).populate('developer');
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if product is approved
        if (product.status !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Product is not available for purchase'
            });
        }

        // Check if user already purchased this product
        const existingOrder = await Order.findOne({
            buyer: req.user._id,
            product: productId,
            status: 'completed'
        });

        if (existingOrder) {
            return res.status(400).json({
                success: false,
                message: 'You have already purchased this product'
            });
        }

        // Check wallet balance
        const buyer = await User.findById(req.user._id);
        if (buyer.walletBalance < product.price) {
            return res.status(400).json({
                success: false,
                message: `Insufficient wallet balance. You need ₹${product.price} but have ₹${buyer.walletBalance}`
            });
        }

        // Get platform commission
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ platformCommission: 10 });
        }

        // Calculate amounts
        const totalAmount = product.price;
        const platformFeePercentage = settings.platformCommission / 100;

        // If product has basePrice, use it. Otherwise calculate from total price
        let sellerEarnings, platformCommission;
        if (product.basePrice) {
            sellerEarnings = product.basePrice;
            platformCommission = Math.round(product.basePrice * platformFeePercentage * 100) / 100;
        } else {
            // Calculate backwards from total price
            sellerEarnings = Math.round(totalAmount / (1 + platformFeePercentage) * 100) / 100;
            platformCommission = totalAmount - sellerEarnings;
        }

        // Start transaction - Deduct from buyer
        await User.findByIdAndUpdate(buyer._id, {
            $inc: { walletBalance: -totalAmount }
        });

        await Transaction.create({
            user: buyer._id,
            type: 'debit',
            amount: totalAmount,
            category: 'purchase',
            description: `Purchased ${product.name}`,
            relatedModel: 'Product',
            relatedId: product._id
        });

        // Credit seller (developer) with base price
        await User.findByIdAndUpdate(product.developer._id, {
            $inc: { walletBalance: sellerEarnings }
        });

        await Transaction.create({
            user: product.developer._id,
            type: 'credit',
            amount: sellerEarnings,
            category: 'sale',
            description: `Sale of ${product.name}`,
            relatedModel: 'Product',
            relatedId: product._id
        });

        // Credit platform commission to main admin
        const mainAdmin = await User.findOne({
            role: 'admin',
            isSubAdmin: { $ne: true }
        });

        if (mainAdmin && platformCommission > 0) {
            await User.findByIdAndUpdate(mainAdmin._id, {
                $inc: { walletBalance: platformCommission }
            });

            await Transaction.create({
                user: mainAdmin._id,
                type: 'credit',
                amount: platformCommission,
                category: 'commission',
                description: `Platform commission from ${product.name}`,
                relatedModel: 'Product',
                relatedId: product._id
            });
        }

        // Create order record
        const order = await Order.create({
            buyer: req.user._id,
            product: product._id,
            developer: product.developer._id,
            amount: totalAmount,
            platformCommission: platformCommission,
            developerEarnings: sellerEarnings,
            paymentId: `wallet_${Date.now()}`,
            status: 'completed'
        });

        // Update product sales and earnings
        product.sales += 1;
        product.earnings += sellerEarnings;
        await product.save();

        // Add product to user's purchased products
        await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { purchasedProducts: product._id }
        });

        res.json({
            success: true,
            message: 'Purchase successful!',
            order
        });
    } catch (error) {
        console.error('Buy now error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while processing purchase'
        });
    }
};

// @route   POST /api/orders/create-order
// @desc    Create Razorpay order
// @access  Private (Buyer)
exports.createOrder = async (req, res) => {
    try {
        if (!razorpay) {
            return res.status(503).json({
                success: false,
                message: 'Payment system not configured. Please contact admin.'
            });
        }

        const { productId } = req.body;

        // Get product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if product is approved
        if (product.status !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Product is not available for purchase'
            });
        }

        // Check if user already purchased this product
        const existingOrder = await Order.findOne({
            buyer: req.user._id,
            product: productId,
            status: 'completed'
        });

        if (existingOrder) {
            return res.status(400).json({
                success: false,
                message: 'You have already purchased this product'
            });
        }

        // Create Razorpay order
        const options = {
            amount: product.price * 100, // amount in paise
            currency: 'INR',
            receipt: `order_${Date.now()}`
        };

        const razorpayOrder = await razorpay.orders.create(options);

        res.json({
            success: true,
            order: razorpayOrder,
            product: {
                id: product._id,
                name: product.name,
                price: product.price
            }
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating order'
        });
    }
};

// @route   POST /api/orders/verify-payment
// @desc    Verify Razorpay payment and create order
// @access  Private (Buyer)
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            productId
        } = req.body;

        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }

        // Get product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Get platform commission
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ platformCommission: 10 });
        }

        // Calculate amounts
        const totalAmount = product.price;
        const platformFeePercentage = settings.platformCommission / 100;

        // If product has basePrice, use it. Otherwise calculate from total price
        let sellerEarnings, platformCommission;
        if (product.basePrice) {
            sellerEarnings = product.basePrice;
            platformCommission = Math.round(product.basePrice * platformFeePercentage * 100) / 100;
        } else {
            // Calculate backwards from total price
            sellerEarnings = Math.round(totalAmount / (1 + platformFeePercentage) * 100) / 100;
            platformCommission = totalAmount - sellerEarnings;
        }

        // Create order
        const order = await Order.create({
            buyer: req.user._id,
            product: product._id,
            developer: product.developer,
            amount: product.price,
            platformCommission: platformCommission,
            developerEarnings: sellerEarnings,
            paymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            razorpaySignature: razorpay_signature,
            status: 'completed'
        });

        // Update product sales and earnings
        product.sales += 1;
        product.earnings += sellerEarnings;
        await product.save();

        // Add product to user's purchased products
        await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { purchasedProducts: product._id }
        });

        res.json({
            success: true,
            message: 'Payment verified successfully',
            order
        });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while verifying payment'
        });
    }
};

// @route   GET /api/orders/my-purchases
// @desc    Get buyer's purchased products
// @access  Private (Buyer)
exports.getMyPurchases = async (req, res) => {
    try {
        const Sale = require('../models/Sale');

        const [orders, sales] = await Promise.all([
            Order.find({ buyer: req.user._id, status: 'completed' })
                .populate('product')
                .populate('developer', 'name email')
                .sort({ createdAt: -1 }),
            Sale.find({ buyer: req.user._id })
                .populate('product')
                .populate('seller', 'name email')
                .sort({ createdAt: -1 })
        ]);

        const validOrders = orders.filter(order => order.product !== null);
        const validSales = sales.filter(sale => sale.product !== null);

        const allPurchases = [
            ...validOrders.map(order => ({
                _id: order._id,
                type: 'payment',
                product: order.product,
                seller: order.developer,
                amount: order.amount,
                createdAt: order.createdAt
            })),
            ...validSales.map(sale => ({
                _id: sale._id,
                type: 'deal',
                product: sale.product,
                seller: sale.seller,
                amount: sale.price,
                createdAt: sale.createdAt
            }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            success: true,
            count: allPurchases.length,
            orders: allPurchases
        });
    } catch (error) {
        console.error('Get purchases error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching purchases'
        });
    }
};

// @route   GET /api/orders/my-sales
// @desc    Get developer's sales
// @access  Private (Developer)
exports.getMySales = async (req, res) => {
    try {
        const Sale = require('../models/Sale');

        // Get both Order-based sales (payment) and Sale-based sales (deal completion)
        const [orderSales, dealSales] = await Promise.all([
            Order.find({ developer: req.user._id, status: 'completed' })
                .populate('product', 'name price')
                .populate('buyer', 'name email')
                .sort({ createdAt: -1 }),
            Sale.find({ seller: req.user._id })
                .populate('product', 'name price')
                .populate('buyer', 'name email')
                .sort({ createdAt: -1 })
        ]);

        // Filter out sales with deleted products (product === null)
        const validOrderSales = orderSales.filter(order => order.product !== null);
        const validDealSales = dealSales.filter(sale => sale.product !== null);

        // Calculate total earnings from orders
        const orderEarnings = validOrderSales.reduce((sum, order) => sum + order.developerEarnings, 0);

        // Calculate earnings from deals (assuming full price goes to seller)
        const dealEarnings = validDealSales.reduce((sum, sale) => sum + sale.price, 0);

        const totalEarnings = orderEarnings + dealEarnings;
        const totalSales = validOrderSales.length + validDealSales.length;

        // Combine and format all sales
        const allSales = [
            ...validOrderSales.map(order => ({
                _id: order._id,
                type: 'payment',
                product: order.product,
                buyer: order.buyer,
                amount: order.developerEarnings,
                createdAt: order.createdAt
            })),
            ...validDealSales.map(sale => ({
                _id: sale._id,
                type: 'deal',
                product: sale.product,
                buyer: sale.buyer,
                amount: sale.price,
                createdAt: sale.createdAt
            }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            success: true,
            count: totalSales,
            totalEarnings,
            orders: allSales
        });
    } catch (error) {
        console.error('Get sales error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching sales'
        });
    }
};

// @route   GET /api/orders/razorpay-key
// @desc    Get Razorpay key
// @access  Public
exports.getRazorpayKey = async (req, res) => {
    res.json({
        success: true,
        key: process.env.RAZORPAY_KEY_ID
    });
};
