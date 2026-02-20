import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import api from '../utils/api';
import { getUser } from '../utils/auth';
import { FiMessageSquare, FiShield, FiCheckCircle } from 'react-icons/fi';

export default function ChatList() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [chatRooms, setChatRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = getUser();
        if (!currentUser) {
            router.push('/login');
            return;
        }
        setUser(currentUser);
        fetchChatRooms();
    }, []);

    const fetchChatRooms = async () => {
        try {
            const response = await api.get('/api/chat/rooms');
            if (response.data.success) {
                setChatRooms(response.data.chatRooms);
            }
        } catch (error) {
            console.error('Error fetching chats:', error);
        } finally {
            setLoading(false);
        }
    };

    const getUserRole = (chatRoom) => {
        if (!user) return '';
        if (chatRoom.buyer._id === user.id) return 'buyer';
        if (chatRoom.seller._id === user.id) return 'seller';
        if (chatRoom.admin && chatRoom.admin._id === user.id) return 'admin';
        return '';
    };

    const getOtherPartyName = (chatRoom) => {
        const role = getUserRole(chatRoom);
        if (role === 'buyer') return chatRoom.seller.name;
        if (role === 'seller') return chatRoom.buyer.name;
        return `${chatRoom.buyer.name} & ${chatRoom.seller.name}`;
    };

    return (
        <Layout>
            <Head>
                <title>My Chats - DevMarket</title>
            </Head>

            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold mb-2">My Chats</h1>
                    <p className="text-primary-100">Manage your conversations</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {loading ? (
                    <div className="skeleton h-96"></div>
                ) : chatRooms.length === 0 ? (
                    <div className="card text-center py-12">
                        <FiMessageSquare className="mx-auto text-6xl text-gray-400 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No chats yet</h3>
                        <p className="text-gray-600 mb-6">
                            Start a conversation by contacting a seller on a product page
                        </p>
                        <Link href="/marketplace" className="btn btn-primary">
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {chatRooms.map((chatRoom) => (
                            <Link
                                key={chatRoom._id}
                                href={`/chat/${chatRoom._id}`}
                                className="card hover:shadow-lg transition-shadow cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <h3 className="text-lg font-bold text-gray-900">
                                                {chatRoom.product.name}
                                            </h3>
                                            {chatRoom.admin && (
                                                <FiShield className="text-yellow-600" title="Admin joined" />
                                            )}
                                            {chatRoom.status === 'resolved' && (
                                                <FiCheckCircle className="text-green-600" title="Resolved" />
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">
                                            With: <span className="font-semibold">{getOtherPartyName(chatRoom)}</span>
                                        </p>
                                        {chatRoom.lastMessage && (
                                            <p className="text-sm text-gray-500 truncate">
                                                {chatRoom.lastMessage}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-primary-600 mb-1">
                                            ₹{chatRoom.product.price}
                                        </p>
                                        <span className={`badge ${chatRoom.isPurchased ? 'badge-success' : 'badge-warning'}`}>
                                            {chatRoom.isPurchased ? 'Purchased' : 'Not Purchased'}
                                        </span>
                                        {chatRoom.status === 'resolved' && (
                                            <span className="badge badge-info block mt-1">Resolved</span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
