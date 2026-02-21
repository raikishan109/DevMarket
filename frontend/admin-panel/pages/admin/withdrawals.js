import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';
import { getUser } from '../../utils/auth';

export default function AdminWithdrawals() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const currentUser = getUser();
        if (!currentUser || currentUser.role !== 'admin') {
            router.push('/admin-login');
            return;
        }
        setUser(currentUser);
        fetchWithdrawals();
    }, [filter]);

    const fetchWithdrawals = async () => {
        try {
            const endpoint = filter === 'pending' ? '/admin/withdrawals/pending' : '/admin/withdrawals';
            const response = await api.get(endpoint);
            if (response.data.success) {
                setWithdrawals(response.data.withdrawals);
            }
        } catch (error) {
            console.error('Error fetching withdrawals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (withdrawalId) => {
        if (!confirm('Are you sure you want to approve this withdrawal?')) return;

        setProcessing(true);
        try {
            const response = await api.put(`/admin/withdrawals/${withdrawalId}/approve`, {});
            if (response.data.success) {
                alert('Withdrawal approved successfully');
                fetchWithdrawals();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error approving withdrawal');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async (withdrawalId) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        setProcessing(true);
        try {
            const response = await api.put(`/admin/withdrawals/${withdrawalId}/reject`, { adminNote: reason });
            if (response.data.success) {
                alert('Withdrawal rejected');
                fetchWithdrawals();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error rejecting withdrawal');
        } finally {
            setProcessing(false);
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
                <title>Withdrawal Management - Admin Panel</title>
            </Head>

            <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold mb-2">Withdrawal Management</h1>
                    <p className="text-red-100">Review and approve user withdrawals</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-6 flex gap-4">
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-6 py-3 rounded-lg font-semibold transition ${filter === 'pending'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-6 py-3 rounded-lg font-semibold transition ${filter === 'all'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        All Withdrawals
                    </button>
                </div>

                <div className="card">
                    {withdrawals.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No withdrawals found</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {withdrawals.map((withdrawal) => (
                                        <tr key={withdrawal._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{withdrawal.user?.name}</div>
                                                <div className="text-sm text-gray-500">{withdrawal.user?.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">₹{withdrawal.amount?.toLocaleString()}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${withdrawal.withdrawalType === 'crypto'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {withdrawal.withdrawalType?.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {withdrawal.withdrawalType === 'crypto' ? (
                                                    <div className="text-sm">
                                                        <div>Coin: {withdrawal.cryptoCoin}</div>
                                                        <div>Network: {withdrawal.cryptoNetwork}</div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="truncate max-w-xs">Address: {withdrawal.walletAddress}</span>
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(withdrawal.walletAddress);
                                                                    alert('Wallet address copied!');
                                                                }}
                                                                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                                                            >
                                                                Copy
                                                            </button>
                                                        </div>
                                                        <div className="mt-1 text-blue-700 font-semibold">
                                                            Crypto: {(withdrawal.amount / 88).toFixed(2)} {withdrawal.cryptoCoin}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-sm">
                                                        <div>UPI: {withdrawal.upiId}</div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${withdrawal.status === 'completed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : withdrawal.status === 'failed'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {withdrawal.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(withdrawal.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {withdrawal.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleApprove(withdrawal._id)}
                                                            disabled={processing}
                                                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(withdrawal._id)}
                                                            disabled={processing}
                                                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
