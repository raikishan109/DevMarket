require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);

/* ===========================
   GLOBAL MIDDLEWARE
=========================== */

// ✅ SAFE CORS (Vercel + Preview + Local + Postman)
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (origin === process.env.FRONTEND_URL) return callback(null, true);
        if (origin.endsWith('.vercel.app')) return callback(null, true);
        if (origin.startsWith('http://localhost')) return callback(null, true);

        return callback(null, true); // final safe fallback
    },
    credentials: true
}));

app.use(express.json());

// Health check — for UptimeRobot to keep backend alive
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use(express.urlencoded({ extended: true }));

/* ===========================
   SOCKET.IO SETUP
=========================== */

const io = socketIO(server, {
    cors: {
        origin: true,
        credentials: true
    },
    transports: ['websocket', 'polling']
});

/* ===========================
   DATABASE + ROUTES
=========================== */

connectDB()
    .then(() => {
        console.log('✅ MongoDB Connected');

        const createAdminUser = require('./config/adminSeeder');
        const authRoutes = require('./routes/authRoutes');
        const productRoutes = require('./routes/productRoutes');
        const orderRoutes = require('./routes/orderRoutes');
        const reviewRoutes = require('./routes/reviewRoutes');
        const adminRoutes = require('./routes/adminRoutes');
        const chatRoutes = require('./routes/chatRoutes');
        const User = require('./models/User');

        // Create admin safely
        setTimeout(() => {
            createAdminUser();
        }, 1000);

        /* ===========================
           API ROUTES
        =========================== */

        app.use('/api/auth', authRoutes);
        app.use('/api/products', productRoutes);
        app.use('/api/orders', orderRoutes);
        app.use('/api/reviews', reviewRoutes);
        app.use('/api/admin', adminRoutes);
        app.use('/api/users', require('./routes/users'));
        app.use('/api/chat', chatRoutes);
        app.use('/api/wallet', require('./routes/walletRoutes'));
        app.use('/api/settings', require('./routes/settingsRoutes'));

        /* ===========================
           ROOT ROUTE (🔥 FIX)
        =========================== */

        app.get('/', (req, res) => {
            res.send('Backend is live 🚀');
        });

        /* ===========================
           HEALTH CHECK
        =========================== */

        app.get('/api/health', (req, res) => {
            res.json({
                success: true,
                message: 'Server is running',
                timestamp: new Date().toISOString()
            });
        });

        /* ===========================
           SOCKET AUTH
        =========================== */

        io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth?.token;
                if (!token) return next(new Error('Authentication error'));

                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.userId).select('-password');

                if (!user) return next(new Error('User not found'));

                socket.user = user;
                next();
            } catch (err) {
                next(new Error('Authentication error'));
            }
        });

        io.on('connection', (socket) => {
            console.log(`✅ User connected: ${socket.user.name}`);

            socket.on('joinRoom', (roomId) => socket.join(roomId));
            socket.on('leaveRoom', (roomId) => socket.leave(roomId));

            socket.on('sendMessage', ({ chatRoomId, message }) => {
                io.to(chatRoomId).emit('receiveMessage', {
                    chatRoomId,
                    message
                });
            });

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

            socket.on('disconnect', () => {
                console.log(`❌ User disconnected: ${socket.user.name}`);
            });
        });

        /* ===========================
           ERROR HANDLERS
        =========================== */

        app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).json({
                success: false,
                message: err.message || 'Something went wrong'
            });
        });

        app.use((req, res) => {
            res.status(404).json({
                success: false,
                message: 'Route not found'
            });
        });

        /* ===========================
           SERVER START
        =========================== */

        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection failed:', err);
        process.exit(1);
    });