import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';
import { getUser } from '../../utils/auth';
import { FiDollarSign, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

export default function PlatformWallet() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [walletData, setWalletData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = getUser();
        if (!currentUser || currentUser.role !== 'admin') {
            router.push('/admin-login');
            return;
        }
        setUser(currentUser);
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            const [walletRes, transactionsRes] = await Promise.all([
                api.get('/admin/platform-wallet'),
                api.get('/admin/platform-wallet/transactions')
            ]);

            if (walletRes.data.success) {
                setWalletData(walletRes.data.wallet);
            }

            if (transactionsRes.data.success) {
                setTransactions(transactionsRes.data.transactions);
            }
        } catch (error) {
            console.error('Error fetching wallet data:', error);
        } finally {
            setLoading(false);
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
                <title>Platform Wallet - Admin Panel</title>
            </Head>

            <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold mb-2">Platform Wallet</h1>
                    <p className="text-yellow-100">Manage platform earnings and balance</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Wallet Balance Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 mb-2 text-sm font-medium">Current Balance</p>
                                <p className="text-4xl font-bold">₹{walletData?.balance?.toLocaleString() || 0}</p>
                            </div>
                            <FiDollarSign className="text-6xl text-green-200" />
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 mb-2 text-sm font-medium">Total Earnings</p>
                                <p className="text-4xl font-bold">₹{walletData?.totalEarnings?.toLocaleString() || 0}</p>
                            </div>
                            <FiTrendingUp className="text-6xl text-blue-200" />
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 mb-2 text-sm font-medium">Total Withdrawals</p>
                                <p className="text-4xl font-bold">₹{walletData?.totalWithdrawals?.toLocaleString() || 0}</p>
                            </div>
                            <FiTrendingDown className="text-6xl text-purple-200" />
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="card">
                    <h2 className="text-2xl font-bold mb-6">Transaction History</h2>

                    {transactions.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No transactions yet</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {transactions.map((transaction) => (
                                        <tr key={transaction._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(transaction.createdAt).toLocaleDateString()}
                                                <div className="text-xs text-gray-500">
                                                    {new Date(transaction.createdAt).toLocaleTimeString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${transaction.type === 'credit'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {transaction.type === 'credit' ? '+ Credit' : '- Debit'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div className="font-medium">{transaction.description}</div>
                                                {transaction.category && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Category: {transaction.category}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`text-sm font-bold ${transaction.type === 'credit'
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                                    }`}>
                                                    {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount?.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                ₹{transaction.balanceAfter?.toLocaleString() || 0}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="card">
                        <h3 className="text-lg font-bold mb-4">Earnings Breakdown</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Commission from Sales:</span>
                                <span className="font-bold text-green-600">₹{walletData?.commissionEarnings?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Other Income:</span>
                                <span className="font-bold text-blue-600">₹{walletData?.otherIncome?.toLocaleString() || 0}</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between items-center">
                                <span className="font-semibold text-gray-900">Total Earnings:</span>
                                <span className="font-bold text-xl text-green-600">₹{walletData?.totalEarnings?.toLocaleString() || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Transactions:</span>
                                <span className="font-bold">{transactions.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Credits:</span>
                                <span className="font-bold text-green-600">
                                    {transactions.filter(t => t.type === 'credit').length}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Debits:</span>
                                <span className="font-bold text-red-600">
                                    {transactions.filter(t => t.type === 'debit').length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
