const express = require('express');
const router = express.Router();
const {
    createChatRoom,
    getMyChatRooms,
    getChatRoom,
    sendMessage,
    addAdminToChat,
    joinAsAdmin,
    closeChatRoom,
    reopenChatRoom,
    markDealAsDone,
    confirmDeal,
    getAllChatsForAdmin
} = require('../controllers/chatController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// User routes
router.post('/create', authMiddleware, createChatRoom);
router.get('/rooms', authMiddleware, getMyChatRooms);
router.get('/:chatRoomId', authMiddleware, getChatRoom);
router.post('/message', authMiddleware, sendMessage);
router.post('/:chatRoomId/add-admin', authMiddleware, addAdminToChat);
router.post('/:chatRoomId/reopen', authMiddleware, reopenChatRoom);
router.post('/:chatRoomId/mark-deal-done', authMiddleware, markDealAsDone);
router.post('/:chatRoomId/confirm-deal', authMiddleware, confirmDeal);

// Admin routes
router.post('/:chatRoomId/join-admin', authMiddleware, adminMiddleware, joinAsAdmin);
router.post('/:chatRoomId/close', authMiddleware, adminMiddleware, closeChatRoom);
router.get('/admin/all', authMiddleware, adminMiddleware, getAllChatsForAdmin);

module.exports = router;
