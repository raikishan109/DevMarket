const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Sale = require('../models/Sale');

// @route   POST /api/chat/create
// @desc    Create or get existing chat room
// @access  Private
exports.createChatRoom = async (req, res) => {
    try {
        const { productId } = req.body;

        // Get product
        const product = await Product.findById(productId).populate('developer', 'name email');
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if user is trying to chat with themselves
        if (product.developer._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot chat with yourself'
            });
        }

        // Check if chat room already exists
        let chatRoom = await ChatRoom.findOne({
            product: productId,
            buyer: req.user._id,
            seller: product.developer._id
        }).populate('product', 'name price')
            .populate('buyer', 'name email')
            .populate('seller', 'name email')
            .populate('admin', 'name email');

        if (chatRoom) {
            return res.json({
                success: true,
                chatRoom,
                isNew: false
            });
        }

        // Check if user has purchased the product
        const order = await Order.findOne({
            product: productId,
            buyer: req.user._id,
            status: 'completed'
        });

        // Create new chat room
        chatRoom = await ChatRoom.create({
            product: productId,
            buyer: req.user._id,
            seller: product.developer._id,
            isPurchased: !!order
        });

        // Populate fields
        chatRoom = await ChatRoom.findById(chatRoom._id)
            .populate('product', 'name price')
            .populate('buyer', 'name email')
            .populate('seller', 'name email');

        res.status(201).json({
            success: true,
            chatRoom,
            isNew: true
        });
    } catch (error) {
        console.error('Create chat room error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating chat room'
        });
    }
};

// @route   GET /api/chat/rooms
// @desc    Get all chat rooms for current user
// @access  Private
exports.getMyChatRooms = async (req, res) => {
    try {
        const query = {
            $or: [
                { buyer: req.user._id },
                { seller: req.user._id }
            ]
        };

        // If admin, show all rooms where admin is added
        if (req.user.role === 'admin') {
            query.$or.push({ admin: req.user._id });
        }

        let chatRooms = await ChatRoom.find(query)
            .populate('product', 'name price')
            .populate('buyer', 'name email')
            .populate('seller', 'name email')
            .populate('admin', 'name email')
            .sort({ lastMessageAt: -1 });

        // Filter out chat rooms with deleted products
        chatRooms = chatRooms.filter(room => room.product !== null);

        res.json({
            success: true,
            count: chatRooms.length,
            chatRooms
        });
    } catch (error) {
        console.error('Get chat rooms error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching chat rooms'
        });
    }
};

// @route   GET /api/chat/:chatRoomId
// @desc    Get chat room details with messages
// @access  Private
exports.getChatRoom = async (req, res) => {
    try {
        const chatRoom = await ChatRoom.findById(req.params.chatRoomId)
            .populate('product', 'name price accessLink')
            .populate('buyer', 'name email')
            .populate('seller', 'name email')
            .populate('admin', 'name email');

        if (!chatRoom) {
            return res.status(404).json({
                success: false,
                message: 'Chat room not found'
            });
        }

        // Check if user has access to this chat room
        const hasAccess =
            chatRoom.buyer._id.toString() === req.user._id.toString() ||
            chatRoom.seller._id.toString() === req.user._id.toString() ||
            (chatRoom.admin && chatRoom.admin._id.toString() === req.user._id.toString()) ||
            req.user.role === 'admin';

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Get messages
        const messages = await Message.find({ chatRoom: req.params.chatRoomId })
            .populate('sender', 'name email')
            .sort({ createdAt: 1 });

        res.json({
            success: true,
            chatRoom,
            messages
        });
    } catch (error) {
        console.error('Get chat room error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching chat room'
        });
    }
};

// @route   POST /api/chat/message
// @desc    Send a message
// @access  Private
exports.sendMessage = async (req, res) => {
    try {
        const { chatRoomId, message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Message cannot be empty'
            });
        }

        // Get chat room
        const chatRoom = await ChatRoom.findById(chatRoomId);
        if (!chatRoom) {
            return res.status(404).json({
                success: false,
                message: 'Chat room not found'
            });
        }

        // Check access and determine sender role
        let senderRole;
        if (chatRoom.buyer.toString() === req.user._id.toString()) {
            senderRole = 'buyer';
        } else if (chatRoom.seller.toString() === req.user._id.toString()) {
            senderRole = 'seller';
        } else if (chatRoom.admin && chatRoom.admin.toString() === req.user._id.toString()) {
            senderRole = 'admin';
        } else if (req.user.role === 'admin') {
            senderRole = 'admin';
        } else {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Create message
        const newMessage = await Message.create({
            chatRoom: chatRoomId,
            sender: req.user._id,
            senderRole,
            message: message.trim()
        });

        // Update chat room last message
        chatRoom.lastMessage = message.trim().substring(0, 100);
        chatRoom.lastMessageAt = new Date();
        await chatRoom.save();

        // Populate sender
        await newMessage.populate('sender', 'name email');

        res.status(201).json({
            success: true,
            message: newMessage
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while sending message'
        });
    }
};

// @route   POST /api/chat/:chatRoomId/add-admin
// @desc    Add admin to chat room (escalate)
// @access  Private (Buyer/Seller)
exports.addAdminToChat = async (req, res) => {
    try {
        const chatRoom = await ChatRoom.findById(req.params.chatRoomId);

        if (!chatRoom) {
            return res.status(404).json({
                success: false,
                message: 'Chat room not found'
            });
        }

        // Check if user is buyer or seller
        const isParticipant =
            chatRoom.buyer.toString() === req.user._id.toString() ||
            chatRoom.seller.toString() === req.user._id.toString();

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: 'Only buyer or seller can add admin'
            });
        }

        if (chatRoom.admin) {
            return res.status(400).json({
                success: false,
                message: 'Admin already added to this chat'
            });
        }

        // Mark that admin has been requested
        chatRoom.adminRequested = true;
        chatRoom.status = 'open'; // Keep it open for admin to join
        await chatRoom.save();

        // Create system message
        await Message.create({
            chatRoom: chatRoom._id,
            sender: req.user._id,
            senderRole: chatRoom.buyer.toString() === req.user._id.toString() ? 'buyer' : 'seller',
            message: '🚨 Admin has been requested to join this chat'
        });

        res.json({
            success: true,
            message: 'Admin has been notified and will join soon'
        });
    } catch (error) {
        console.error('Add admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding admin'
        });
    }
};

// @route   POST /api/chat/:chatRoomId/join-admin
// @desc    Admin joins a chat room
// @access  Private (Admin only)
exports.joinAsAdmin = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can join chats'
            });
        }

        const chatRoom = await ChatRoom.findById(req.params.chatRoomId);

        if (!chatRoom) {
            return res.status(404).json({
                success: false,
                message: 'Chat room not found'
            });
        }

        chatRoom.admin = req.user._id;
        chatRoom.adminRequested = false; // Clear the flag since admin has joined
        await chatRoom.save();

        // Create system message
        await Message.create({
            chatRoom: chatRoom._id,
            sender: req.user._id,
            senderRole: 'admin',
            message: '👮 Admin has joined the chat'
        });

        res.json({
            success: true,
            message: 'Successfully joined chat as admin'
        });
    } catch (error) {
        console.error('Join as admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while joining chat'
        });
    }
};

// @route   POST /api/chat/:chatRoomId/close
// @desc    Close/resolve a chat room
// @access  Private (Admin only)
exports.closeChatRoom = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can close chats'
            });
        }

        const chatRoom = await ChatRoom.findById(req.params.chatRoomId);

        if (!chatRoom) {
            return res.status(404).json({
                success: false,
                message: 'Chat room not found'
            });
        }

        chatRoom.status = 'resolved';
        await chatRoom.save();

        // Create system message
        await Message.create({
            chatRoom: chatRoom._id,
            sender: req.user._id,
            senderRole: 'admin',
            message: '✅ Chat has been marked as resolved by admin'
        });

        res.json({
            success: true,
            message: 'Chat room closed successfully'
        });
    } catch (error) {
        console.error('Close chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while closing chat'
        });
    }
};

// @route   POST /api/chat/:chatRoomId/reopen
// @desc    Reopen a resolved chat room
// @access  Private (Buyer/Seller)
exports.reopenChatRoom = async (req, res) => {
    try {
        const chatRoom = await ChatRoom.findById(req.params.chatRoomId);

        if (!chatRoom) {
            return res.status(404).json({
                success: false,
                message: 'Chat room not found'
            });
        }

        // Check if user is buyer or seller
        const isParticipant =
            chatRoom.buyer.toString() === req.user._id.toString() ||
            chatRoom.seller.toString() === req.user._id.toString();

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: 'Only buyer or seller can reopen chat'
            });
        }

        if (chatRoom.status !== 'resolved') {
            return res.status(400).json({
                success: false,
                message: 'Chat is not resolved'
            });
        }

        chatRoom.status = 'open';
        await chatRoom.save();

        // Create system message
        await Message.create({
            chatRoom: chatRoom._id,
            sender: req.user._id,
            senderRole: chatRoom.buyer.toString() === req.user._id.toString() ? 'buyer' : 'seller',
            message: '🔄 Chat has been reopened'
        });

        res.json({
            success: true,
            message: 'Chat reopened successfully'
        });
    } catch (error) {
        console.error('Reopen chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while reopening chat'
        });
    }
};

// @route   GET /api/chat/admin/all
// @desc    Get all chat rooms (Admin only)
// @access  Private (Admin)
exports.getAllChatsForAdmin = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const chatRooms = await ChatRoom.find({})
            .populate('product', 'name price')
            .populate('buyer', 'name email')
            .populate('seller', 'name email')
            .populate('admin', 'name email')
            .sort({ lastMessageAt: -1 });

        res.json({
            success: true,
            count: chatRooms.length,
            chatRooms
        });
    } catch (error) {
        console.error('Get all chats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching chats'
        });
    }
};

// @route   POST /api/chat/:chatRoomId/mark-deal-done
// @desc    Seller marks deal as done
// @access  Private (Seller only)
exports.markDealAsDone = async (req, res) => {
    try {
        const chatRoom = await ChatRoom.findById(req.params.chatRoomId)
            .populate('product', 'name price');

        if (!chatRoom) {
            return res.status(404).json({
                success: false,
                message: 'Chat room not found'
            });
        }

        // Check if user is seller
        if (chatRoom.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only seller can mark deal as done'
            });
        }

        if (chatRoom.dealStatus === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Deal already completed'
            });
        }

        chatRoom.dealStatus = 'seller_marked';
        chatRoom.sellerMarkedDone = true;
        await chatRoom.save();

        // Create system message
        await Message.create({
            chatRoom: chatRoom._id,
            sender: req.user._id,
            senderRole: 'seller',
            message: '✅ Seller has marked the deal as done. Waiting for buyer confirmation.'
        });

        res.json({
            success: true,
            message: 'Deal marked as done. Waiting for buyer confirmation.'
        });
    } catch (error) {
        console.error('Mark deal done error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while marking deal'
        });
    }
};

// @route   POST /api/chat/:chatRoomId/confirm-deal
// @desc    Buyer confirms deal completion
// @access  Private (Buyer only)
exports.confirmDeal = async (req, res) => {
    try {
        const chatRoom = await ChatRoom.findById(req.params.chatRoomId)
            .populate('product', 'name price sales');

        if (!chatRoom) {
            return res.status(404).json({
                success: false,
                message: 'Chat room not found'
            });
        }

        // Check if user is buyer
        if (chatRoom.buyer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only buyer can confirm deal'
            });
        }

        if (chatRoom.dealStatus !== 'seller_marked') {
            return res.status(400).json({
                success: false,
                message: 'Seller must mark deal as done first'
            });
        }

        if (chatRoom.dealStatus === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Deal already completed'
            });
        }

        // Update chat room
        chatRoom.dealStatus = 'completed';
        await chatRoom.save();

        const displayPrice = chatRoom.product.price;
        let basePrice, platformCommission, sellerEarnings;

        if (chatRoom.product.basePrice) {
            basePrice = chatRoom.product.basePrice;
            platformCommission = displayPrice - basePrice;
            sellerEarnings = basePrice;
        } else {
            basePrice = Math.round((displayPrice / 1.05) * 100) / 100;
            platformCommission = Math.round((displayPrice - basePrice) * 100) / 100;
            sellerEarnings = basePrice;
        }

        // Create sale record
        await Sale.create({
            product: chatRoom.product._id,
            buyer: chatRoom.buyer,
            seller: chatRoom.seller,
            chatRoom: chatRoom._id,
            price: displayPrice,
            platformCommission: platformCommission,
            sellerEarnings: sellerEarnings
        });

        const Transaction = require('../models/Transaction');
        const User = require('../models/User'); // Assuming User model is available or imported

        await Transaction.create({
            user: chatRoom.seller,
            type: 'credit',
            amount: sellerEarnings,
            category: 'sale',
            description: `Sale of ${chatRoom.product.name}`,
            relatedModel: 'Sale',
            relatedId: chatRoom._id
        });

        await Transaction.create({
            user: chatRoom.buyer,
            type: 'debit',
            amount: displayPrice,
            category: 'purchase',
            description: `Purchase of ${chatRoom.product.name}`,
            relatedModel: 'Sale',
            relatedId: chatRoom._id
        });

        const adminUser = await User.findOne({ role: 'admin', isSubAdmin: { $ne: true } });
        if (adminUser && platformCommission > 0) {
            await Transaction.create({
                user: adminUser._id,
                type: 'credit',
                amount: platformCommission,
                category: 'commission',
                description: `Platform commission from ${chatRoom.product.name}`,
                relatedModel: 'Sale',
                relatedId: chatRoom._id
            });

            await User.findByIdAndUpdate(adminUser._id, {
                $inc: { walletBalance: platformCommission }
            });
        }

        await User.findByIdAndUpdate(chatRoom.seller, {
            $inc: { walletBalance: sellerEarnings }
        });

        await User.findByIdAndUpdate(chatRoom.buyer, {
            $inc: { walletBalance: -displayPrice }
        });

        // Increment product sales count and update earnings
        const product = await Product.findById(chatRoom.product._id);
        product.sales += 1;
        product.earnings = (product.earnings || 0) + sellerEarnings;
        await product.save();

        // Close the chat after deal completion
        chatRoom.status = 'resolved';
        await chatRoom.save();

        // Create system message
        await Message.create({
            chatRoom: chatRoom._id,
            sender: req.user._id,
            senderRole: 'buyer',
            message: '🎉 Deal completed! Sale has been recorded. Chat has been closed.'
        });

        res.json({
            success: true,
            message: 'Deal confirmed successfully!'
        });
    } catch (error) {
        console.error('Confirm deal error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while confirming deal'
        });
    }
};
