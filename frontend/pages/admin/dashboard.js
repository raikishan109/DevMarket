import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';
import { getUser } from '../../utils/auth';
import { useToast } from '../../contexts/ToastContext';
import { FiPackage, FiUsers, FiDollarSign, FiShoppingBag, FiCheck, FiX, FiSettings } from 'react-icons/fi';

export default function AdminDashboard() {
    const router = useRouter();
    const toast = useToast();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [pendingProducts, setPendingProducts] = useState([]);
    const [approvedProducts, setApprovedProducts] = useState([]);
    const [developers, setDevelopers] = useState([]);
    const [activeChatRooms, setActiveChatRooms] = useState([]);
    const [subAdmins, setSubAdmins] = useState([]);
    const [users, setUsers] = useState([]);
    const [pendingPayments, setPendingPayments] = useState([]);
    const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
    const [settings, setSettings] = useState({ platformCommission: 10 });
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [newSubAdmin, setNewSubAdmin] = useState({ name: '', email: '', password: '' });

    useEffect(() => {
        const currentUser = getUser();
        if (!currentUser || currentUser.role !== 'admin') {
            router.push('/login');
            return;
        }
        setUser(currentUser);
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const currentUser = getUser();
            const promises = [
                api.get('/api/admin/stats'),
                api.get('/api/admin/products/pending'),
                api.get('/api/admin/products/approved'),
                api.get('/api/admin/developers'),
                api.get('/api/admin/settings'),
                api.get('/api/chat/admin/all'),
                api.get('/api/admin/users'),
                api.get('/api/admin/payments/pending'),
                api.get('/api/admin/withdrawals/pending')
            ];

            // Only fetch sub-admins if user is main admin
            if (currentUser && !currentUser.isSubAdmin) {
                promises.push(api.get('/api/admin/sub-admins'));
            }

            const results = await Promise.all(promises);
            const [statsRes, pendingRes, approvedRes, devsRes, settingsRes, chatsRes, usersRes, paymentsRes, withdrawalsRes, subAdminsRes] = results;

            if (statsRes.data.success) setStats(statsRes.data.stats);
            if (pendingRes.data.success) setPendingProducts(pendingRes.data.products);
            if (approvedRes.data.success) setApprovedProducts(approvedRes.data.products);
            if (devsRes.data.success) setDevelopers(devsRes.data.developers);
            if (settingsRes.data.success) setSettings(settingsRes.data.settings);
            if (chatsRes.data.success) setActiveChatRooms(chatsRes.data.chatRooms);
            if (usersRes.data.success) setUsers(usersRes.data.users);
            if (paymentsRes.data.success) setPendingPayments(paymentsRes.data.payments);
            if (withdrawalsRes.data.success) setPendingWithdrawals(withdrawalsRes.data.withdrawals);
            if (subAdminsRes?.data.success) setSubAdmins(subAdminsRes.data.subAdmins);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveProduct = async (id) => {
        try {
            await api.put(`/api/admin/products/${id}/approve`);
            toast.success('Product approved successfully');
            fetchData();
        } catch (error) {
            toast.error('Error approving product');
        }
    };

    const handleRejectProduct = async (id) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        try {
            await api.put(`/api/admin/products/${id}/reject`, { reason });
            toast.success('Product rejected');
            fetchData();
        } catch (error) {
            toast.error('Error rejecting product');
        }
    };

    const handleRemoveProduct = async (id) => {
        const confirmed = await toast.confirm('Remove this product from marketplace? It will be hidden from users but kept in database.');
        if (!confirmed) return;

        try {
            await api.put(`/api/admin/products/${id}/remove`);
            toast.success('Product removed from marketplace');
            fetchData();
        } catch (error) {
            toast.error('Error removing product');
        }
    };

    const handleDeleteProduct = async (id) => {
        const confirmed = await toast.confirm('Permanently delete this product? This action cannot be undone and will remove all associated data.');
        if (!confirmed) return;

        try {
            await api.delete(`/api/admin/products/${id}/permanent`);
            toast.success('Product permanently deleted');
            fetchData();
        } catch (error) {
            toast.error('Error deleting product');
        }
    };


    const handleVerifyDeveloper = async (id, verify) => {
        try {
            if (verify) {
                await api.put(`/api/admin/developers/${id}/verify`);
                toast.success('Developer verified');
            } else {
                await api.put(`/api/admin/developers/${id}/unverify`);
                toast.success('Developer unverified');
            }
            fetchData();
        } catch (error) {
            toast.error('Error updating developer');
        }
    };

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put('/api/admin/settings', { platformCommission: settings.platformCommission });
            if (response.data.success) {
                toast.success('Settings updated successfully! 🎉');
                // Refresh settings to show the updated value
                const settingsRes = await api.get('/api/admin/settings');
                if (settingsRes.data.success) {
                    setSettings(settingsRes.data.settings);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating settings');
        }
    };

    const handleCreateSubAdmin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/admin/sub-admins', newSubAdmin);
            if (res.data.success) {
                toast.success('Sub-admin created successfully');
                setNewSubAdmin({ name: '', email: '', password: '' });
                fetchData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating sub-admin');
        }
    };

    const handleDeleteSubAdmin = async (id) => {
        const confirmed = await toast.confirm('Are you sure you want to delete this sub-admin? This action cannot be undone.');
        if (!confirmed) return;
        try {
            await api.delete(`/api/admin/sub-admins/${id}`);
            toast.success('Sub-admin deleted successfully');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting sub-admin');
        }
    };

    const handleDeleteUser = async (id) => {
        const confirmed = await toast.confirm('Are you sure you want to delete this user? This will also delete all their data.');
        if (!confirmed) return;
        try {
            await api.delete(`/api/admin/users/${id}`);
            toast.success('User deleted successfully');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting user');
        }
    };

    const handleToggleBanUser = async (id) => {
        try {
            const res = await api.put(`/api/admin/users/${id}/ban`);
            toast.success(res.data.message);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating user');
        }
    };

    const handleApprovePayment = async (id) => {
        try {
            const res = await api.put(`/api/admin/payments/${id}/approve`);
            toast.success(res.data.message);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error approving payment');
        }
    };

    const handleRejectPayment = async (id) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        try {
            const res = await api.put(`/api/admin/payments/${id}/reject`, { reason });
            toast.success(res.data.message);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error rejecting payment');
        }
    };

    const handleApproveWithdrawal = async (id) => {
        const adminNote = prompt('Enter admin note (optional):');

        try {
            const res = await api.put(`/api/admin/withdrawals/${id}/approve`, { adminNote });
            toast.success(res.data.message);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error approving withdrawal');
        }
    };

    const handleRejectWithdrawal = async (id) => {
        const adminNote = prompt('Enter rejection reason:');
        if (!adminNote) return;

        try {
            const res = await api.put(`/api/admin/withdrawals/${id}/reject`, { adminNote });
            toast.success(res.data.message);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error rejecting withdrawal');
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="skeleton h-96"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Head>
                <title>Admin Dashboard - DevMarket</title>
            </Head>

            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
                    <p className="text-gray-300">Manage platform operations</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Alert for Reported Chats */}
                {activeChatRooms.filter(chat => !chat.admin).length > 0 && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-pulse">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <span className="text-3xl">🚨</span>
                                <div>
                                    <h3 className="text-red-800 font-bold text-lg">
                                        {activeChatRooms.filter(chat => !chat.admin).length} Chat(s) Need Admin Attention!
                                    </h3>
                                    <p className="text-red-600 text-sm">
                                        Users have requested admin help. Click "Reported Chats" tab to view.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveTab('reportedChats')}
                                className="btn btn-danger"
                            >
                                View Reported Chats →
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                    <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 mb-1">Total Products</p>
                                <p className="text-4xl font-bold">{stats?.totalProducts || 0}</p>
                            </div>
                            <FiPackage className="text-5xl text-blue-200" />
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 mb-1">Total Orders</p>
                                <p className="text-4xl font-bold">{stats?.totalOrders || 0}</p>
                            </div>
                            <FiShoppingBag className="text-5xl text-green-200" />
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 mb-1">Platform Earnings</p>
                                <p className="text-4xl font-bold">₹{stats?.platformEarnings || 0}</p>
                            </div>
                            <FiDollarSign className="text-5xl text-purple-200" />
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 mb-1">Developers</p>
                                <p className="text-4xl font-bold">{stats?.totalDevelopers || 0}</p>
                            </div>
                            <FiUsers className="text-5xl text-orange-200" />
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-100 mb-1">Reported Chats</p>
                                <p className="text-4xl font-bold">{activeChatRooms.filter(chat => chat.adminRequested && !chat.admin).length}</p>
                            </div>
                            <div className="text-5xl text-red-200">🚨</div>
                        </div>
                        {activeChatRooms.filter(chat => chat.adminRequested && !chat.admin).length > 0 && (
                            <div className="mt-2 text-sm text-red-100">
                                ⚠️ Needs attention!
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Layout: Sidebar + Content */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Vertical Sidebar Navigation */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-4">
                            <div className="p-4 bg-gradient-to-r from-primary-600 to-primary-700">
                                <h3 className="text-white font-bold text-lg">Admin Menu</h3>
                            </div>
                            <nav className="p-2">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`w-full text-left px-4 py-3 rounded-lg mb-1 font-medium transition-all ${activeTab === 'overview'
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    📊 Overview
                                </button>
                                <button
                                    onClick={() => setActiveTab('pending')}
                                    className={`w-full text-left px-4 py-3 rounded-lg mb-1 font-medium transition-all ${activeTab === 'pending'
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    ⏳ Pending Products ({pendingProducts.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('approved')}
                                    className={`w-full text-left px-4 py-3 rounded-lg mb-1 font-medium transition-all ${activeTab === 'approved'
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    ✅ Approved Products ({approvedProducts.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('developers')}
                                    className={`w-full text-left px-4 py-3 rounded-lg mb-1 font-medium transition-all ${activeTab === 'developers'
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    👨‍💻 Developers
                                </button>
                                <button
                                    onClick={() => setActiveTab('users')}
                                    className={`w-full text-left px-4 py-3 rounded-lg mb-1 font-medium transition-all ${activeTab === 'users'
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    👤 Users ({users.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('payments')}
                                    className={`w-full text-left px-4 py-3 rounded-lg mb-1 font-medium transition-all ${activeTab === 'payments'
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    💳 Pending Payments ({pendingPayments.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('withdrawals')}
                                    className={`w-full text-left px-4 py-3 rounded-lg mb-1 font-medium transition-all ${activeTab === 'withdrawals'
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    💸 Pending Withdrawals ({pendingWithdrawals.length})
                                </button>
                                <Link href="/wallet">
                                    <span className="block px-4 py-3 rounded-lg mb-1 font-medium text-gray-700 hover:bg-gray-100 cursor-pointer transition-all">
                                        💰 Platform Wallet
                                    </span>
                                </Link>
                                <button
                                    onClick={() => setActiveTab('reportedChats')}
                                    className={`w-full text-left px-4 py-3 rounded-lg mb-1 font-medium transition-all ${activeTab === 'reportedChats'
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    🚨 Reported Chats ({activeChatRooms.filter(chat => chat.adminRequested && !chat.admin).length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('chats')}
                                    className={`w-full text-left px-4 py-3 rounded-lg mb-1 font-medium transition-all ${activeTab === 'chats'
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    💬 All Chats ({activeChatRooms.length})
                                </button>
                                {!user?.isSubAdmin && (
                                    <button
                                        onClick={() => setActiveTab('subAdmins')}
                                        className={`w-full text-left px-4 py-3 rounded-lg mb-1 font-medium transition-all ${activeTab === 'subAdmins'
                                            ? 'bg-primary-600 text-white shadow-sm'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        👥 Sub-Admins ({subAdmins.length})
                                    </button>
                                )}
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`w-full text-left px-4 py-3 rounded-lg mb-1 font-medium transition-all ${activeTab === 'settings'
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    ⚙️ Settings
                                </button>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0">

                        {/* Tab Content */}
                        {activeTab === 'overview' && (
                            <div className="card">
                                <h2 className="text-2xl font-bold mb-6">Platform Overview</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="font-semibold text-gray-700 mb-3">Revenue Breakdown</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Total Revenue:</span>
                                                <span className="font-bold">₹{stats?.totalRevenue || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Platform Commission:</span>
                                                <span className="font-bold text-green-600">₹{stats?.platformEarnings || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Developer Earnings:</span>
                                                <span className="font-bold">₹{stats?.developerEarnings || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-700 mb-3">User Statistics</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Total Developers:</span>
                                                <span className="font-bold">{stats?.totalDevelopers || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Total Buyers:</span>
                                                <span className="font-bold">{stats?.totalBuyers || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Pending Products:</span>
                                                <span className="font-bold text-yellow-600">{stats?.pendingProducts || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'pending' && (
                            <div className="card">
                                <h2 className="text-2xl font-bold mb-6">Pending Product Approvals</h2>
                                {pendingProducts.length > 0 ? (
                                    <div className="space-y-6">
                                        {pendingProducts.map((product) => (
                                            <div key={product._id} className="border border-gray-200 rounded-lg p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-900 mb-1">{product.name}</h3>
                                                        <p className="text-sm text-gray-600">
                                                            by {product.developer?.name} ({product.developer?.email})
                                                        </p>
                                                        <span className="badge badge-info mt-2">{product.category}</span>
                                                    </div>
                                                    <div className="text-2xl font-bold text-primary-600">₹{product.price}</div>
                                                </div>

                                                <div className="space-y-3 mb-4">
                                                    <div>
                                                        <p className="text-sm font-semibold text-red-600">❌ Problem:</p>
                                                        <p className="text-gray-700">{product.problemSolved}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-green-600">✅ Solution:</p>
                                                        <p className="text-gray-700">{product.solution}</p>
                                                    </div>
                                                </div>

                                                <div className="flex space-x-4">
                                                    <button
                                                        onClick={() => handleApproveProduct(product._id)}
                                                        className="btn btn-success flex items-center space-x-2"
                                                    >
                                                        <FiCheck />
                                                        <span>Approve</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectProduct(product._id)}
                                                        className="btn btn-danger flex items-center space-x-2"
                                                    >
                                                        <FiX />
                                                        <span>Reject</span>
                                                    </button>
                                                    <Link
                                                        href={`/products/${product._id}`}
                                                        className="btn btn-secondary"
                                                    >
                                                        View Details
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-600 text-center py-8">No pending products</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'approved' && (
                            <div className="card">
                                <h2 className="text-2xl font-bold mb-6">Approved Products</h2>
                                {approvedProducts.length > 0 ? (
                                    <div className="space-y-4">
                                        {approvedProducts.map((product) => (
                                            <div key={product._id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
                                                        <p className="text-xs text-gray-600">
                                                            by {product.developer?.name}
                                                        </p>
                                                        <div className="mt-1">
                                                            <span className="badge badge-success text-xs">Approved</span>
                                                            <span className="badge badge-info ml-2 text-xs">{product.category}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-xl font-bold text-primary-600">₹{product.price}</div>
                                                </div>

                                                <div className="space-y-2 mb-3 text-sm">
                                                    <div className="flex space-x-4 text-gray-600">
                                                        <span>Sales: {product.sales}</span>
                                                        <span>•</span>
                                                        <span>Created: {new Date(product.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>

                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleRemoveProduct(product._id)}
                                                        className="btn btn-secondary btn-sm flex items-center space-x-1"
                                                    >
                                                        <FiX />
                                                        <span>Remove</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product._id)}
                                                        className="btn btn-danger btn-sm flex items-center space-x-1"
                                                    >
                                                        <FiX />
                                                        <span>Delete</span>
                                                    </button>
                                                    <Link
                                                        href={`/products/${product._id}`}
                                                        className="btn btn-secondary btn-sm"
                                                    >
                                                        View
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-600 text-center py-8">No approved products</p>
                                )}
                            </div>
                        )}
                        {activeTab === 'developers' && (
                            <div className="card">
                                <h2 className="text-2xl font-bold mb-6">Manage Developers</h2>
                                {developers.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Verified</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Joined</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {developers.map((dev) => (
                                                    <tr key={dev._id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm">{dev.name}</td>
                                                        <td className="px-4 py-3 text-sm">{dev.email}</td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <span className={`badge ${dev.isVerified ? 'badge-success' : 'badge-warning'}`}>
                                                                {dev.isVerified ? 'Verified' : 'Not Verified'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            {new Date(dev.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <div className="flex space-x-3">
                                                                {dev.isVerified ? (
                                                                    <button
                                                                        onClick={() => handleVerifyDeveloper(dev._id, false)}
                                                                        className="text-red-600 hover:text-red-700 font-semibold"
                                                                    >
                                                                        Unverify
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleVerifyDeveloper(dev._id, true)}
                                                                        className="text-green-600 hover:text-green-700 font-semibold"
                                                                    >
                                                                        Verify
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleToggleBanUser(dev._id)}
                                                                    className={`font-semibold ${dev.isBanned ? 'text-green-600 hover:text-green-700' : 'text-orange-600 hover:text-orange-700'}`}
                                                                >
                                                                    {dev.isBanned ? '✅ Unban' : '🚫 Ban'}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteUser(dev._id)}
                                                                    className="text-red-600 hover:text-red-700 font-semibold"
                                                                >
                                                                    🗑️ Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-600 text-center py-8">No developers found</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'reportedChats' && (
                            <div className="card">
                                <h2 className="text-2xl font-bold mb-6">🚨 Reported Chats (Admin Requested)</h2>
                                <p className="text-gray-600 mb-4">
                                    These chats have requested admin assistance. Click "Join Chat" to help resolve issues.
                                </p>
                                {activeChatRooms.filter(chat => chat.adminRequested && !chat.admin).length > 0 ? (
                                    <div className="space-y-4">
                                        {activeChatRooms.filter(chat => chat.adminRequested && !chat.admin).map((chat) => (
                                            <div key={chat._id} className="border-2 border-yellow-300 bg-yellow-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <span className="text-2xl">⚠️</span>
                                                            <h3 className="font-bold text-gray-900">
                                                                {chat.product?.name || 'Product Deleted'}
                                                            </h3>
                                                            <span className="badge badge-warning">Admin Requested</span>
                                                        </div>
                                                        <div className="text-sm text-gray-600 space-y-1 ml-8">
                                                            <p>
                                                                <span className="font-semibold">Buyer:</span> {chat.buyer?.name || 'N/A'} ({chat.buyer?.email || 'N/A'})
                                                            </p>
                                                            <p>
                                                                <span className="font-semibold">Seller:</span> {chat.seller?.name || 'N/A'} ({chat.seller?.email || 'N/A'})
                                                            </p>
                                                            {chat.lastMessage && (
                                                                <p className="text-gray-500 italic truncate">
                                                                    Last: {chat.lastMessage}
                                                                </p>
                                                            )}
                                                            <p className="text-xs text-gray-400">
                                                                Last activity: {new Date(chat.lastMessageAt).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right space-y-2">
                                                        <div>
                                                            <span className={`badge ${chat.isPurchased ? 'badge-success' : 'badge-warning'}`}>
                                                                {chat.isPurchased ? 'Purchased' : 'Not Purchased'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className={`badge ${chat.status === 'resolved' ? 'badge-info' : 'badge-warning'}`}>
                                                                {chat.status}
                                                            </span>
                                                        </div>
                                                        <Link
                                                            href={`/chat/${chat._id}`}
                                                            className="btn btn-primary btn-sm block"
                                                        >
                                                            🚀 Join Chat Now
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-green-50 rounded-lg border border-green-200">
                                        <p className="text-green-700 text-lg">✅ No reported chats! All clear.</p>
                                        <p className="text-green-600 text-sm mt-2">Users will appear here when they request admin help.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'chats' && (
                            <div className="card">
                                <h2 className="text-2xl font-bold mb-6">Active Chat Rooms</h2>
                                {activeChatRooms.length > 0 ? (
                                    <div className="space-y-4">
                                        {activeChatRooms.map((chat) => (
                                            <div key={chat._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-gray-900 mb-1">
                                                            {chat.product?.name || 'Product Deleted'}
                                                        </h3>
                                                        <div className="text-sm text-gray-600 space-y-1">
                                                            <p>
                                                                <span className="font-semibold">Buyer:</span> {chat.buyer?.name || 'N/A'} ({chat.buyer?.email || 'N/A'})
                                                            </p>
                                                            <p>
                                                                <span className="font-semibold">Seller:</span> {chat.seller?.name || 'N/A'} ({chat.seller?.email || 'N/A'})
                                                            </p>
                                                            {chat.admin && (
                                                                <p className="text-yellow-600">
                                                                    <span className="font-semibold">Admin:</span> {chat.admin?.name || 'Admin'}
                                                                </p>
                                                            )}
                                                            {chat.lastMessage && (
                                                                <p className="text-gray-500 italic truncate">
                                                                    Last: {chat.lastMessage}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right space-y-2">
                                                        <div>
                                                            <span className={`badge ${chat.isPurchased ? 'badge-success' : 'badge-warning'}`}>
                                                                {chat.isPurchased ? 'Purchased' : 'Not Purchased'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className={`badge ${chat.status === 'resolved' ? 'badge-info' : 'badge-warning'}`}>
                                                                {chat.status}
                                                            </span>
                                                        </div>
                                                        <Link
                                                            href={`/chat/${chat._id}`}
                                                            className="btn btn-primary btn-sm block"
                                                        >
                                                            {chat.admin ? 'View Chat' : 'Join Chat'}
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-600 text-center py-8">No active chats</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="card">
                                <h2 className="text-2xl font-bold mb-6">👤 User Management</h2>
                                {users.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Joined</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {users.map((usr) => (
                                                    <tr key={usr._id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{usr.name}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{usr.email}</td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <span className={`badge ${usr.isBanned ? 'badge-danger' : 'badge-success'}`}>
                                                                {usr.isBanned ? 'Banned' : 'Active'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">
                                                            {new Date(usr.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <div className="flex space-x-3">
                                                                <button
                                                                    onClick={() => handleToggleBanUser(usr._id)}
                                                                    className={`font-semibold ${usr.isBanned ? 'text-green-600 hover:text-green-700' : 'text-orange-600 hover:text-orange-700'}`}
                                                                >
                                                                    {usr.isBanned ? '✅ Unban' : '🚫 Ban'}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteUser(usr._id)}
                                                                    className="text-red-600 hover:text-red-700 font-semibold"
                                                                >
                                                                    🗑️ Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-600 text-center py-8">No users found</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'subAdmins' && !user?.isSubAdmin && (
                            <div className="card">
                                <h2 className="text-2xl font-bold mb-6">👥 Sub-Admin Management</h2>

                                {/* Create Sub-Admin Form */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8 border border-blue-200">
                                    <h3 className="text-lg font-bold mb-4 text-gray-800">➕ Create New Sub-Admin</h3>
                                    <form onSubmit={handleCreateSubAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="label">Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={newSubAdmin.name}
                                                onChange={(e) => setNewSubAdmin({ ...newSubAdmin, name: e.target.value })}
                                                className="input"
                                                placeholder="Enter name"
                                                autoComplete="off"
                                            />
                                        </div>
                                        <div>
                                            <label className="label">Email</label>
                                            <input
                                                type="email"
                                                required
                                                value={newSubAdmin.email}
                                                onChange={(e) => setNewSubAdmin({ ...newSubAdmin, email: e.target.value })}
                                                className="input"
                                                placeholder="Enter email"
                                                autoComplete="new-email"
                                            />
                                        </div>
                                        <div>
                                            <label className="label">Password</label>
                                            <input
                                                type="password"
                                                required
                                                value={newSubAdmin.password}
                                                onChange={(e) => setNewSubAdmin({ ...newSubAdmin, password: e.target.value })}
                                                className="input"
                                                placeholder="Enter password"
                                                autoComplete="new-password"
                                            />
                                        </div>
                                        <div className="md:col-span-3">
                                            <button type="submit" className="btn btn-primary">
                                                ➕ Create Sub-Admin
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Sub-Admins List */}
                                <h3 className="text-lg font-bold mb-4">📋 Existing Sub-Admins</h3>
                                {subAdmins.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Created By</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Created At</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {subAdmins.map((admin) => (
                                                    <tr key={admin._id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{admin.name}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{admin.email}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">
                                                            {admin.createdBy?.name || 'N/A'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">
                                                            {new Date(admin.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <button
                                                                onClick={() => handleDeleteSubAdmin(admin._id)}
                                                                className="text-red-600 hover:text-red-700 font-semibold"
                                                            >
                                                                🗑️ Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                                        <p className="text-gray-600">No sub-admins created yet</p>
                                        <p className="text-sm text-gray-500 mt-2">Create your first sub-admin using the form above</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'payments' && (
                            <div className="card">
                                <h2 className="text-2xl font-bold mb-6">💳 Pending Payment Approvals</h2>
                                {pendingPayments.length > 0 ? (
                                    <div className="space-y-4">
                                        {pendingPayments.map((payment) => (
                                            <div key={payment._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900">
                                                            {payment.user?.name || 'Unknown User'}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            {payment.user?.email}
                                                        </p>
                                                        <div className="mt-2 space-x-2">
                                                            <span className="badge badge-warning">Pending</span>
                                                            <span className="badge badge-info">{payment.paymentType === 'crypto' ? 'Crypto' : 'UPI'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold text-primary-600">₹{payment.amount}</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {new Date(payment.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                                                    {payment.paymentType === 'crypto' ? (
                                                        <>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600">Coin:</span>
                                                                <span className="font-semibold">{payment.cryptoCoin}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600">Network:</span>
                                                                <span className="font-semibold">{payment.cryptoNetwork}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600">TX Hash:</span>
                                                                <span className="font-mono text-xs break-all">{payment.transactionHash}</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600">UPI ID:</span>
                                                                <span className="font-semibold">{payment.upiId}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600">UTR Number:</span>
                                                                <span className="font-semibold">{payment.utrNumber}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                <div className="flex space-x-4">
                                                    <button
                                                        onClick={() => handleApprovePayment(payment._id)}
                                                        className="btn btn-success flex items-center space-x-2"
                                                    >
                                                        <FiCheck />
                                                        <span>Approve & Credit ₹{payment.amount}</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectPayment(payment._id)}
                                                        className="btn btn-danger flex items-center space-x-2"
                                                    >
                                                        <FiX />
                                                        <span>Reject</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                                        <p className="text-gray-600 text-lg">✅ No pending payment requests</p>
                                        <p className="text-sm text-gray-500 mt-2">All payments have been processed</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'withdrawals' && (
                            <div className="card">
                                <h2 className="text-2xl font-bold mb-6">💸 Pending Withdrawal Approvals</h2>
                                {pendingWithdrawals.length > 0 ? (
                                    <div className="space-y-4">
                                        {pendingWithdrawals.map((withdrawal) => (
                                            <div key={withdrawal._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900">
                                                            {withdrawal.user?.name || 'Unknown User'}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            {withdrawal.user?.email}
                                                        </p>
                                                        <div className="mt-2 space-x-2">
                                                            <span className="badge badge-warning">Pending</span>
                                                            <span className="badge badge-info">{withdrawal.withdrawalType === 'crypto' ? 'Crypto' : 'UPI'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold text-red-600">-₹{withdrawal.amount}</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {new Date(withdrawal.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                                                    {withdrawal.withdrawalType === 'crypto' ? (
                                                        <>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600">Coin:</span>
                                                                <span className="font-semibold">{withdrawal.cryptoCoinType}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600">Network:</span>
                                                                <span className="font-semibold">{withdrawal.cryptoNetwork}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600">Wallet Address:</span>
                                                                <span className="font-mono text-xs break-all">{withdrawal.cryptoAddress}</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600">UPI ID:</span>
                                                                <span className="font-semibold">{withdrawal.upiId}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                <div className="flex space-x-4">
                                                    <button
                                                        onClick={() => handleApproveWithdrawal(withdrawal._id)}
                                                        className="btn btn-success flex items-center space-x-2"
                                                    >
                                                        <FiCheck />
                                                        <span>Approve & Debit ₹{withdrawal.amount}</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectWithdrawal(withdrawal._id)}
                                                        className="btn btn-danger flex items-center space-x-2"
                                                    >
                                                        <FiX />
                                                        <span>Reject</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                                        <p className="text-gray-600 text-lg">✅ No pending withdrawal requests</p>
                                        <p className="text-sm text-gray-500 mt-2">All withdrawals have been processed</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-8">
                                {/* Platform Commission Settings */}
                                <div className="card">
                                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                                        <FiSettings className="mr-2" />
                                        Platform Settings
                                    </h2>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                        <p className="text-sm text-blue-800">
                                            <strong>ℹ️ Info:</strong> The platform commission rate is applied to all successful sales and determines how much the platform earns from each transaction.
                                        </p>
                                    </div>

                                    <form onSubmit={handleUpdateSettings} className="max-w-md">
                                        <div className="mb-6">
                                            <label className="label">Platform Commission (%)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    value={settings.platformCommission}
                                                    onChange={(e) => setSettings({ ...settings, platformCommission: Number(e.target.value) })}
                                                    className="input pr-12"
                                                    required
                                                />
                                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                                                    %
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-2">
                                                Current commission rate applied to all sales (0-100%)
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                            <h3 className="font-semibold text-gray-700 mb-2">Preview Example:</h3>
                                            <div className="text-sm text-gray-600 space-y-1">
                                                <p>• Sale Amount: ₹1000</p>
                                                <p>• Platform Commission ({settings.platformCommission}%): ₹{((1000 * settings.platformCommission) / 100).toFixed(2)}</p>
                                                <p>• Developer Earnings: ₹{(1000 - (1000 * settings.platformCommission) / 100).toFixed(2)}</p>
                                            </div>
                                        </div>

                                        <button type="submit" className="btn btn-primary">
                                            💾 Update Settings
                                        </button>
                                    </form>
                                </div>

                                {/* Payment System Settings */}
                                <div className="card">
                                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                                        💳 Payment System
                                    </h2>

                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                        <p className="text-sm text-yellow-800">
                                            <strong>⚠️ Important:</strong> Manage platform payment options. Users will see these addresses when adding funds to their wallet.
                                        </p>
                                    </div>

                                    {/* Crypto Addresses */}
                                    <div className="mb-8">
                                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                                            🪙 Crypto Addresses
                                        </h3>

                                        <div className="mb-4">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Enter crypto address (e.g., Bitcoin, Ethereum)"
                                                    className="input flex-1"
                                                    id="cryptoAddressInput"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        const input = document.getElementById('cryptoAddressInput');
                                                        const address = input.value.trim();
                                                        if (!address) {
                                                            toast.error('Please enter a crypto address');
                                                            return;
                                                        }
                                                        try {
                                                            const response = await api.post('/admin/settings/crypto-address', { address });
                                                            if (response.data.success) {
                                                                toast.success('Crypto address added!');
                                                                setSettings(response.data.settings);
                                                                input.value = '';
                                                            }
                                                        } catch (error) {
                                                            toast.error(error.response?.data?.message || 'Failed to add address');
                                                        }
                                                    }}
                                                    className="btn btn-primary whitespace-nowrap"
                                                >
                                                    + Add
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {settings.cryptoAddresses && settings.cryptoAddresses.length > 0 ? (
                                                settings.cryptoAddresses.map((address, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                        <span className="text-sm font-mono text-gray-700 break-all">{address}</span>
                                                        <button
                                                            type="button"
                                                            onClick={async () => {
                                                                if (!confirm('Remove this crypto address?')) return;
                                                                try {
                                                                    const response = await api.delete('/admin/settings/crypto-address', { data: { address } });
                                                                    if (response.data.success) {
                                                                        toast.success('Crypto address removed!');
                                                                        setSettings(response.data.settings);
                                                                    }
                                                                } catch (error) {
                                                                    toast.error(error.response?.data?.message || 'Failed to remove address');
                                                                }
                                                            }}
                                                            className="btn btn-sm bg-red-500 hover:bg-red-600 text-white ml-3 flex-shrink-0"
                                                        >
                                                            🗑️ Remove
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 text-sm italic">No crypto addresses added yet</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* UPI IDs */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                                            📱 UPI IDs
                                        </h3>

                                        <div className="mb-4">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Enter UPI ID (e.g., username@paytm)"
                                                    className="input flex-1"
                                                    id="upiIdInput"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        const input = document.getElementById('upiIdInput');
                                                        const upiId = input.value.trim();
                                                        if (!upiId) {
                                                            toast.error('Please enter a UPI ID');
                                                            return;
                                                        }
                                                        try {
                                                            const response = await api.post('/admin/settings/upi-id', { upiId });
                                                            if (response.data.success) {
                                                                toast.success('UPI ID added!');
                                                                setSettings(response.data.settings);
                                                                input.value = '';
                                                            }
                                                        } catch (error) {
                                                            toast.error(error.response?.data?.message || 'Failed to add UPI ID');
                                                        }
                                                    }}
                                                    className="btn btn-primary whitespace-nowrap"
                                                >
                                                    + Add
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {settings.upiIds && settings.upiIds.length > 0 ? (
                                                settings.upiIds.map((upiId, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                        <span className="text-sm font-mono text-gray-700">{upiId}</span>
                                                        <button
                                                            type="button"
                                                            onClick={async () => {
                                                                if (!confirm('Remove this UPI ID?')) return;
                                                                try {
                                                                    const response = await api.delete('/admin/settings/upi-id', { data: { upiId } });
                                                                    if (response.data.success) {
                                                                        toast.success('UPI ID removed!');
                                                                        setSettings(response.data.settings);
                                                                    }
                                                                } catch (error) {
                                                                    toast.error(error.response?.data?.message || 'Failed to remove UPI ID');
                                                                }
                                                            }}
                                                            className="btn btn-sm bg-red-500 hover:bg-red-600 text-white ml-3 flex-shrink-0"
                                                        >
                                                            🗑️ Remove
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 text-sm italic">No UPI IDs added yet</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                    {/* End Main Content Area */}
                </div>
                {/* End Flex Container */}
            </div>
        </AdminLayout>
    );
}
