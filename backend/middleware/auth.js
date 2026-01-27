const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No authentication token, access denied'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token is not valid'
        });
    }
};

// Check if user is admin
const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin only.'
        });
    }
};

// Check if user can sell products (any authenticated user can sell)
const developerMiddleware = (req, res, next) => {
    if (req.user) {
        // Any authenticated user can sell products
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Please login to sell products.'
        });
    }
};

// Check if user is buyer
const buyerMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'buyer') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Buyers only.'
        });
    }
};

module.exports = {
    authMiddleware,
    adminMiddleware,
    developerMiddleware,
    buyerMiddleware,
    protect: authMiddleware,  // Alias for compatibility
    admin: adminMiddleware    // Alias for compatibility
};
