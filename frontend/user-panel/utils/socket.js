import { io } from 'socket.io-client';

let socket = null;

export const initializeSocket = (token) => {
    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_API_URL.replace('/api', ''), {
            auth: {
                token
            },
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
            console.log('✅ Socket connected');
        });

        socket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });
    }

    return socket;
};

export const getSocket = () => {
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export default {
    initializeSocket,
    getSocket,
    disconnectSocket
};
