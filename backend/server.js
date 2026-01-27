require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = socketIO(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true
    }
});

// Connect to database
connectDB().then(() => {
    // Only import and setup routes after DB connection
    const createAdminUser = require('./config/adminSeeder');
    const authRoutes = require('./routes/authRoutes');
    const productRoutes = require('./routes/productRoutes');
    const orderRoutes = require('./routes/orderRoutes');
    const reviewRoutes = require('./routes/reviewRoutes');
    const adminRoutes = require('./routes/adminRoutes');
    const chatRoutes = require('./routes/chatRoutes');
    const User = require('./models/User');
    const Message = require('./models/Message');

    // Create admin user
    setTimeout(() => {
        createAdminUser();
    }, 1000);

    // Middleware
    const allowedOrigins = [
        process.env.FRONTEND_URL,
        'http://localhost:3000',
        'http://localhost:3001'
    ].filter(Boolean);

    app.use(cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps, Postman, etc.)
            if (!origin) return callback(null, true);

            if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true
    }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/reviews', reviewRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/users', require('./routes/users'));
    app.use('/api/chat', chatRoutes);
    app.use('/api/wallet', require('./routes/walletRoutes'));
    app.use('/api/settings', require('./routes/settingsRoutes'));

    // Health check route
    app.get('/api/health', (req, res) => {
        res.json({
            success: true,
            message: 'Server is running',
            timestamp: new Date().toISOString()
        });
    });

    // Socket.IO Authentication Middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId).select('-password');

            if (!user) {
                return next(new Error('User not found'));
            }

            socket.user = user;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    // Socket.IO Connection Handler
    io.on('connection', (socket) => {
        console.log(`✅ User connected: ${socket.user.name} (${socket.user._id})`);

        // Join a chat room
        socket.on('joinRoom', (chatRoomId) => {
            socket.join(chatRoomId);
        });

        // Leave a chat room
        socket.on('leaveRoom', (chatRoomId) => {
            socket.leave(chatRoomId);
        });

        // Send message
        socket.on('sendMessage', async (data) => {
            try {
                const { chatRoomId, message } = data;

                // Message is already saved via REST API
                // Just broadcast to room
                io.to(chatRoomId).emit('receiveMessage', {
                    chatRoomId,
                    message
                });
            } catch (error) {
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Admin joined notification
        socket.on('adminJoined', (chatRoomId) => {
            io.to(chatRoomId).emit('adminJoinedNotification', {
                message: 'Admin has joined the chat'
            });
        });

        // Typing indicator
        socket.on('typing', (data) => {
            socket.to(data.chatRoomId).emit('userTyping', {
                userId: socket.user._id,
                userName: socket.user.name
            });
        });

        socket.on('stopTyping', (data) => {
            socket.to(data.chatRoomId).emit('userStoppedTyping', {
                userId: socket.user._id
            });
        });

        // Disconnect
        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.user.name}`);
        });
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({
            success: false,
            message: 'Something went wrong!',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    });

    // 404 handler
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: 'Route not found'
        });
    });

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
        console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        console.log(`📡 API: http://localhost:${PORT}/api`);
        console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
        console.log(`💬 Socket.IO: Ready for real-time chat\n`);
    });
});
