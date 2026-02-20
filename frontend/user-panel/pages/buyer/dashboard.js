import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { getUser } from '../../utils/auth';
import { FiShoppingBag, FiExternalLink, FiCalendar } from 'react-icons/fi';

export default function BuyerDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = getUser();
        if (!currentUser) {
            router.push('/login');
            return;
        }
        setUser(currentUser);
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        try {
            const response = await api.get('/orders/my-purchases');
            if (response.data.success) {
                setPurchases(response.data.orders);
            }
        } catch (error) {
            console.error('Error fetching purchases:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Head>
                <title>My Purchases - DevMarket</title>
            </Head>

            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold mb-2">My Purchases</h1>
                    <p className="text-primary-100">Access your purchased products</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 mb-1">Total Purchases</p>
                                <p className="text-4xl font-bold">{purchases.length}</p>
                            </div>
                            <FiShoppingBag className="text-5xl text-blue-200" />
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 mb-1">Total Spent</p>
                                <p className="text-4xl font-bold">
                                    ₹{purchases.reduce((sum, p) => sum + p.amount, 0)}
                                </p>
                            </div>
                            <FiShoppingBag className="text-5xl text-green-200" />
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 mb-1">Categories</p>
                                <p className="text-4xl font-bold">
                                    {new Set(purchases.map(p => p.product?.category)).size}
                                </p>
                            </div>
                            <FiShoppingBag className="text-5xl text-purple-200" />
                        </div>
                    </div>
                </div>

                {/* Purchases List */}
                <div className="card">
                    <h2 className="text-2xl font-bold mb-6">Purchased Products</h2>
                    {loading ? (
                        <div className="skeleton h-64"></div>
                    ) : purchases.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {purchases.map((purchase) => (
                                <div key={purchase._id} className="group bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-primary-500 hover:shadow-xl transition-all duration-300">
                                    {/* Product Image/Icon */}
                                    <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-5 text-center">
                                        <div className="text-4xl mb-2">
                                            {purchase.product?.category === 'Web Development' ? '🌐' :
                                                purchase.product?.category === 'Mobile App' ? '📱' :
                                                    purchase.product?.category === 'AI/ML' ? '🤖' :
                                                        purchase.product?.category === 'UI/UX Design' ? '🎨' :
                                                            purchase.product?.category === 'API' ? '🔌' :
                                                                purchase.product?.category === 'DevOps' ? '⚙️' : '💻'}
                                        </div>
                                        <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                                            {purchase.product?.category}
                                        </span>
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-4">
                                        <h3 className="text-base font-bold text-gray-900 mb-1.5 line-clamp-2 min-h-[2.5rem]">
                                            {purchase.product?.name}
                                        </h3>
                                        <p className="text-gray-600 text-xs line-clamp-2 mb-3 min-h-[2rem]">
                                            {purchase.product?.problemSolved}
                                        </p>

                                        {/* Purchase Details */}
                                        <div className="space-y-1.5 mb-3 pb-3 border-b border-gray-200">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500 flex items-center gap-1">
                                                    <FiCalendar size={12} />
                                                    Purchased
                                                </span>
                                                <span className="font-medium text-gray-700">
                                                    {new Date(purchase.purchaseDate).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500">Amount Paid</span>
                                                <span className="text-lg font-bold text-primary-600">₹{purchase.amount}</span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="space-y-2">
                                            <a
                                                href={purchase.product?.accessLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block btn btn-primary w-full text-xs font-semibold py-2 group-hover:shadow-lg transition-shadow"
                                            >
                                                <span className="flex items-center justify-center gap-2">
                                                    <span>Access Product</span>
                                                    <FiExternalLink size={12} className="group-hover:translate-x-1 transition-transform" />
                                                </span>
                                            </a>
                                            <Link
                                                href={`/products/${purchase.product?._id}`}
                                                className="block btn btn-secondary w-full text-center text-xs font-medium py-2"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <FiShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No purchases yet</h3>
                            <p className="text-gray-600 mb-6">Browse the marketplace to find amazing products</p>
                            <Link href="/marketplace" className="btn btn-primary">
                                Browse Marketplace
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
