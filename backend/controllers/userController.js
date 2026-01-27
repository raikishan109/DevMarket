const User = require('../models/User');

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users'
        });
    }
};

// Ban/Unban user
exports.toggleBanUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
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
            message: 'Error updating user status'
        });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Don't allow deleting admin users
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete admin users'
            });
        }

        await User.findByIdAndDelete(userId);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting user'
        });
    }
};

// Get user details
exports.getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user details'
        });
    }
};
