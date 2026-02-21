import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';
import { getUser } from '../../utils/auth';

export default function AdminPayments() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [processing, setProcessing] = useState(false);
    const [adminNote, setAdminNote] = useState('');
    const [selectedPayment, setSelectedPayment] = useState(null);

    useEffect(() => {
        const currentUser = getUser();
        if (!currentUser || currentUser.role !== 'admin') {
            router.push('/admin-login');
            return;
        }
        setUser(currentUser);
        fetchPayments();
    }, [filter]);

    const fetchPayments = async () => {
        try {
            const endpoint = filter === 'pending' ? '/admin/payments/pending' : '/admin/payments';
            const response = await api.get(endpoint);
            if (response.data.success) {
                setPayments(response.data.payments);
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (paymentId) => {
        if (!confirm('Are you sure you want to approve this payment?')) return;

        setProcessing(true);
        try {
            const response = await api.put(`/admin/payments/${paymentId}/approve`, { adminNote });
            if (response.data.success) {
                alert('Payment approved successfully');
                setAdminNote('');
                setSelectedPayment(null);
                fetchPayments();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error approving payment');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async (paymentId) => {
        if (!confirm('Are you sure you want to reject this payment?')) return;

        setProcessing(true);
        try {
            const response = await api.put(`/admin/payments/${paymentId}/reject`, { adminNote });
            if (response.data.success) {
                alert('Payment rejected');
                setAdminNote('');
                setSelectedPayment(null);
                fetchPayments();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error rejecting payment');
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
                <title>Payment Management - Admin Panel</title>
            </Head>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold mb-2">Payment Management</h1>
                    <p className="text-blue-100">Review and approve user payments</p>
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
                        All Payments
                    </button>
                </div>

                <div className="card">
                    {payments.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No payments found</p>
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
                                    {payments.map((payment) => (
                                        <tr key={payment._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{payment.user?.name}</div>
                                                <div className="text-sm text-gray-500">{payment.user?.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">₹{payment.amount?.toLocaleString()}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${payment.paymentType === 'crypto'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {payment.paymentType?.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {payment.paymentType === 'crypto' ? (
                                                    <div className="text-sm">
                                                        <div>Coin: {payment.cryptoCoin}</div>
                                                        <div>Network: {payment.cryptoNetwork}</div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="truncate max-w-xs">Hash: {payment.transactionHash}</span>
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(payment.transactionHash);
                                                                    alert('Transaction hash copied!');
                                                                }}
                                                                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                                                            >
                                                                Copy
                                                            </button>
                                                        </div>
                                                        <div className="mt-1 text-green-700 font-semibold">
                                                            Crypto: {(payment.amount / 88).toFixed(2)} {payment.cryptoCoin}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-sm">
                                                        <div>UPI: {payment.upiId}</div>
                                                        <div>UTR: {payment.utrNumber}</div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${payment.status === 'approved'
                                                    ? 'bg-green-100 text-green-800'
                                                    : payment.status === 'failed'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(payment.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {payment.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleApprove(payment._id)}
                                                            disabled={processing}
                                                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(payment._id)}
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
