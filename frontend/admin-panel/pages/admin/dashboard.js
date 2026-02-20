import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';
import { getUser } from '../../utils/auth';
import { useToast } from '../../contexts/ToastContext';
import { FiPackage, FiUsers, FiDollarSign, FiShoppingBag, FiCheck, FiX, FiSettings, FiRefreshCw, FiDatabase } from 'react-icons/fi';

// ========= DATABASE TAB COMPONENT =========
function DatabaseTab({ api, toast }) {
    const [dbData, setDbData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeCollection, setActiveCollection] = useState('users');

    const fetchDB = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/admin/database-stats');
            if (res.data.success) setDbData(res.data.collections);
        } catch (e) {
            toast.error('Failed to load database');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDB(); }, []);

    const collections = dbData ? Object.entries(dbData) : [];

    const handleReset = async () => {
        const c1 = window.confirm('⚠️ WARNING: This will delete ALL data. Admin account will be recreated. Are you sure?');
        if (!c1) return;
        const c2 = window.confirm('🔴 FINAL WARNING: This cannot be undone. Press OK to confirm.');
        if (!c2) return;
        try {
            const res = await api.delete('/api/admin/reset-database');
            if (res.data.success) {
                toast.success('✅ Database reset! Redirecting to login...');
                setTimeout(() => window.location.href = '/admin-login', 2000);
            }
        } catch (e) {
            toast.error(e.response?.data?.message || 'Reset failed');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading database...</div>;

    const currentData = dbData?.[activeCollection]?.data || [];

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <FiDatabase className="text-gray-600" /> MongoDB Database
                </h2>
                <div className="flex gap-3">
                    <button onClick={fetchDB} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-colors">
                        <FiRefreshCw size={14} /> Refresh
                    </button>
                    <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors">
                        🗑️ Reset DB
                    </button>
                </div>
            </div>

            {/* Collection Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                {collections.map(([name, col]) => (
                    <button
                        key={name}
                        onClick={() => setActiveCollection(name)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${activeCollection === name ? 'border-gray-800 bg-gray-800 text-white' : 'border-gray-200 bg-white hover:border-gray-400'}`}
                    >
                        <div className="text-2xl font-bold">{col.count}</div>
                        <div className="text-xs font-medium capitalize mt-1 opacity-80">{name}</div>
                    </button>
                ))}
            </div>

            {/* Collection Data Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-bold text-gray-700 capitalize">
                        Collection: <span className="text-gray-900">{activeCollection}</span>
                        <span className="ml-2 text-sm font-normal text-gray-500">({dbData?.[activeCollection]?.count || 0} records)</span>
                    </h3>
                </div>

                {currentData.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No records in this collection</div>
                ) : (
                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    {Object.keys(currentData[0]).map(key => (
                                        <th key={key} className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase border-b border-gray-200">{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentData.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        {Object.values(row).map((val, j) => (
                                            <td key={j} className="px-4 py-2 text-gray-700 max-w-xs truncate">
                                                {val instanceof Object ? JSON.stringify(val) : String(val ?? '-')}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

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
    const [allPayments, setAllPayments] = useState([]);
    const [allWithdrawals, setAllWithdrawals] = useState([]);
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

    // Sync activeTab from URL query param
    useEffect(() => {
        if (router.query.tab) {
            setActiveTab(router.query.tab);
        } else if (router.isReady) {
            setActiveTab('overview');
        }
    }, [router.query.tab, router.isReady]);

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
                api.get('/api/admin/withdrawals/pending'),
                api.get('/api/admin/payments'),
                api.get('/api/admin/withdrawals')
            ];

            // Only fetch sub-admins if user is main admin
            if (currentUser && !currentUser.isSubAdmin) {
                promises.push(api.get('/api/admin/sub-admins'));
            }

            const results = await Promise.all(promises);
            const [statsRes, pendingRes, approvedRes, devsRes, settingsRes, chatsRes, usersRes, paymentsRes, withdrawalsRes, allPaymentsRes, allWithdrawalsRes, subAdminsRes] = results;

            if (statsRes.data.success) setStats(statsRes.data.stats);
            if (pendingRes.data.success) setPendingProducts(pendingRes.data.products);
            if (approvedRes.data.success) setApprovedProducts(approvedRes.data.products);
            if (devsRes.data.success) setDevelopers(devsRes.data.developers);
            if (settingsRes.data.success) setSettings(settingsRes.data.settings);
            if (chatsRes.data.success) setActiveChatRooms(chatsRes.data.chatRooms);
            if (usersRes.data.success) setUsers(usersRes.data.users);
            if (paymentsRes.data.success) setPendingPayments(paymentsRes.data.payments);
            if (withdrawalsRes.data.success) setPendingWithdrawals(withdrawalsRes.data.withdrawals);
            if (allPaymentsRes.data.success) setAllPayments(allPaymentsRes.data.payments);
            if (allWithdrawalsRes.data.success) setAllWithdrawals(allWithdrawalsRes.data.withdrawals);
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
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-4 border-gray-600 border-t-red-500 rounded-full animate-spin"></div>
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
                {activeChatRooms.filter(chat => chat.adminRequested && !chat.admin).length > 0 && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-pulse">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <span className="text-3xl">🚨</span>
                                <div>
                                    <h3 className="text-red-800 font-bold text-lg">
                                        {activeChatRooms.filter(chat => chat.adminRequested && !chat.admin).length} Chat(s) Need Admin Attention!
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

                {/* Main Content Area */}
                <div className="w-full">
                    <main className="w-full">

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
                            <div className="space-y-6">
                                {/* Pending Payments */}
                                <div className="card">
                                    <h2 className="text-2xl font-bold mb-6">💳 Pending Payment Approvals</h2>
                                    {pendingPayments.length > 0 ? (
                                        <div className="space-y-4">
                                            {pendingPayments.map((payment) => (
                                                <div key={payment._id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-6 hover:shadow-md transition-shadow">
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

                                                    <div className="bg-white rounded-lg p-4 mb-4 space-y-2">
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
                                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                                            <p className="text-gray-600">✅ No pending payment requests</p>
                                        </div>
                                    )}
                                </div>

                                {/* Payment History */}
                                <div className="card">
                                    <h2 className="text-xl font-bold mb-4">📜 Payment History (Recent {allPayments.length > 20 ? '20' : allPayments.length})</h2>
                                    {allPayments.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {allPayments.slice(0, 20).map((payment) => (
                                                        <tr key={payment._id}>
                                                            <td className="px-4 py-3 text-sm">{payment.user?.name}</td>
                                                            <td className="px-4 py-3 text-sm font-semibold">₹{payment.amount}</td>
                                                            <td className="px-4 py-3 text-sm">{payment.paymentType === 'crypto' ? 'Crypto' : 'UPI'}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`badge ${payment.status === 'approved' ? 'badge-success' :
                                                                    payment.status === 'rejected' ? 'badge-danger' :
                                                                        'badge-warning'
                                                                    }`}>
                                                                    {payment.status === 'approved' ? '✓ Approved' :
                                                                        payment.status === 'rejected' ? '✗ Rejected' :
                                                                            '⏳ Pending'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                                {new Date(payment.createdAt).toLocaleDateString()}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-center py-8 text-gray-500">No payment history yet</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'withdrawals' && (
                            <div className="space-y-6">
                                {/* Pending Withdrawals */}
                                <div className="card">
                                    <h2 className="text-2xl font-bold mb-6">💸 Pending Withdrawal Approvals</h2>
                                    {pendingWithdrawals.length > 0 ? (
                                        <div className="space-y-4">
                                            {pendingWithdrawals.map((withdrawal) => (
                                                <div key={withdrawal._id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-6 hover:shadow-md transition-shadow">
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

                                                    <div className="bg-white rounded-lg p-4 mb-4 space-y-2">
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
                                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                                            <p className="text-gray-600">✅ No pending withdrawal requests</p>
                                        </div>
                                    )}
                                </div>

                                {/* Withdrawal History */}
                                <div className="card">
                                    <h2 className="text-xl font-bold mb-4">📜 Withdrawal History (Recent {allWithdrawals.length > 20 ? '20' : allWithdrawals.length})</h2>
                                    {allWithdrawals.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {allWithdrawals.slice(0, 20).map((withdrawal) => (
                                                        <tr key={withdrawal._id}>
                                                            <td className="px-4 py-3 text-sm">{withdrawal.user?.name}</td>
                                                            <td className="px-4 py-3 text-sm font-semibold text-red-600">-₹{withdrawal.amount}</td>
                                                            <td className="px-4 py-3 text-sm">{withdrawal.withdrawalType === 'crypto' ? 'Crypto' : 'UPI'}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`badge ${withdrawal.status === 'completed' ? 'badge-success' :
                                                                    withdrawal.status === 'failed' ? 'badge-danger' :
                                                                        'badge-warning'
                                                                    }`}>
                                                                    {withdrawal.status === 'completed' ? '✓ Approved' :
                                                                        withdrawal.status === 'failed' ? '✗ Rejected' :
                                                                            '⏳ Pending'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                                {new Date(withdrawal.createdAt).toLocaleDateString()}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-center py-8 text-gray-500">No withdrawal history yet</p>
                                    )}
                                </div>
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

                                    {/* ===== DATABASE RESET ===== */}
                                    {!user?.isSubAdmin && (
                                        <div className="mt-8 border-2 border-red-200 rounded-xl p-6 bg-red-50">
                                            <h3 className="text-lg font-bold text-red-700 mb-2 flex items-center gap-2">
                                                ⚠️ Danger Zone — Database Reset
                                            </h3>
                                            <p className="text-sm text-red-600 mb-4">
                                                This will permanently delete <strong>all users, products, orders, payments, chats, reviews</strong> and all other data.<br />
                                                <strong>Main admin account will NOT be deleted.</strong>
                                            </p>
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    const confirm1 = window.confirm('⚠️ WARNING: This will delete ALL data except your admin account. Are you sure?');
                                                    if (!confirm1) return;
                                                    const confirm2 = window.confirm('🔴 FINAL WARNING: This action CANNOT be undone. Type OK to confirm.');
                                                    if (!confirm2) return;
                                                    try {
                                                        const res = await api.delete('/api/admin/reset-database');
                                                        if (res.data.success) {
                                                            toast.success('✅ Database reset successfully! Admin account preserved.');
                                                            fetchData();
                                                        }
                                                    } catch (error) {
                                                        toast.error(error.response?.data?.message || 'Failed to reset database');
                                                    }
                                                }}
                                                className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
                                            >
                                                🗑️ Reset Entire Database
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ===== DATABASE TAB ===== */}
                        {activeTab === 'database' && !user?.isSubAdmin && (
                            <DatabaseTab api={api} toast={toast} />
                        )}
                    </main>
                </div>
            </div>
        </AdminLayout>
    );
}
