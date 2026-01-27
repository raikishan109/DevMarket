// Middleware to ensure only main admins (not sub-admins) can perform certain actions
const mainAdminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }

    if (req.user.isSubAdmin) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Only main administrators can perform this action.'
        });
    }

    next();
};

module.exports = { mainAdminOnly };
