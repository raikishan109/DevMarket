import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/Layout';
import Modal, { ConfirmModal } from '../../components/Modal';
import api from '../../utils/api';
import { getUser, getToken } from '../../utils/auth';
import { initializeSocket, getSocket, disconnectSocket } from '../../utils/socket';
import { useToast } from '../../contexts/ToastContext';
import { FiSend, FiAlertCircle, FiCheckCircle, FiX, FiShield } from 'react-icons/fi';

export default function ChatWindow() {
    const router = useRouter();
    const { roomId } = router.query;
    const toast = useToast();
    const [user, setUser] = useState(null);
    const [chatRoom, setChatRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'info' });
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: () => { } });
    const [isSeller, setIsSeller] = useState(false);
    const [isBuyer, setIsBuyer] = useState(false);

    useEffect(() => {
        const currentUser = getUser();
        if (!currentUser) {
            router.push('/login');
            return;
        }
        setUser(currentUser);

        if (roomId) {
            fetchChatRoom();
            setupSocket();
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.emit('leaveRoom', roomId);
            }
        };
    }, [roomId]);

    // Update role flags when chatRoom or user changes
    useEffect(() => {
        if (chatRoom && user) {
            const sellerMatch = chatRoom.seller && String(chatRoom.seller._id) === String(user._id);
            const buyerMatch = chatRoom.buyer && String(chatRoom.buyer._id) === String(user._id);



            setIsSeller(sellerMatch);
            setIsBuyer(buyerMatch);
        }
    }, [chatRoom, user]);

    useEffect(() => {
        // Only auto-scroll after initial load
        if (!initialLoad && messages.length > 0) {
            setTimeout(() => {
                scrollToBottom();
            }, 100);
        }
    }, [messages]);

    const setupSocket = () => {
        const token = getToken();
        const socket = initializeSocket(token);
        socketRef.current = socket;

        socket.emit('joinRoom', roomId);

        socket.on('receiveMessage', (data) => {
            if (data.chatRoomId === roomId) {
                setMessages(prev => [...prev, data.message]);
            }
        });

        socket.on('adminJoinedNotification', () => {
            fetchChatRoom();
        });
    };

    const fetchChatRoom = async () => {
        try {
            const response = await api.get(`/api/chat/${roomId}`);
            if (response.data.success) {
                setChatRoom(response.data.chatRoom);
                setMessages(response.data.messages);

                // Debug logging
                console.log('Chat Room Data:', {
                    dealStatus: response.data.chatRoom.dealStatus,
                    buyerId: response.data.chatRoom.buyer._id,
                    sellerId: response.data.chatRoom.seller._id,
                    currentUserId: user?._id,
                    status: response.data.chatRoom.status
                });

                // Set user role flags
                if (user && response.data.chatRoom.seller) {
                    setIsSeller(response.data.chatRoom.seller._id == user._id);
                }
                if (user && response.data.chatRoom.buyer) {
                    setIsBuyer(response.data.chatRoom.buyer._id == user._id);
                }

                // Mark initial load complete after a short delay
                setTimeout(() => {
                    setInitialLoad(false);
                }, 500);
            }
        } catch (error) {
            console.error('Error fetching chat:', error);
            toast.error('Failed to load chat');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const response = await api.post('/api/chat/message', {
                chatRoomId: roomId,
                message: newMessage.trim()
            });

            if (response.data.success) {
                const socket = getSocket();
                if (socket) {
                    socket.emit('sendMessage', {
                        chatRoomId: roomId,
                        message: response.data.message
                    });
                }
                setNewMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleAddAdmin = async () => {
        const confirmed = await toast.confirm('Request admin to join this chat?');
        if (!confirmed) return;

        try {
            const response = await api.post(`/api/chat/${roomId}/add-admin`);
            if (response.data.success) {
                toast.success(response.data.message);
                fetchChatRoom();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add admin');
        }
    };

    const handleJoinAsAdmin = async () => {
        try {
            const response = await api.post(`/api/chat/${roomId}/join-admin`);
            if (response.data.success) {
                toast.success('You have joined as admin');
                fetchChatRoom();
                const socket = getSocket();
                if (socket) {
                    socket.emit('adminJoined', roomId);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to join as admin');
        }
    };

    const handleCloseChat = async () => {
        const confirmed = confirm('Mark this chat as resolved?');
        if (!confirmed) return;

        try {
            const response = await api.post(`/api/chat/${roomId}/close`);
            if (response.data.success) {

                fetchChatRoom();
            }
        } catch (error) {
            console.error('Failed to close chat:', error);
            alert('Failed to close chat');
        }
    };

    const handleReopenChat = async () => {
        const confirmed = confirm('Reopen this chat to continue the conversation?');
        if (!confirmed) return;

        try {
            const response = await api.post(`/api/chat/${roomId}/reopen`);
            if (response.data.success) {

                fetchChatRoom();
            }
        } catch (error) {
            console.error('Failed to reopen chat:', error);
            alert(error.response?.data?.message || 'Failed to reopen chat');
        }
    };

    const handleMarkDealDone = async () => {
        const confirmed = confirm('Mark this deal as done? Buyer will need to confirm.');
        if (!confirmed) return;

        try {
            const response = await api.post(`/api/chat/${roomId}/mark-deal-done`);
            if (response.data.success) {
                toast.success(response.data.message);
                fetchChatRoom();
            }
        } catch (error) {
            console.error('Mark deal error:', error);
            alert(error.response?.data?.message || 'Failed to mark deal');
        }
    };

    const handleConfirmDeal = async () => {
        const confirmed = confirm('Confirm deal completion? This will record the sale.');
        if (!confirmed) return;

        try {
            const response = await api.post(`/api/chat/${roomId}/confirm-deal`);
            if (response.data.success) {
                toast.success(response.data.message);
                fetchChatRoom();
            }
        } catch (error) {
            console.error('Confirm deal error:', error);
            alert(error.response?.data?.message || 'Failed to confirm deal');
        }
    };


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const getMessageStyle = (senderRole) => {
        if (senderRole === 'admin') {
            return 'bg-yellow-100 border-l-4 border-yellow-500';
        }
        return 'bg-gray-100';
    };

    const isMyMessage = (message) => {
        return message.sender._id === user?._id;
    };

    if (loading) {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <div className="skeleton h-96"></div>
                </div>
            </Layout>
        );
    }

    if (!chatRoom) {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                    <p className="text-gray-600">Chat room not found</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <Head>
                <title>Chat - {chatRoom.product.name}</title>
            </Head>

            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Product Context Header */}
                <div className="card mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 mb-1">
                                {chatRoom.product.name}
                            </h2>
                            <p className="text-2xl font-bold text-primary-600">
                                ₹{chatRoom.product.price}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className={`badge ${chatRoom.isPurchased ? 'badge-success' : 'badge-warning'}`}>
                                {chatRoom.isPurchased ? '✓ Purchased' : 'Not Purchased'}
                            </span>
                            {chatRoom.status === 'resolved' && (
                                <span className="badge badge-info ml-2">Resolved</span>
                            )}
                        </div>
                    </div>

                    {/* Participants */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div>
                                <span className="font-semibold">Buyer:</span> {chatRoom.buyer.name}
                            </div>
                            <div>
                                <span className="font-semibold">Seller:</span> {chatRoom.seller.name}
                            </div>
                            {chatRoom.admin && (
                                <div className="flex items-center space-x-1">
                                    <FiShield className="text-yellow-600" />
                                    <span className="font-semibold">Admin:</span> {chatRoom.admin.name}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 flex space-x-2">
                        {!chatRoom.admin && user.role !== 'admin' && (
                            <button
                                onClick={handleAddAdmin}
                                className="btn btn-secondary flex items-center space-x-2"
                            >
                                <FiAlertCircle />
                                <span>Report / Add Admin</span>
                            </button>
                        )}

                        {user.role === 'admin' && !chatRoom.admin && (
                            <button
                                onClick={handleJoinAsAdmin}
                                className="btn btn-primary flex items-center space-x-2"
                            >
                                <FiShield />
                                <span>Join as Admin</span>
                            </button>
                        )}

                        {user.role === 'admin' && chatRoom.admin && chatRoom.status === 'open' && (
                            <button
                                onClick={handleCloseChat}
                                className="btn btn-success flex items-center space-x-2"
                            >
                                <FiCheckCircle />
                                <span>Mark as Resolved</span>
                            </button>
                        )}

                        {/* Deal Completion Buttons */}
                        {/* Seller Button - Mark Deal as Done */}
                        {user && chatRoom.seller && chatRoom.seller._id === user._id &&
                            chatRoom.status === 'open' &&
                            (!chatRoom.dealStatus || chatRoom.dealStatus === 'pending') && (
                                <button
                                    onClick={handleMarkDealDone}
                                    className="btn btn-primary flex items-center space-x-2"
                                >
                                    <FiCheckCircle />
                                    <span>Mark Deal as Done</span>
                                </button>
                            )}

                        {/* Buyer Button - Confirm Deal */}
                        {user && chatRoom.buyer && chatRoom.buyer._id === user._id &&
                            chatRoom.dealStatus === 'seller_marked' && (
                                <button
                                    onClick={handleConfirmDeal}
                                    className="btn btn-success flex items-center space-x-2 animate-pulse"
                                >
                                    <FiCheckCircle />
                                    <span>Confirm Deal</span>
                                </button>
                            )}
                    </div>

                    {/* Deal Status Badge */}
                    {chatRoom.dealStatus && chatRoom.dealStatus !== 'pending' && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            {chatRoom.dealStatus === 'seller_marked' && (
                                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-sm">
                                    ⏳ Waiting for buyer confirmation
                                </div>
                            )}
                            {chatRoom.dealStatus === 'completed' && (
                                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg text-sm">
                                    🎉 Deal completed! Sale recorded.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Chat Messages */}
                <div className="card">
                    <div className="h-96 overflow-y-auto mb-4 space-y-3">
                        {messages.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">
                                No messages yet. Start the conversation!
                            </p>
                        ) : (
                            messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${isMyMessage(msg) ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${isMyMessage(msg)
                                            ? 'bg-primary-600 text-white'
                                            : getMessageStyle(msg.senderRole)
                                            }`}
                                    >
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className="text-xs font-semibold">
                                                {msg.sender.name}
                                            </span>
                                            {msg.senderRole === 'admin' && (
                                                <FiShield className="text-yellow-600" size={12} />
                                            )}
                                        </div>
                                        <p className="text-sm break-words">{msg.message}</p>
                                        <p className={`text-xs mt-1 ${isMyMessage(msg) ? 'text-primary-100' : 'text-gray-500'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    {chatRoom.status === 'open' ? (
                        <form onSubmit={handleSendMessage} className="flex space-x-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="input flex-1"
                                disabled={sending}
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim() || sending}
                                className="btn btn-primary flex items-center space-x-2"
                            >
                                <FiSend />
                                <span>Send</span>
                            </button>

                            {/* Seller Button */}
                            <button
                                type="button"
                                onClick={handleMarkDealDone}
                                className="btn btn-success"
                            >
                                Mark Deal Done
                            </button>

                            {/* Buyer Button */}
                            <button
                                type="button"
                                onClick={handleConfirmDeal}
                                className="btn btn-warning"
                            >
                                Confirm Deal
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-4 bg-gray-50 rounded-lg space-y-3">
                            <p className="text-gray-600">This chat has been resolved</p>
                            {user.role !== 'admin' && (
                                <button
                                    onClick={handleReopenChat}
                                    className="btn btn-primary flex items-center space-x-2 mx-auto"
                                >
                                    <FiSend />
                                    <span>Reopen Chat</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Chat Rules */}
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">Chat Rules:</h3>
                    <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• No external payment links allowed</li>
                        <li>• Be respectful and professional</li>
                        <li>• Report any issues to admin</li>
                        <li>• Chat remains open after payment for support</li>
                    </ul>
                </div>
            </div>
        </Layout>
    );
}
