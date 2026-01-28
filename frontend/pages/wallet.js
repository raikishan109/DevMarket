import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../components/Layout';
import api from '../utils/api';
import { getUser } from '../utils/auth';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiClock } from 'react-icons/fi';

export default function Wallet() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddMoney, setShowAddMoney] = useState(false);
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [amount, setAmount] = useState('');
    const [processing, setProcessing] = useState(false);
    const [paymentType, setPaymentType] = useState('');
    const [cryptoCoin, setCryptoCoin] = useState('');
    const [cryptoNetwork, setCryptoNetwork] = useState('');
    const [transactionHash, setTransactionHash] = useState('');
    const [upiId, setUpiId] = useState('');
    const [utrNumber, setUtrNumber] = useState('');
    const [payments, setPayments] = useState([]);
    const [paymentSettings, setPaymentSettings] = useState({ cryptoAddresses: [], upiIds: [] });

    const INR_TO_USDT_RATE = 88;
    const INR_TO_USDC_RATE = 88;

    const calculateCryptoAmount = () => {
        if (!amount || !cryptoCoin) return 0;
        const inrAmount = parseFloat(amount);
        if (isNaN(inrAmount)) return 0;

        if (cryptoCoin === 'USDT') {
            return (inrAmount / INR_TO_USDT_RATE).toFixed(2);
        } else if (cryptoCoin === 'USDC') {
            return (inrAmount / INR_TO_USDC_RATE).toFixed(2);
        }
        return 0;
    };

    useEffect(() => {
        const currentUser = getUser();
        if (!currentUser) {
            router.push('/login');
            return;
        }
        setUser(currentUser);
        fetchWallet();
        fetchPaymentSettings();

        // Auto-refresh wallet balance every 10 seconds
        const refreshInterval = setInterval(() => {
            fetchWallet();
        }, 10000); // 10 seconds

        // Cleanup interval on component unmount
        return () => clearInterval(refreshInterval);
    }, []);

    const fetchWallet = async () => {
        try {
            const response = await api.get('/api/wallet');
            if (response.data.success) {
                setBalance(response.data.balance);
                setTransactions(response.data.transactions);
            }
        } catch (error) {
            console.error('Error fetching wallet:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPaymentSettings = async () => {
        try {
            const response = await api.get('/api/settings/payment-options');
            if (response.data.success) {
                setPaymentSettings({
                    cryptoAddresses: response.data.cryptoAddresses || [],
                    upiIds: response.data.upiIds || []
                });
            }
        } catch (error) {
            console.error('Error fetching payment settings:', error);
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            const payload = {
                amount: Number(amount),
                paymentType
            };

            if (paymentType === 'crypto') {
                payload.cryptoCoin = cryptoCoin;
                payload.cryptoNetwork = cryptoNetwork;
                payload.transactionHash = transactionHash;
            } else if (paymentType === 'upi') {
                payload.upiId = upiId;
                payload.utrNumber = utrNumber;
            }

            const response = await api.post('/api/wallet/payment', payload);
            if (response.data.success) {
                alert(response.data.message);
                setAmount('');
                setPaymentType('');
                setCryptoCoin('');
                setCryptoNetwork('');
                setTransactionHash('');
                setUpiId('');
                setUtrNumber('');
                setShowAddMoney(false);
                fetchWallet();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error submitting payment');
        } finally {
            setProcessing(false);
        }
    };

    const handleWithdrawalSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            const payload = {
                amount: Number(amount),
                withdrawalType: paymentType
            };

            if (paymentType === 'crypto') {
                payload.cryptoCoin = cryptoCoin;
                payload.cryptoNetwork = cryptoNetwork;
                payload.walletAddress = transactionHash; // reusing field
            } else if (paymentType === 'upi') {
                payload.upiId = upiId;
            }

            const response = await api.post('/api/wallet/withdrawal', payload);
            if (response.data.success) {
                alert(response.data.message);
                setAmount('');
                setPaymentType('');
                setCryptoCoin('');
                setCryptoNetwork('');
                setTransactionHash('');
                setUpiId('');
                setShowWithdraw(false);
                fetchWallet();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error submitting withdrawal');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <div className="skeleton h-96"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <Head>
                <title>{user?.role === 'admin' ? 'Platform Wallet' : 'My Wallet'} - DevMarket</title>
            </Head>

            <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold mb-2">{user?.role === 'admin' ? 'Platform Wallet' : 'My Wallet'}</h1>
                    <p className="text-green-100">Track your balance and transactions</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl shadow-2xl p-8 mb-8 text-white">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-green-100 mb-2">Total Balance</p>
                            <h2 className="text-5xl font-bold">₹{balance.toLocaleString()}</h2>
                        </div>
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                            <FiDollarSign className="text-5xl" />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowAddMoney(true)}
                            className="flex-1 bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                        >
                            Add Money
                        </button>
                        <button
                            onClick={() => setShowWithdraw(true)}
                            className="flex-1 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Withdraw
                        </button>
                    </div>
                </div>

                {showAddMoney && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-2xl font-bold mb-6">Add Money to Wallet</h3>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <button
                                    onClick={() => {
                                        setPaymentType('crypto');
                                        setCryptoCoin('');
                                        setCryptoNetwork('');
                                        setTransactionHash('');
                                    }}
                                    className={`p-4 rounded-lg border-2 transition ${paymentType === 'crypto'
                                        ? 'border-primary-600 bg-primary-50'
                                        : 'border-gray-300 hover:border-primary-300'
                                        }`}
                                >
                                    <div className="text-center">
                                        <div className="text-2xl mb-2">💰</div>
                                        <div className="font-semibold">Crypto Payment</div>
                                    </div>
                                </button>
                                <button
                                    disabled
                                    className="p-4 rounded-lg border-2 bg-gray-100 border-gray-300 cursor-not-allowed opacity-60"
                                >
                                    <div className="text-center">
                                        <div className="text-2xl mb-2">📱</div>
                                        <div className="font-semibold">UPI Payment</div>
                                        <div className="text-xs text-yellow-600 mt-1">Coming Soon</div>
                                    </div>
                                </button>
                            </div>

                            <form onSubmit={handlePaymentSubmit}>
                                <div className="mb-4">
                                    <label className="label">Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        className="input"
                                        required
                                        min="1"
                                    />
                                </div>

                                {paymentType === 'crypto' && (
                                    <>
                                        <div className="mb-4">
                                            <label className="label">Select Coin</label>
                                            <select
                                                value={cryptoCoin}
                                                onChange={(e) => setCryptoCoin(e.target.value)}
                                                className="input"
                                                required
                                            >
                                                <option value="">Choose Coin</option>
                                                <option value="USDT">USDT</option>
                                                <option value="USDC">USDC</option>
                                            </select>
                                        </div>
                                        {amount && cryptoCoin && (
                                            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                                <p className="text-sm text-green-700 mb-1">Amount to pay in crypto:</p>
                                                <p className="text-2xl font-bold text-green-900">
                                                    {calculateCryptoAmount()} {cryptoCoin}
                                                </p>
                                                <p className="text-xs text-green-600 mt-1">
                                                    Rate: ₹{cryptoCoin === 'USDT' ? INR_TO_USDT_RATE : INR_TO_USDC_RATE} per {cryptoCoin}
                                                </p>
                                            </div>
                                        )}
                                        <div className="mb-4">
                                            <label className="label">Select Network</label>
                                            <select
                                                value={cryptoNetwork}
                                                onChange={(e) => setCryptoNetwork(e.target.value)}
                                                className="input"
                                                required
                                            >
                                                <option value="">Choose Network</option>
                                                <option value="BEP20">BEP20</option>
                                                <option value="Polygon">Polygon</option>
                                            </select>
                                        </div>
                                        {(cryptoNetwork === 'BEP20' || cryptoNetwork === 'Polygon') && (
                                            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                <label className="label text-blue-900">Available Wallet Addresses</label>
                                                {paymentSettings.cryptoAddresses && paymentSettings.cryptoAddresses.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {paymentSettings.cryptoAddresses.map((address, index) => (
                                                            <div key={index} className="flex items-center gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={address}
                                                                    readOnly
                                                                    className="input bg-white text-sm font-mono"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(address);
                                                                        alert('Wallet address copied!');
                                                                    }}
                                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
                                                                >
                                                                    Copy
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <p className="text-sm text-blue-700 mt-2">Send {cryptoCoin} on {cryptoNetwork} network to any of the above addresses</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded border border-yellow-200">⚠️ No crypto addresses available. Please contact admin.</p>
                                                )}
                                            </div>
                                        )}
                                        <div className="mb-4">
                                            <label className="label">Transaction Hash / Link</label>
                                            <input
                                                type="text"
                                                value={transactionHash}
                                                onChange={(e) => setTransactionHash(e.target.value)}
                                                placeholder="Enter transaction hash or link"
                                                className="input"
                                                required
                                            />
                                        </div>
                                    </>
                                )}

                                {paymentType === 'upi' && (
                                    <>
                                        <div className="mb-4 p-8 bg-yellow-50 border-2 border-yellow-300 rounded-lg text-center">
                                            <div className="text-6xl mb-3">📱</div>
                                            <p className="text-2xl font-bold text-yellow-800 mb-2">Coming Soon</p>
                                            <p className="text-sm text-yellow-700">UPI payment feature will be available soon</p>
                                        </div>
                                        <div className="mb-4">
                                            <label className="label">UPI ID</label>
                                            <input
                                                type="text"
                                                value={upiId}
                                                onChange={(e) => setUpiId(e.target.value)}
                                                placeholder="Enter your UPI ID"
                                                className="input"
                                                required
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="label">UTR Number</label>
                                            <input
                                                type="text"
                                                value={utrNumber}
                                                onChange={(e) => setUtrNumber(e.target.value)}
                                                placeholder="Enter UTR number"
                                                className="input"
                                                required
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="flex gap-4 mt-6">
                                    <button
                                        type="submit"
                                        disabled={processing || !paymentType}
                                        className="btn btn-primary flex-1"
                                    >
                                        {processing ? 'Submitting...' : 'Submit Payment'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddMoney(false);
                                            setAmount('');
                                            setPaymentType('');
                                        }}
                                        className="btn btn-secondary flex-1"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showWithdraw && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-2xl font-bold mb-2">Withdraw Money</h3>
                            <p className="text-gray-600 mb-6">Available: ₹{balance.toLocaleString()}</p>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <button
                                    onClick={() => {
                                        setPaymentType('crypto');
                                        setCryptoCoin('');
                                        setCryptoNetwork('');
                                        setTransactionHash('');
                                    }}
                                    className={`p-4 rounded-lg border-2 transition ${paymentType === 'crypto'
                                        ? 'border-primary-600 bg-primary-50'
                                        : 'border-gray-300 hover:border-primary-300'
                                        }`}
                                >
                                    <div className="text-center">
                                        <div className="text-2xl mb-2">💰</div>
                                        <div className="font-semibold">Crypto Withdrawal</div>
                                    </div>
                                </button>
                                <button
                                    disabled
                                    className="p-4 rounded-lg border-2 bg-gray-100 border-gray-300 cursor-not-allowed opacity-60"
                                >
                                    <div className="text-center">
                                        <div className="text-2xl mb-2">📱</div>
                                        <div className="font-semibold">UPI Withdrawal</div>
                                        <div className="text-xs text-yellow-600 mt-1">Coming Soon</div>
                                    </div>
                                </button>
                            </div>

                            <form onSubmit={handleWithdrawalSubmit}>
                                <div className="mb-4">
                                    <label className="label">Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        className="input"
                                        required
                                        min="1"
                                        max={balance}
                                    />
                                </div>

                                {paymentType === 'crypto' && (
                                    <>
                                        <div className="mb-4">
                                            <label className="label">Select Coin</label>
                                            <select
                                                value={cryptoCoin}
                                                onChange={(e) => setCryptoCoin(e.target.value)}
                                                className="input"
                                                required
                                            >
                                                <option value="">Choose Coin</option>
                                                <option value="USDT">USDT</option>
                                                <option value="USDC">USDC</option>
                                            </select>
                                        </div>
                                        {amount && cryptoCoin && (
                                            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                <p className="text-sm text-blue-700 mb-1">You will receive:</p>
                                                <p className="text-2xl font-bold text-blue-900">
                                                    {calculateCryptoAmount()} {cryptoCoin}
                                                </p>
                                                <p className="text-xs text-blue-600 mt-1">
                                                    Rate: ₹{cryptoCoin === 'USDT' ? INR_TO_USDT_RATE : INR_TO_USDC_RATE} per {cryptoCoin}
                                                </p>
                                            </div>
                                        )}
                                        <div className="mb-4">
                                            <label className="label">Select Network</label>
                                            <select
                                                value={cryptoNetwork}
                                                onChange={(e) => setCryptoNetwork(e.target.value)}
                                                className="input"
                                                required
                                            >
                                                <option value="">Choose Network</option>
                                                <option value="BEP20">BEP20</option>
                                                <option value="Polygon">Polygon</option>
                                            </select>
                                        </div>
                                        <div className="mb-4">
                                            <label className="label">Your Wallet Address</label>
                                            <input
                                                type="text"
                                                value={transactionHash}
                                                onChange={(e) => setTransactionHash(e.target.value)}
                                                placeholder="Enter your wallet address"
                                                className="input"
                                                required
                                                minLength="20"
                                            />
                                        </div>
                                    </>
                                )}

                                {paymentType === 'upi' && (
                                    <>
                                        <div className="mb-4">
                                            <label className="label">UPI ID</label>
                                            <input
                                                type="text"
                                                value={upiId}
                                                onChange={(e) => setUpiId(e.target.value)}
                                                placeholder="Enter your UPI ID (e.g., name@upi)"
                                                className="input"
                                                required
                                                pattern="[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}"
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="flex gap-4 mt-6">
                                    <button
                                        type="submit"
                                        disabled={processing || !paymentType}
                                        className="btn btn-danger flex-1"
                                    >
                                        {processing ? 'Submitting...' : 'Submit Withdrawal'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowWithdraw(false);
                                            setAmount('');
                                            setPaymentType('');
                                        }}
                                        className="btn btn-secondary flex-1"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">Recent Transactions</h3>
                        <FiClock className="text-gray-400 text-xl" />
                    </div>

                    {transactions.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No transactions yet</p>
                    ) : (
                        <div className="space-y-4">
                            {transactions.map((transaction) => (
                                <div
                                    key={transaction._id}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${transaction.type === 'credit'
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-red-100 text-red-600'
                                            }`}>
                                            {transaction.type === 'credit' ? (
                                                <FiTrendingUp className="text-xl" />
                                            ) : (
                                                <FiTrendingDown className="text-xl" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{transaction.description}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xl font-bold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                                        </p>
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${transaction.type === 'credit'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {transaction.category}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
