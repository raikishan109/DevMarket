import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/Layout';
import Modal, { ConfirmModal } from '../../components/Modal';
import api from '../../utils/api';
import { getUser } from '../../utils/auth';
import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
    FiStar, FiExternalLink, FiCheck, FiX, FiUser,
    FiMessageSquare, FiShoppingCart, FiTag, FiZap,
    FiPackage, FiArrowLeft, FiTrendingUp, FiAward
} from 'react-icons/fi';

const CATEGORY_COLORS = {
    'AI Tools': '#8b5cf6',
    'Automation': '#f59e0b',
    'Websites': '#10b981',
    'Mobile Apps': '#3b82f6',
    'Other': '#ec4899',
};

function StarRating({ rating, size = 18 }) {
    return (
        <div style={{ display: 'flex', gap: 3 }}>
            {[1, 2, 3, 4, 5].map(i => (
                <FiStar
                    key={i}
                    size={size}
                    fill={i <= rating ? '#f59e0b' : 'none'}
                    color={i <= rating ? '#f59e0b' : '#475569'}
                />
            ))}
        </div>
    );
}

export default function ProductDetail() {
    const router = useRouter();
    const { id } = router.query;
    const toast = useToast();
    const { theme } = useTheme();
    const isLight = theme === 'light';

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [hasPurchased, setHasPurchased] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'info' });
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: () => { } });

    // ── theme tokens ──
    const pageBg = isLight ? '#f0f0fa' : '#080814';
    const heroBg = isLight
        ? 'linear-gradient(135deg,#f5f3ff 0%,#ede9fe 100%)'
        : 'linear-gradient(135deg,#0f0c1f 0%,#0a0818 100%)';
    const cardBg = isLight ? 'rgba(255,255,255,0.97)' : 'rgba(15,13,28,0.98)';
    const cardBorder = isLight ? '1px solid rgba(124,58,237,0.12)' : '1px solid rgba(124,58,237,0.14)';
    const titleColor = isLight ? '#1e1b4b' : '#f1f5f9';
    const mutedColor = isLight ? '#6b7280' : '#64748b';
    const bodyColor = isLight ? '#374151' : '#94a3b8';
    const divider = isLight ? 'rgba(124,58,237,0.1)' : 'rgba(124,58,237,0.12)';
    const reviewBg = isLight ? 'rgba(245,243,255,0.7)' : 'rgba(20,18,35,0.7)';
    const inputBg = isLight ? '#fff' : 'rgba(15,13,28,0.9)';
    const inputBorder = isLight ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.2)';

    useEffect(() => {
        setUser(getUser());
        if (id) fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await api.get(`/api/products/${id}`);
            if (response.data.success) {
                setProduct(response.data.product);
                setReviews(response.data.reviews || []);
                if (user) {
                    const purchasesRes = await api.get('/api/orders/my-purchases');
                    setHasPurchased(
                        purchasesRes.data.orders?.some(o => o.product._id === id)
                    );
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleContactSeller = async () => {
        if (!user) { router.push('/login'); return; }
        try {
            const res = await api.post('/api/chat/create', { productId: product._id });
            if (res.data.success) {
                toast.success('Chat room created! Redirecting...');
                setTimeout(() => router.push(`/chat/${res.data.chatRoom._id}`), 1000);
            }
        } catch (e) {
            toast.error(e.response?.data?.message || 'Error creating chat');
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/reviews', {
                productId: product._id,
                rating: reviewForm.rating,
                comment: reviewForm.comment,
            });
            setModalConfig({ title: '✅ Review Submitted', message: 'Thank you for your review!', type: 'success' });
            setShowModal(true);
            fetchProduct();
            setReviewForm({ rating: 5, comment: '' });
        } catch (e) {
            setModalConfig({ title: '❌ Error', message: e.response?.data?.message || 'Error submitting review', type: 'error' });
            setShowModal(true);
        }
    };

    const catColor = product ? (CATEGORY_COLORS[product.category] || '#8b5cf6') : '#8b5cf6';

    // ── Loading ──
    if (loading) {
        return (
            <Layout>
                <div style={{ background: pageBg, minHeight: '100vh', padding: '60px 5%' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{
                            height: i === 1 ? 220 : 140,
                            borderRadius: 20, marginBottom: 20,
                            background: isLight
                                ? 'linear-gradient(90deg,#e8e0ff 25%,#d4c8ff 50%,#e8e0ff 75%)'
                                : 'linear-gradient(90deg,rgba(99,102,241,0.05) 25%,rgba(99,102,241,0.1) 50%,rgba(99,102,241,0.05) 75%)',
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 1.5s infinite',
                        }} />
                    ))}
                </div>
            </Layout>
        );
    }

    if (!product) {
        return (
            <Layout>
                <div style={{ background: pageBg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
                        <h2 style={{ color: titleColor, fontSize: 24, fontWeight: 800 }}>Product not found</h2>
                        <button onClick={() => router.push('/marketplace')} style={{
                            marginTop: 20, padding: '10px 24px', borderRadius: 12,
                            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                            color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer',
                        }}>← Back to Marketplace</button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <Head>
                <title>{product.name} – DevMarket</title>
                <meta name="description" content={product.problemSolved} />
            </Head>

            <div style={{ background: pageBg, minHeight: '100vh' }}>

                {/* ── HERO BANNER ── */}
                <div style={{
                    background: heroBg,
                    borderBottom: `1px solid ${divider}`,
                    padding: '48px 5% 40px',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {/* Orbs */}
                    <div style={{ position: 'absolute', top: -60, right: '5%', width: 320, height: 320, borderRadius: '50%', background: `radial-gradient(circle,${catColor}22 0%,transparent 70%)`, pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: -80, left: '10%', width: 240, height: 240, borderRadius: '50%', background: `radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)`, pointerEvents: 'none' }} />

                    <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto' }}>
                        {/* Back link */}
                        <button
                            onClick={() => router.back()}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: mutedColor, fontSize: 14, fontWeight: 600, marginBottom: 24, padding: 0,
                            }}
                        >
                            <FiArrowLeft size={16} /> Back
                        </button>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
                            {/* Category icon box */}
                            <div style={{
                                width: 64, height: 64, borderRadius: 18, flexShrink: 0,
                                background: `${catColor}20`, border: `1.5px solid ${catColor}40`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 28, color: catColor,
                            }}>
                                <FiPackage />
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                {/* Badges row */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                                    <span style={{
                                        padding: '4px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                                        background: `${catColor}18`, border: `1px solid ${catColor}40`, color: catColor,
                                        letterSpacing: '0.5px', textTransform: 'uppercase',
                                    }}>
                                        <FiTag size={10} style={{ marginRight: 4 }} />{product.category}
                                    </span>
                                    {hasPurchased && (
                                        <span style={{
                                            padding: '4px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                                            background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', color: '#10b981',
                                        }}>✓ Owned</span>
                                    )}
                                    {product.sales > 0 && (
                                        <span style={{
                                            padding: '4px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                                            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b',
                                        }}>🔥 {product.sales} sold</span>
                                    )}
                                </div>

                                <h1 style={{
                                    fontSize: 'clamp(24px,4vw,40px)', fontWeight: 900, color: titleColor,
                                    lineHeight: 1.15, margin: '0 0 12px', letterSpacing: '-1px',
                                }}>
                                    {product.name}
                                </h1>

                                {product.averageRating > 0 && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <StarRating rating={product.averageRating} />
                                        <span style={{ color: mutedColor, fontSize: 14 }}>
                                            {product.averageRating.toFixed(1)} · {product.totalReviews} review{product.totalReviews !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── CONTENT ── */}
                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 5% 80px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>

                    {/* ── LEFT COLUMN ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                        {/* Problem & Solution */}
                        <div style={{ background: cardBg, border: cardBorder, borderRadius: 20, overflow: 'hidden' }}>
                            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${divider}` }}>
                                <h2 style={{ color: titleColor, fontSize: 18, fontWeight: 800, margin: 0 }}>Problem & Solution</h2>
                            </div>
                            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {/* Problem block */}
                                <div style={{
                                    display: 'flex', gap: 14, padding: '16px 18px', borderRadius: 14,
                                    background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)',
                                }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                                        background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <FiX size={18} color="#f87171" />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 11, fontWeight: 800, color: '#f87171', margin: '0 0 6px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>The Problem</p>
                                        <p style={{ fontSize: 15, color: bodyColor, lineHeight: 1.65, margin: 0 }}>{product.problemSolved}</p>
                                    </div>
                                </div>
                                {/* Solution block */}
                                <div style={{
                                    display: 'flex', gap: 14, padding: '16px 18px', borderRadius: 14,
                                    background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)',
                                }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                                        background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <FiZap size={18} color="#34d399" />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 11, fontWeight: 800, color: '#34d399', margin: '0 0 6px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>The Solution</p>
                                        <p style={{ fontSize: 15, color: bodyColor, lineHeight: 1.65, margin: 0 }}>{product.solution}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Target Audience */}
                        {product.targetAudience && (
                            <div style={{ background: cardBg, border: cardBorder, borderRadius: 20, overflow: 'hidden' }}>
                                <div style={{ padding: '20px 24px', borderBottom: `1px solid ${divider}` }}>
                                    <h2 style={{ color: titleColor, fontSize: 18, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <FiUser size={18} color={catColor} /> Who Is This For?
                                    </h2>
                                </div>
                                <div style={{ padding: 24 }}>
                                    <p style={{ fontSize: 15, color: bodyColor, lineHeight: 1.7, margin: 0 }}>{product.targetAudience}</p>
                                </div>
                            </div>
                        )}

                        {/* Features */}
                        {product.features && product.features.length > 0 && (
                            <div style={{ background: cardBg, border: cardBorder, borderRadius: 20, overflow: 'hidden' }}>
                                <div style={{ padding: '20px 24px', borderBottom: `1px solid ${divider}` }}>
                                    <h2 style={{ color: titleColor, fontSize: 18, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <FiAward size={18} color={catColor} /> Features
                                    </h2>
                                </div>
                                <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
                                    {product.features.map((f, i) => (
                                        <div key={i} style={{
                                            display: 'flex', alignItems: 'flex-start', gap: 10,
                                            padding: '12px 14px', borderRadius: 12,
                                            background: isLight ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.07)',
                                            border: `1px solid rgba(99,102,241,0.12)`,
                                        }}>
                                            <div style={{
                                                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                                                background: `${catColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <FiCheck size={12} color={catColor} />
                                            </div>
                                            <span style={{ fontSize: 14, color: bodyColor, lineHeight: 1.5 }}>{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Demo Link */}
                        {product.demoLink && (
                            <div style={{ background: cardBg, border: cardBorder, borderRadius: 20, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                                <div>
                                    <p style={{ color: titleColor, fontWeight: 700, fontSize: 16, margin: '0 0 2px' }}>Live Demo Available</p>
                                    <p style={{ color: mutedColor, fontSize: 13, margin: 0 }}>See the product in action before buying</p>
                                </div>
                                <a
                                    href={product.demoLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 8,
                                        padding: '10px 22px', borderRadius: 12, fontWeight: 700, fontSize: 14,
                                        background: `linear-gradient(135deg,${catColor},#8b5cf6)`,
                                        color: 'white', textDecoration: 'none',
                                        boxShadow: `0 4px 16px ${catColor}40`,
                                    }}
                                >
                                    View Demo <FiExternalLink size={14} />
                                </a>
                            </div>
                        )}

                        {/* Reviews */}
                        <div style={{ background: cardBg, border: cardBorder, borderRadius: 20, overflow: 'hidden' }}>
                            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h2 style={{ color: titleColor, fontSize: 18, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FiStar size={18} color="#f59e0b" /> Reviews
                                </h2>
                                {reviews.length > 0 && (
                                    <span style={{
                                        padding: '3px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                                        background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)',
                                    }}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                                )}
                            </div>

                            <div style={{ padding: 24 }}>
                                {/* Write review form */}
                                {hasPurchased && (
                                    <form onSubmit={handleReviewSubmit} style={{
                                        marginBottom: 28, padding: 20, borderRadius: 16,
                                        background: reviewBg, border: `1px solid ${divider}`,
                                    }}>
                                        <p style={{ color: titleColor, fontWeight: 700, fontSize: 15, margin: '0 0 16px' }}>✍️ Write a Review</p>
                                        <div style={{ marginBottom: 14 }}>
                                            <label style={{ color: mutedColor, fontSize: 12, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Rating</label>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                {[5, 4, 3, 2, 1].map(n => (
                                                    <button
                                                        type="button"
                                                        key={n}
                                                        onClick={() => setReviewForm(f => ({ ...f, rating: n }))}
                                                        style={{
                                                            padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                                            border: reviewForm.rating === n ? '1px solid #f59e0b' : `1px solid ${inputBorder}`,
                                                            background: reviewForm.rating === n ? 'rgba(245,158,11,0.15)' : inputBg,
                                                            color: reviewForm.rating === n ? '#f59e0b' : mutedColor,
                                                        }}
                                                    >
                                                        {'★'.repeat(n)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: 16 }}>
                                            <label style={{ color: mutedColor, fontSize: 12, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Your Comment</label>
                                            <textarea
                                                value={reviewForm.comment}
                                                onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                                                required
                                                rows={3}
                                                placeholder="Share your experience..."
                                                style={{
                                                    width: '100%', padding: '12px 14px', borderRadius: 12,
                                                    background: inputBg, border: `1px solid ${inputBorder}`,
                                                    color: titleColor, fontSize: 14, outline: 'none', resize: 'vertical',
                                                    boxSizing: 'border-box', fontFamily: 'inherit',
                                                }}
                                            />
                                        </div>
                                        <button type="submit" style={{
                                            padding: '10px 24px', borderRadius: 10, fontWeight: 700, fontSize: 14,
                                            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', border: 'none', cursor: 'pointer',
                                        }}>Submit Review</button>
                                    </form>
                                )}

                                {reviews.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        {reviews.map(r => (
                                            <div key={r._id} style={{
                                                padding: '16px 18px', borderRadius: 14,
                                                background: reviewBg, border: `1px solid ${divider}`,
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div style={{
                                                            width: 36, height: 36, borderRadius: '50%',
                                                            background: `linear-gradient(135deg,${catColor}40,#8b5cf680)`,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            color: catColor, fontWeight: 800, fontSize: 14,
                                                        }}>
                                                            {r.buyer?.name?.[0]?.toUpperCase() || '?'}
                                                        </div>
                                                        <div>
                                                            <p style={{ color: titleColor, fontWeight: 700, fontSize: 14, margin: 0 }}>{r.buyer?.name || 'Anonymous'}</p>
                                                            <p style={{ color: mutedColor, fontSize: 11, margin: 0 }}>{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                        </div>
                                                    </div>
                                                    <StarRating rating={r.rating} size={14} />
                                                </div>
                                                <p style={{ fontSize: 14, color: bodyColor, lineHeight: 1.6, margin: 0 }}>{r.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '40px 0', color: mutedColor }}>
                                        <div style={{ fontSize: 40, marginBottom: 10 }}>⭐</div>
                                        <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>No reviews yet</p>
                                        <p style={{ fontSize: 13, margin: '6px 0 0' }}>Be the first to review this product</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── SIDEBAR ── */}
                    <div style={{ position: 'sticky', top: 90 }}>
                        <div style={{
                            background: cardBg, border: cardBorder, borderRadius: 22, overflow: 'hidden',
                            boxShadow: isLight ? '0 8px 32px rgba(99,102,241,0.08)' : '0 8px 32px rgba(0,0,0,0.3)',
                        }}>
                            {/* Price band */}
                            <div style={{
                                padding: '28px 24px 24px',
                                background: `linear-gradient(135deg,${catColor}12,transparent)`,
                                borderBottom: `1px solid ${divider}`,
                                textAlign: 'center',
                            }}>
                                <p style={{ fontSize: 44, fontWeight: 900, color: '#a78bfa', margin: 0, lineHeight: 1 }}>₹{product.price}</p>
                                <p style={{ fontSize: 12, color: mutedColor, margin: '6px 0 0', letterSpacing: '0.4px' }}>ONE-TIME PAYMENT · NO SUBSCRIPTION</p>
                            </div>

                            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {hasPurchased ? (
                                    <>
                                        <div style={{
                                            padding: '12px 16px', borderRadius: 12, textAlign: 'center',
                                            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                                            color: '#10b981', fontWeight: 700, fontSize: 14,
                                        }}>✓ You own this product</div>
                                        <a
                                            href={product.accessLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                                padding: '14px', borderRadius: 14, fontWeight: 700, fontSize: 15,
                                                background: `linear-gradient(135deg,${catColor},#8b5cf6)`,
                                                color: 'white', textDecoration: 'none',
                                                boxShadow: `0 6px 20px ${catColor}40`,
                                            }}
                                        >
                                            Access Product <FiExternalLink size={15} />
                                        </a>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ position: 'relative' }}>
                                            <button
                                                disabled
                                                style={{
                                                    width: '100%', padding: '14px', borderRadius: 14,
                                                    fontWeight: 700, fontSize: 15, border: 'none', cursor: 'not-allowed',
                                                    background: `linear-gradient(135deg,${catColor}66,#8b5cf666)`,
                                                    color: 'white', opacity: 0.7,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                                }}
                                            >
                                                <FiShoppingCart size={16} /> Buy Now
                                            </button>
                                            <span style={{
                                                position: 'absolute', top: -10, right: -8,
                                                background: 'linear-gradient(135deg,#f59e0b,#f97316)',
                                                color: 'white', fontSize: 10, fontWeight: 800,
                                                padding: '3px 10px', borderRadius: 999,
                                                letterSpacing: '0.5px', boxShadow: '0 4px 12px rgba(245,158,11,0.4)',
                                            }}>COMING SOON</span>
                                        </div>
                                        <button
                                            onClick={handleContactSeller}
                                            style={{
                                                width: '100%', padding: '13px', borderRadius: 14,
                                                fontWeight: 700, fontSize: 14, border: `1.5px solid ${catColor}40`,
                                                background: `${catColor}10`, color: catColor, cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                                transition: 'all 0.2s',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = `${catColor}20`}
                                            onMouseLeave={e => e.currentTarget.style.background = `${catColor}10`}
                                        >
                                            <FiMessageSquare size={15} /> Contact Seller
                                        </button>
                                    </>
                                )}

                                {/* Stats box */}
                                <div style={{ marginTop: 8, padding: '16px', borderRadius: 14, background: reviewBg, border: `1px solid ${divider}` }}>
                                    <p style={{ color: mutedColor, fontSize: 11, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', margin: '0 0 12px' }}>Product Stats</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {[
                                            { label: 'Total Sales', value: `${product.sales || 0} units`, icon: <FiTrendingUp size={14} /> },
                                            { label: 'Category', value: product.category, icon: <FiTag size={14} /> },
                                            { label: 'Rating', value: product.averageRating > 0 ? `${product.averageRating.toFixed(1)} / 5` : 'Not rated', icon: <FiStar size={14} /> },
                                        ].map((s, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ color: mutedColor, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>{s.icon}{s.label}</span>
                                                <span style={{ color: titleColor, fontSize: 13, fontWeight: 700 }}>{s.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes shimmer {
                    0%   { background-position: -200% 0; }
                    100% { background-position:  200% 0; }
                }
                @media (max-width: 860px) {
                    .product-grid { grid-template-columns: 1fr !important; }
                }
                textarea::placeholder { color: #475569; }
            `}</style>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={modalConfig.title} message={modalConfig.message} type={modalConfig.type} />
            <ConfirmModal
                isOpen={showConfirm}
                onClose={() => { if (confirmConfig.onCancel) confirmConfig.onCancel(); else setShowConfirm(false); }}
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
