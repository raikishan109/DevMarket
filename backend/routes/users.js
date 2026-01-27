const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
    getAllUsers,
    toggleBanUser,
    deleteUser,
    getUserDetails
} = require('../controllers/userController');

// Get all users (admin only)
router.get('/', protect, admin, getAllUsers);

// Get user details (admin only)
router.get('/:userId', protect, admin, getUserDetails);

// Ban/Unban user (admin only)
router.put('/:userId/ban', protect, admin, toggleBanUser);

// Delete user (admin only)
router.delete('/:userId', protect, admin, deleteUser);

module.exports = router;
