const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const Settings = require('../models/Settings');
const Sale = require('../models/Sale');

// @route   GET /api/admin/products/pending
// @desc    Get all pending products
// @access  Private (Admin)
exports.getPendingProducts = async (req, res) => {
    try {
        const products = await Product.find({ status: 'pending' })
            .populate('developer', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching pending products'
        });
    }
};

// @route   GET /api/admin/products/approved
// @desc    Get all approved products
// @access  Private (Admin)
exports.getApprovedProducts = async (req, res) => {
    try {
        const products = await Product.find({ status: 'approved' })
            .populate('developer', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching approved products'
        });
    }
};


// @route   PUT /api/admin/products/:id/approve
// @desc    Approve a product
// @access  Private (Admin)
exports.approveProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { status: 'approved', rejectionReason: '' },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product approved successfully',
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while approving product'
        });
    }
};

// @route   PUT /api/admin/products/:id/reject
// @desc    Reject a product
// @access  Private (Admin)
exports.rejectProduct = async (req, res) => {
    try {
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Please provide rejection reason'
            });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected', rejectionReason: reason },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product rejected',
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while rejecting product'
        });
    }
};

// @route   PUT /api/admin/products/:id/remove
// @desc    Remove (unpublish) a product from marketplace
// @access  Private (Admin)
exports.removeProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { status: 'removed' },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product removed from marketplace',
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while removing product'
        });
    }
};

// @route   DELETE /api/admin/products/:id/permanent
// @desc    Permanently delete a product from database
// @access  Private (Admin)
exports.deleteProductPermanently = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Delete associated chats and messages
        const ChatRoom = require('../models/ChatRoom');
        const Message = require('../models/Message');

        const chatRooms = await ChatRoom.find({ product: req.params.id });
        const chatRoomIds = chatRooms.map(chat => chat._id);

        // Delete all messages in these chat rooms
        await Message.deleteMany({ chatRoom: { $in: chatRoomIds } });

        // Delete all chat rooms for this product
        await ChatRoom.deleteMany({ product: req.params.id });

        // Delete all orders for this product
        await Order.deleteMany({ product: req.params.id });

        // Delete all sales for this product
        await Sale.deleteMany({ product: req.params.id });

        res.json({
            success: true,
            message: 'Product and all associated data permanently deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while deleting product'
        });
    }
};


// @route   GET /api/admin/developers
// @desc    Get all developers
// @access  Private (Admin)
exports.getAllDevelopers = async (req, res) => {
    try {
        const developers = await User.find({ role: 'developer' })
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: developers.length,
            developers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching developers'
        });
    }
};

// @route   PUT /api/admin/developers/:id/verify
// @desc    Verify a developer
// @access  Private (Admin)
exports.verifyDeveloper = async (req, res) => {
    try {
        const developer = await User.findByIdAndUpdate(
            req.params.id,
            { isVerified: true },
            { new: true }
        ).select('-password');

        if (!developer) {
            return res.status(404).json({
                success: false,
                message: 'Developer not found'
            });
        }

        res.json({
            success: true,
            message: 'Developer verified successfully',
            developer
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while verifying developer'
        });
    }
};

// @route   PUT /api/admin/developers/:id/unverify
// @desc    Unverify a developer
// @access  Private (Admin)
exports.unverifyDeveloper = async (req, res) => {
    try {
        const developer = await User.findByIdAndUpdate(
            req.params.id,
            { isVerified: false },
            { new: true }
        ).select('-password');

        if (!developer) {
            return res.status(404).json({
                success: false,
                message: 'Developer not found'
            });
        }

        res.json({
            success: true,
            message: 'Developer unverified',
            developer
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while unverifying developer'
        });
    }
};

// @route   GET /api/admin/stats
// @desc    Get platform statistics
// @access  Private (Admin)
exports.getStats = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments({ status: 'approved' });
        const pendingProducts = await Product.countDocuments({ status: 'pending' });
        const totalDevelopers = await User.countDocuments({ role: 'developer' });
        const totalBuyers = await User.countDocuments({ role: 'buyer' });

        const [orders, sales] = await Promise.all([
            Order.find({ status: 'completed' }).populate('product'),
            Sale.find().populate('product')
        ]);

        const validOrders = orders.filter(order => order.product !== null);
        const validSales = sales.filter(sale => sale.product !== null);

        const totalPaymentOrders = validOrders.length;
        const totalDealOrders = validSales.length;
        const totalOrders = totalPaymentOrders + totalDealOrders;

        const paymentRevenue = validOrders.reduce((sum, order) => sum + order.amount, 0);
        const dealRevenue = validSales.reduce((sum, sale) => sum + sale.price, 0);
        const totalRevenue = paymentRevenue + dealRevenue;

        const paymentCommission = validOrders.reduce((sum, order) => sum + order.platformCommission, 0);
        const dealCommission = validSales.reduce((sum, sale) => sum + sale.platformCommission, 0);
        const platformEarnings = paymentCommission + dealCommission;

        const paymentDevEarnings = validOrders.reduce((sum, order) => sum + order.developerEarnings, 0);
        const dealSellerEarnings = validSales.reduce((sum, sale) => sum + sale.sellerEarnings, 0);
        const developerEarnings = paymentDevEarnings + dealSellerEarnings;

        const [recentPaymentOrders, recentSales] = await Promise.all([
            Order.find({ status: 'completed' })
                .populate('buyer', 'name email')
                .populate('product', 'name price')
                .populate('developer', 'name email')
                .sort({ createdAt: -1 })
                .limit(10),
            Sale.find()
                .populate('buyer', 'name email')
                .populate('product', 'name price')
                .populate('seller', 'name email')
                .sort({ createdAt: -1 })
                .limit(10)
        ]);

        const validRecentOrders = recentPaymentOrders.filter(order => order.product !== null);
        const validRecentSales = recentSales.filter(sale => sale.product !== null);

        const allRecentOrders = [
            ...validRecentOrders.map(order => ({
                _id: order._id,
                type: 'payment',
                buyer: order.buyer,
                product: order.product,
                seller: order.developer,
                amount: order.amount,
                createdAt: order.createdAt
            })),
            ...validRecentSales.map(sale => ({
                _id: sale._id,
                type: 'deal',
                buyer: sale.buyer,
                product: sale.product,
                seller: sale.seller,
                amount: sale.price,
                createdAt: sale.createdAt
            }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);

        res.json({
            success: true,
            stats: {
                totalProducts,
                pendingProducts,
                totalDevelopers,
                totalBuyers,
                totalOrders,
                totalRevenue,
                platformEarnings,
                developerEarnings
            },
            recentOrders: allRecentOrders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching statistics'
        });
    }
};

// @route   GET /api/admin/settings
// @desc    Get platform settings
// @access  Private (Admin)
exports.getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();

        if (!settings) {
            settings = await Settings.create({
                platformCommission: 10
            });
        }

        res.json({
            success: true,
            settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching settings'
        });
    }
};

// @route   PUT /api/admin/settings
// @desc    Update platform settings
// @access  Private (Admin)
exports.updateSettings = async (req, res) => {
    try {
        const { platformCommission } = req.body;

        if (platformCommission < 0 || platformCommission > 100) {
            return res.status(400).json({
                success: false,
                message: 'Commission must be between 0 and 100'
            });
        }

        let settings = await Settings.findOne();

        if (!settings) {
            settings = await Settings.create({
                platformCommission,
                updatedBy: req.user._id
            });
        } else {
            settings.platformCommission = platformCommission;
            settings.updatedBy = req.user._id;
            settings.updatedAt = Date.now();
            await settings.save();
        }

        res.json({
            success: true,
            message: 'Settings updated successfully',
            settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while updating settings'
        });
    }
};

// @route   PUT /api/admin/orders/:id/refund
// @desc    Process refund
// @access  Private (Admin)
exports.processRefund = async (req, res) => {
    try {
        const { reason } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status: 'refunded', refundReason: reason },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update product sales and earnings
        const product = await Product.findById(order.product);
        if (product) {
            product.sales = Math.max(0, product.sales - 1);
            product.earnings = Math.max(0, product.earnings - order.developerEarnings);
            await product.save();
        }

        res.json({
            success: true,
            message: 'Refund processed successfully',
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while processing refund'
        });
    }
};

// @route   POST /api/admin/sub-admins
// @desc    Create a new sub-admin
// @access  Private (Admin only - not sub-admin)
exports.createSubAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if requester is main admin (not sub-admin)
        if (req.user.isSubAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Only main admin can create sub-admins'
            });
        }

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email and password'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create sub-admin
        const subAdmin = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'admin',
            isSubAdmin: true,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: 'Sub-admin created successfully',
            subAdmin: {
                _id: subAdmin._id,
                name: subAdmin.name,
                email: subAdmin.email,
                role: subAdmin.role,
                isSubAdmin: subAdmin.isSubAdmin,
                createdAt: subAdmin.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while creating sub-admin'
        });
    }
};

// @route   GET /api/admin/sub-admins
// @desc    Get all sub-admins
// @access  Private (Admin only - not sub-admin)
exports.getAllSubAdmins = async (req, res) => {
    try {
        // Check if requester is main admin (not sub-admin)
        if (req.user.isSubAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Only main admin can view sub-admins'
            });
        }

        const subAdmins = await User.find({ role: 'admin', isSubAdmin: true })
            .select('-password')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: subAdmins.length,
            subAdmins
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching sub-admins'
        });
    }
};

// @route   DELETE /api/admin/sub-admins/:id
// @desc    Delete a sub-admin
// @access  Private (Admin only - not sub-admin)
exports.deleteSubAdmin = async (req, res) => {
    try {
        // Check if requester is main admin (not sub-admin)
        if (req.user.isSubAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Only main admin can delete sub-admins'
            });
        }

        const subAdmin = await User.findById(req.params.id);

        if (!subAdmin) {
            return res.status(404).json({
                success: false,
                message: 'Sub-admin not found'
            });
        }

        // Verify it's actually a sub-admin
        if (!subAdmin.isSubAdmin || subAdmin.role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: 'This user is not a sub-admin'
            });
        }

        // Prevent deleting main admin
        if (!subAdmin.isSubAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete main admin account'
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Sub-admin deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while deleting sub-admin'
        });
    }
};

// @route   GET /api/admin/users
// @desc    Get all normal users (buyers)
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'buyer' })
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching users'
        });
    }
};

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent deleting admin users
        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete admin users from this endpoint'
            });
        }

        const Product = require('../models/Product');
        const Order = require('../models/Order');
        const Review = require('../models/Review');
        const ChatRoom = require('../models/ChatRoom');
        const Message = require('../models/Message');

        // If user is a developer, delete all their products
        if (user.role === 'developer') {
            // Get all products by this developer
            const products = await Product.find({ developer: req.params.id });
            const productIds = products.map(p => p._id);

            // Delete all reviews for these products
            await Review.deleteMany({ product: { $in: productIds } });

            // Delete all orders for these products
            await Order.deleteMany({ product: { $in: productIds } });

            // Delete all chat rooms for these products
            const chatRooms = await ChatRoom.find({ product: { $in: productIds } });
            const chatRoomIds = chatRooms.map(c => c._id);

            // Delete all messages in these chat rooms
            await Message.deleteMany({ chatRoom: { $in: chatRoomIds } });

            // Delete the chat rooms
            await ChatRoom.deleteMany({ product: { $in: productIds } });

            // Delete all products
            await Product.deleteMany({ developer: req.params.id });
        }

        // If user is a buyer, delete their orders and reviews
        if (user.role === 'buyer') {
            // Delete all orders by this buyer
            await Order.deleteMany({ buyer: req.params.id });

            // Delete all reviews by this buyer
            await Review.deleteMany({ user: req.params.id });

            // Delete chat rooms where user is buyer
            const chatRooms = await ChatRoom.find({ buyer: req.params.id });
            const chatRoomIds = chatRooms.map(c => c._id);

            // Delete all messages in these chat rooms
            await Message.deleteMany({ chatRoom: { $in: chatRoomIds } });

            // Delete the chat rooms
            await ChatRoom.deleteMany({ buyer: req.params.id });
        }

        // Delete the user
        await User.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'User and all related data deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while deleting user'
        });
    }
};

// @route   PUT /api/admin/users/:id/ban
// @desc    Ban/Unban a user
// @access  Private (Admin)
exports.toggleBanUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent banning admin users
        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot ban admin users'
            });
        }

        user.isBanned = !user.isBanned;
        await user.save();

        res.json({
            success: true,
            message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isBanned: user.isBanned
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while updating user'
        });
    }
};

// @route   GET /api/admin/sales
// @desc    Get all completed sales
// @access  Private (Admin)
exports.getCompletedSales = async (req, res) => {
    try {
        const sales = await Sale.find({})
            .populate('product', 'name price')
            .populate('buyer', 'name email')
            .populate('seller', 'name email')
            .populate('chatRoom')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: sales.length,
            sales
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching sales'
        });
    }
};

// @route   POST /api/admin/settings/crypto-address
// @desc    Add crypto address to payment options
// @access  Private (Admin)
exports.addCryptoAddress = async (req, res) => {
    try {
        const { address } = req.body;

        if (!address || !address.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Crypto address is required'
            });
        }

        let settings = await Settings.findOne();

        if (!settings) {
            settings = await Settings.create({
                cryptoAddresses: [address.trim()],
                updatedBy: req.user._id
            });
        } else {
            // Check if address already exists
            if (settings.cryptoAddresses.includes(address.trim())) {
                return res.status(400).json({
                    success: false,
                    message: 'This crypto address already exists'
                });
            }

            settings.cryptoAddresses.push(address.trim());
            settings.updatedBy = req.user._id;
            settings.updatedAt = Date.now();
            await settings.save();
        }

        res.json({
            success: true,
            message: 'Crypto address added successfully',
            settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while adding crypto address'
        });
    }
};

// @route   DELETE /api/admin/settings/crypto-address
// @desc    Remove crypto address from payment options
// @access  Private (Admin)
exports.removeCryptoAddress = async (req, res) => {
    try {
        const { address } = req.body;

        let settings = await Settings.findOne();

        if (!settings) {
            return res.status(404).json({
                success: false,
                message: 'Settings not found'
            });
        }

        settings.cryptoAddresses = settings.cryptoAddresses.filter(
            addr => addr !== address
        );
        settings.updatedBy = req.user._id;
        settings.updatedAt = Date.now();
        await settings.save();

        res.json({
            success: true,
            message: 'Crypto address removed successfully',
            settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while removing crypto address'
        });
    }
};

// @route   POST /api/admin/settings/upi-id
// @desc    Add UPI ID to payment options
// @access  Private (Admin)
exports.addUpiId = async (req, res) => {
    try {
        const { upiId } = req.body;

        if (!upiId || !upiId.trim()) {
            return res.status(400).json({
                success: false,
                message: 'UPI ID is required'
            });
        }

        let settings = await Settings.findOne();

        if (!settings) {
            settings = await Settings.create({
                upiIds: [upiId.trim()],
                updatedBy: req.user._id
            });
        } else {
            // Check if UPI ID already exists
            if (settings.upiIds.includes(upiId.trim())) {
                return res.status(400).json({
                    success: false,
                    message: 'This UPI ID already exists'
                });
            }

            settings.upiIds.push(upiId.trim());
            settings.updatedBy = req.user._id;
            settings.updatedAt = Date.now();
            await settings.save();
        }

        res.json({
            success: true,
            message: 'UPI ID added successfully',
            settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while adding UPI ID'
        });
    }
};

// @route   DELETE /api/admin/settings/upi-id
// @desc    Remove UPI ID from payment options
// @access  Private (Admin)
exports.removeUpiId = async (req, res) => {
    try {
        const { upiId } = req.body;

        let settings = await Settings.findOne();

        if (!settings) {
            return res.status(404).json({
                success: false,
                message: 'Settings not found'
            });
        }

        settings.upiIds = settings.upiIds.filter(
            id => id !== upiId
        );
        settings.updatedBy = req.user._id;
        settings.updatedAt = Date.now();
        await settings.save();

        res.json({
            success: true,
            message: 'UPI ID removed successfully',
            settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while removing UPI ID'
        });
    }
};

// @route   GET /api/admin/payments/pending
// @desc    Get all pending payment requests
// @access  Private (Admin)
exports.getPendingPayments = async (req, res) => {
    try {
        const Payment = require('../models/Payment');
        const payments = await Payment.find({ status: 'pending' })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: payments.length,
            payments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching pending payments'
        });
    }
};

// @route   PUT /api/admin/payments/:id/approve
// @desc    Approve a payment request
// @access  Private (Admin)
exports.approvePayment = async (req, res) => {
    try {
        const Payment = require('../models/Payment');
        const Transaction = require('../models/Transaction');
        const payment = await Payment.findById(req.params.id).populate('user');

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        if (payment.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Payment already processed'
            });
        }

        // Update payment status
        payment.status = 'approved';
        payment.approvedBy = req.user._id;
        payment.approvedAt = new Date();
        await payment.save();

        // Add money to user's wallet
        await User.findByIdAndUpdate(payment.user._id, {
            $inc: { walletBalance: payment.amount }
        });

        // Create transaction record
        await Transaction.create({
            user: payment.user._id,
            type: 'credit',
            amount: payment.amount,
            category: 'deposit',
            description: `Wallet deposit via ${payment.paymentType} (${payment.cryptoCoin || 'UPI'})`,
            relatedModel: 'Payment',
            relatedId: payment._id
        });

        res.json({
            success: true,
            message: 'Payment approved successfully',
            payment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while approving payment'
        });
    }
};

// @route   PUT /api/admin/payments/:id/reject
// @desc    Reject a payment request
// @access  Private (Admin)
exports.rejectPayment = async (req, res) => {
    try {
        const Payment = require('../models/Payment');
        const { reason } = req.body;

        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        if (payment.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Payment already processed'
            });
        }

        payment.status = 'rejected';
        payment.rejectedBy = req.user._id;
        payment.rejectedAt = new Date();
        payment.rejectionReason = reason || 'Payment verification failed';
        await payment.save();

        res.json({
            success: true,
            message: 'Payment rejected',
            payment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while rejecting payment'
        });
    }
};
