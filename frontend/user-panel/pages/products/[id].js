import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/Layout';
import Modal, { ConfirmModal } from '../../components/Modal';
import api from '../../utils/api';
import { getUser } from '../../utils/auth';
import { useToast } from '../../contexts/ToastContext';
import { FiStar, FiDollarSign, FiExternalLink, FiCheck, FiX, FiUser, FiMessageSquare, FiShoppingCart } from 'react-icons/fi';

export default function ProductDetail() {
    const router = useRouter();
    const { id } = router.query;
    const toast = useToast();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [hasPurchased, setHasPurchased] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'info' });
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: () => { } });

    useEffect(() => {
        setUser(getUser());
        if (id) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await api.get(`/api/products/${id}`);
            if (response.data.success) {
                setProduct(response.data.product);
                setReviews(response.data.reviews || []);

                // Check if user has purchased
                if (user) {
                    const purchasesResponse = await api.get('/api/orders/my-purchases');
                    const purchased = purchasesResponse.data.orders?.some(
                        order => order.product._id === id
                    );
                    setHasPurchased(purchased);
                }
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBuyNow = async () => {
        if (!user) {
            router.push('/login');
            return;
        }

        try {
            // Fetch current wallet balance
            const walletRes = await api.get('/api/wallet');
            const currentBalance = walletRes.data.wallet.balance;
            const remainingBalance = currentBalance - product.price;

            // Show confirmation with balance info
            const confirmed = await toast.confirm(
                `🛒 Purchase Confirmation\n\n` +
                `Product: ${product.name}\n` +
                `Price: ₹${product.price}\n\n` +
                `━━━━━━━━━━━━━━━━━━━━\n\n` +
                `💰 Current Balance: ₹${currentBalance}\n` +
                `➖ Deduct Amount: ₹${product.price}\n` +
                `━━━━━━━━━━━━━━━━━━━━\n` +
                `✅ Remaining: ₹${remainingBalance}\n\n` +
                `Proceed?`
            );

            if (!confirmed) return;

            // Show loading toast
            toast.info('Processing payment...');

            // Process payment
            const response = await api.post('/api/orders/buy-now', {
                productId: product._id
            });

            if (response.data.success) {
                toast.success('Purchase successful! Check your purchases in your dashboard.');

                // Refresh product data to show ownership
                fetchProduct();

                // Redirect to buyer dashboard after 2 seconds
                setTimeout(() => {
                    router.push('/buyer/dashboard');
                }, 2000);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Purchase failed';
            toast.error(errorMessage);
        }
    };

    const handleContactSeller = async () => {
        if (!user) {
            router.push('/login');
            return;
        }

        try {
            const chatResponse = await api.post('/api/chat/create', {
                productId: product._id
            });

            if (chatResponse.data.success) {
                const chatRoomId = chatResponse.data.chatRoom._id;
                toast.success('Chat room created! Redirecting...');
                setTimeout(() => {
                    router.push(`/chat/${chatRoomId}`);
                }, 1000);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating chat');
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/reviews', {
                productId: product._id,
                rating: reviewForm.rating,
                comment: reviewForm.comment
            });
            setModalConfig({
                title: '✅ Review Submitted',
                message: 'Thank you for your review!',
                type: 'success'
            });
            setShowModal(true);
            fetchProduct();
            setReviewForm({ rating: 5, comment: '' });
        } catch (error) {
            setModalConfig({
                title: '❌ Error',
                message: error.response?.data?.message || 'Error submitting review',
                type: 'error'
            });
            setShowModal(true);
        }
    };



    if (loading) {
        return (
            <Layout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="skeleton h-96"></div>
                </div>
            </Layout>
        );
    }

    if (!product) {
        return (
            <Layout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                    <h2 className="text-2xl font-bold">Product not found</h2>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <Head>
                <title>{product.name} - DevMarket</title>
                <meta name="description" content={product.problemSolved} />
            </Head>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header */}
                        <div className="card">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <span className="badge badge-info">{product.category}</span>
                                        {hasPurchased && (
                                            <span className="badge bg-green-500 text-white font-semibold px-3 py-1">
                                                ✓ Purchased
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
                                    {product.averageRating > 0 && (
                                        <div className="flex items-center space-x-2">
                                            <div className="flex items-center text-yellow-500">
                                                {[...Array(5)].map((_, i) => (
                                                    <FiStar
                                                        key={i}
                                                        size={20}
                                                        fill={i < product.averageRating ? 'currentColor' : 'none'}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-gray-600">
                                                {product.averageRating} ({product.totalReviews} reviews)
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Problem & Solution */}
                            <div className="space-y-4">
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                                    <h3 className="font-bold text-red-900 mb-2 flex items-center">
                                        <FiX className="mr-2" /> Problem
                                    </h3>
                                    <p className="text-red-800">{product.problemSolved}</p>
                                </div>

                                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                                    <h3 className="font-bold text-green-900 mb-2 flex items-center">
                                        <FiCheck className="mr-2" /> Solution
                                    </h3>
                                    <p className="text-green-800">{product.solution}</p>
                                </div>
                            </div>
                        </div>

                        {/* Target Audience */}
                        <div className="card">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Who Should Use This?</h2>
                            <p className="text-gray-700">{product.targetAudience}</p>
                        </div>

                        {/* Features */}
                        {product.features && product.features.length > 0 && (
                            <div className="card">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Features</h2>
                                <ul className="space-y-2">
                                    {product.features.map((feature, index) => (
                                        <li key={index} className="flex items-start">
                                            <FiCheck className="text-green-600 mr-2 mt-1 flex-shrink-0" />
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Demo Link */}
                        {product.demoLink && (
                            <div className="card">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Demo</h2>
                                <a
                                    href={product.demoLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-secondary inline-flex items-center space-x-2"
                                >
                                    <span>View Demo</span>
                                    <FiExternalLink />
                                </a>
                            </div>
                        )}

                        {/* Reviews */}
                        <div className="card">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews</h2>

                            {hasPurchased && (
                                <form onSubmit={handleReviewSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <h3 className="font-semibold mb-3">Write a Review</h3>
                                    <div className="mb-3">
                                        <label className="label">Rating</label>
                                        <select
                                            value={reviewForm.rating}
                                            onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                                            className="input"
                                        >
                                            {[5, 4, 3, 2, 1].map(num => (
                                                <option key={num} value={num}>{num} Stars</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="label">Comment</label>
                                        <textarea
                                            value={reviewForm.comment}
                                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                            className="input"
                                            rows="3"
                                            required
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="btn btn-primary">Submit Review</button>
                                </form>
                            )}

                            {reviews.length > 0 ? (
                                <div className="space-y-4">
                                    {reviews.map((review) => (
                                        <div key={review._id} className="border-b border-gray-200 pb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center space-x-2">
                                                    <FiUser className="text-gray-400" />
                                                    <span className="font-semibold">{review.buyer?.name}</span>
                                                </div>
                                                <div className="flex items-center text-yellow-500">
                                                    {[...Array(5)].map((_, i) => (
                                                        <FiStar
                                                            key={i}
                                                            size={16}
                                                            fill={i < review.rating ? 'currentColor' : 'none'}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-gray-700">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600">No reviews yet</p>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="card sticky top-24">
                            <div className="text-center mb-6">
                                <div className="flex items-center justify-center space-x-2 mb-2">
                                    <FiDollarSign className="text-primary-600 text-3xl" />
                                    <span className="text-5xl font-bold text-primary-600">₹{product.price}</span>
                                </div>
                                <p className="text-gray-600">One-time payment</p>
                            </div>

                            {hasPurchased ? (
                                <div className="space-y-4">
                                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center">
                                        ✓ You own this product
                                    </div>
                                    <a
                                        href={product.accessLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary w-full flex items-center justify-center space-x-2"
                                    >
                                        <span>Access Product</span>
                                        <FiExternalLink />
                                    </a>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {/* Buy Now Button with Coming Soon */}
                                    <div className="relative">
                                        <button
                                            className="btn btn-primary w-full flex items-center justify-center space-x-2 opacity-60 cursor-not-allowed"
                                            disabled
                                        >
                                            <FiShoppingCart />
                                            <span>Buy Now</span>
                                        </button>
                                        <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                                            Coming Soon
                                        </span>
                                    </div>

                                    {/* Contact Seller Button */}
                                    <button
                                        onClick={handleContactSeller}
                                        className="btn btn-secondary w-full flex items-center justify-center space-x-2"
                                    >
                                        <FiMessageSquare />
                                        <span>Contact Seller for Deal</span>
                                    </button>
                                </div>
                            )}

                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h3 className="font-semibold mb-3">Product Stats</h3>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                        <span>Sales:</span>
                                        <span className="font-semibold">{product.sales}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Category:</span>
                                        <span className="font-semibold">{product.category}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
            />

            <ConfirmModal
                isOpen={showConfirm}
                onClose={() => {
                    if (confirmConfig.onCancel) {
                        confirmConfig.onCancel();
                    } else {
                        setShowConfirm(false);
                    }
                }}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                confirmText={confirmConfig.confirmText}
                cancelText={confirmConfig.cancelText}
                type={confirmConfig.type}
            />
        </Layout>
    );
}
