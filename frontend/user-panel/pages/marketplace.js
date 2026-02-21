import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import api from '../utils/api';
import { FiSearch, FiStar, FiPackage, FiZap, FiCode, FiSmartphone, FiGlobe, FiCpu, FiGrid, FiShoppingBag } from 'react-icons/fi';

const CATEGORY_META = {
    all: { icon: <FiGrid />, color: '#6366f1', label: 'All Products' },
    'AI Tools': { icon: <FiCpu />, color: '#8b5cf6', label: 'AI Tools' },
    'Automation': { icon: <FiZap />, color: '#f59e0b', label: 'Automation' },
    'Websites': { icon: <FiGlobe />, color: '#10b981', label: 'Websites' },
    'Mobile Apps': { icon: <FiSmartphone />, color: '#3b82f6', label: 'Mobile Apps' },
    'Other': { icon: <FiPackage />, color: '#ec4899', label: 'Other' },
};

const SORT_OPTIONS = [
    { value: 'newest', label: '🕐 Newest' },
    { value: 'price-low', label: '💰 Price: Low to High' },
    { value: 'price-high', label: '💎 Price: High to Low' },
    { value: 'rating', label: '⭐ Top Rated' },
    { value: 'popular', label: '🔥 Most Popular' },
];

function ProductCard({ product, isPurchased }) {
    const [hovered, setHovered] = useState(false);
    const cat = CATEGORY_META[product.category] || CATEGORY_META['Other'];

    return (
        <Link href={`/products/${product._id}`}>
            <div
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                    background: hovered
                        ? `linear-gradient(135deg, ${cat.color}15, rgba(17,17,28,1))`
                        : 'rgba(13,13,20,0.97)',
                    border: hovered ? `1px solid ${cat.color}60` : '1px solid rgba(124,58,237,0.18)',
                    borderRadius: 20,
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                    transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
                    boxShadow: hovered ? `0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px ${cat.color}33` : '0 4px 16px rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                    backdropFilter: 'blur(12px)',
                    height: '100%',
                    boxSizing: 'border-box',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Glow top-right */}
                <div style={{
                    position: 'absolute', top: 0, right: 0, width: 120, height: 120,
                    background: `radial-gradient(circle, ${cat.color}22 0%, transparent 70%)`,
                    pointerEvents: 'none',
                    transition: 'opacity 0.3s',
                    opacity: hovered ? 1 : 0,
                }} />

                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    {/* Category pill */}
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '4px 12px', borderRadius: 999,
                        background: `${cat.color}22`, border: `1px solid ${cat.color}44`,
                        color: cat.color, fontSize: 12, fontWeight: 700,
                    }}>
                        {cat.icon} {product.category}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {isPurchased && (
                            <span style={{
                                padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                                background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)',
                                color: '#10b981',
                            }}>✓ Owned</span>
                        )}
                        {product.averageRating > 0 && (
                            <span style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                                color: '#f59e0b',
                            }}>
                                <FiStar size={11} fill="currentColor" /> {product.averageRating}
                            </span>
                        )}
                    </div>
                </div>

                {/* Title */}
                <h3 style={{
                    fontSize: 18, fontWeight: 800, color: '#f1f5f9',
                    lineHeight: 1.3, margin: 0,
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                    {product.name}
                </h3>

                {/* Problem */}
                <div style={{
                    background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
                    borderRadius: 10, padding: '10px 14px',
                }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#f87171', marginBottom: 4, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Problem</p>
                    <p style={{
                        fontSize: 13, color: '#94a3b8', lineHeight: 1.5, margin: 0,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                        {product.problemSolved}
                    </p>
                </div>

                {/* Solution */}
                <div style={{
                    background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)',
                    borderRadius: 10, padding: '10px 14px', flexGrow: 1,
                }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#34d399', marginBottom: 4, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Solution</p>
                    <p style={{
                        fontSize: 13, color: '#94a3b8', lineHeight: 1.5, margin: 0,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                        {product.solution}
                    </p>
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <div>
                        <p style={{ fontSize: 26, fontWeight: 900, color: '#a78bfa', margin: 0 }}>₹{product.price}</p>
                        <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>One-time payment</p>
                    </div>
                    <div style={{
                        padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700,
                        background: isPurchased ? 'rgba(16,185,129,0.2)' : `linear-gradient(135deg, #6366f1, #8b5cf6)`,
                        color: isPurchased ? '#34d399' : 'white',
                        border: isPurchased ? '1px solid rgba(16,185,129,0.4)' : 'none',
                        transition: 'all 0.2s',
                        boxShadow: hovered && !isPurchased ? '0 4px 16px rgba(99,102,241,0.5)' : 'none',
                    }}>
                        {isPurchased ? '✓ View' : 'Buy Now →'}
                    </div>
                </div>

                {product.sales > 0 && (
                    <p style={{ fontSize: 11, color: '#475569', margin: 0, textAlign: 'right' }}>
                        🔥 {product.sales} {product.sales === 1 ? 'sale' : 'sales'}
                    </p>
                )}
            </div>
        </Link>
    );
}

export default function Marketplace() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [purchasedProductIds, setPurchasedProductIds] = useState([]);
    const [searchFocused, setSearchFocused] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const [, purchasedRes] = await Promise.all([
                        fetch('/api/auth/me'),
                        api.get('/api/orders/my-purchases')
                    ]);
                    if (purchasedRes?.data?.success) {
                        setPurchasedProductIds(purchasedRes.data.orders.map(o => o.product._id || o.product));
                    }
                }
            } catch { }
        })();
        fetchProducts();
    }, []);

    useEffect(() => {
        let filtered = [...products];
        if (selectedCategory !== 'all') filtered = filtered.filter(p => p.category === selectedCategory);
        if (searchTerm) filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.problemSolved?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.solution?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        switch (sortBy) {
            case 'price-low': filtered.sort((a, b) => a.price - b.price); break;
            case 'price-high': filtered.sort((a, b) => b.price - a.price); break;
            case 'rating': filtered.sort((a, b) => b.averageRating - a.averageRating); break;
            case 'popular': filtered.sort((a, b) => b.sales - a.sales); break;
            default: filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        setFilteredProducts(filtered);
    }, [products, searchTerm, selectedCategory, sortBy]);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/api/products');
            if (res.data.success) setProducts(res.data.products);
        } catch { } finally { setLoading(false); }
    };

    const totalRevenue = products.reduce((s, p) => s + (p.price * (p.sales || 0)), 0);

    return (
        <Layout>
            <Head>
                <title>Marketplace – DevMarket</title>
                <meta name="description" content="Browse developer tools, AI automation, websites & mobile apps built by Indian developers." />
            </Head>

            {/* ── HERO ── */}
            <div style={{
                position: 'relative', overflow: 'hidden',
                background: '#0d0d14',
                padding: '72px 5% 56px',
                borderBottom: '1px solid rgba(124,58,237,0.18)',
            }}>
                {/* Floating orbs */}
                {[
                    { top: '-20%', left: '-5%', w: 500, h: 500, c: 'rgba(124,58,237,0.20)' },
                    { top: '30%', right: '-8%', w: 400, h: 400, c: 'rgba(139,92,246,0.16)' },
                    { bottom: '-30%', left: '40%', w: 320, h: 320, c: 'rgba(88,28,235,0.12)' },
                ].map((o, i) => (
                    <div key={i} style={{
                        position: 'absolute', ...o, borderRadius: '50%',
                        background: `radial-gradient(circle, ${o.c} 0%, transparent 70%)`,
                        width: o.w, height: o.h, pointerEvents: 'none',
                    }} />
                ))}

                <div style={{ position: 'relative', zIndex: 1, maxWidth: 900 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '6px 16px', borderRadius: 999, marginBottom: 20,
                        background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.35)',
                    }}>
                        <FiShoppingBag size={14} color="#a78bfa" />
                        <span style={{ fontSize: 13, color: '#a78bfa', fontWeight: 600 }}>Developer Marketplace</span>
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 900, color: 'white',
                        lineHeight: 1.1, margin: '0 0 16px', letterSpacing: '-2px',
                    }}>
                        Discover Premium{' '}
                        <span style={{
                            background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>Dev Products</span>
                    </h1>

                    <p style={{ fontSize: 17, color: '#8b8fa8', maxWidth: 560, lineHeight: 1.7, margin: '0 0 36px' }}>
                        Curated tools, automation scripts, websites & AI solutions — built by Indian developers, for developers.
                    </p>

                    {/* Stats bar */}
                    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                        {[
                            { label: 'Products', value: products.length },
                            { label: 'Categories', value: Object.keys(CATEGORY_META).length - 1 },
                            { label: 'Total Sales', value: products.reduce((s, p) => s + (p.sales || 0), 0) },
                        ].map((stat, i) => (
                            <div key={i}>
                                <p style={{ fontSize: 28, fontWeight: 900, color: '#a78bfa', margin: 0 }}>{stat.value}</p>
                                <p style={{ fontSize: 12, color: '#6b7280', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── MAIN ── */}
            <div style={{ background: '#0d0d14', minHeight: '60vh', padding: '40px 5% 80px' }}>

                {/* Search */}
                <div style={{ maxWidth: 680, margin: '0 auto 32px', position: 'relative' }}>
                    <FiSearch style={{
                        position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
                        color: searchFocused ? '#818cf8' : '#475569', fontSize: 20, transition: 'color 0.2s',
                    }} />
                    <input
                        type="text"
                        placeholder="Search by name, problem or solution..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        style={{
                            width: '100%', padding: '16px 20px 16px 54px',
                            background: searchFocused ? 'rgba(124,58,237,0.1)' : 'rgba(17,17,28,0.95)',
                            border: searchFocused ? '1px solid rgba(124,58,237,0.55)' : '1px solid rgba(124,58,237,0.18)',
                            borderRadius: 16, color: 'white', fontSize: 15, outline: 'none',
                            boxSizing: 'border-box', transition: 'all 0.25s',
                            boxShadow: searchFocused ? '0 0 0 4px rgba(124,58,237,0.12)' : 'none',
                        }}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            style={{
                                position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                                background: 'rgba(99,102,241,0.2)', border: 'none', color: '#818cf8',
                                borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                            }}>✕</button>
                    )}
                </div>

                {/* Category tabs */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 32, justifyContent: 'center' }}>
                    {Object.entries(CATEGORY_META).map(([key, meta]) => {
                        const count = key === 'all' ? products.length : products.filter(p => p.category === key).length;
                        const active = selectedCategory === key;
                        return (
                            <button
                                key={key}
                                onClick={() => setSelectedCategory(key)}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                    padding: '10px 18px', borderRadius: 999, fontSize: 13, fontWeight: 700,
                                    background: active ? `${meta.color}22` : 'rgba(17,17,28,0.8)',
                                    border: active ? `1px solid ${meta.color}66` : '1px solid rgba(124,58,237,0.15)',
                                    color: active ? meta.color : '#9ca3af',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    transform: active ? 'scale(1.04)' : 'scale(1)',
                                    boxShadow: active ? `0 4px 16px ${meta.color}33` : 'none',
                                }}
                            >
                                <span style={{ fontSize: 15 }}>{meta.icon}</span>
                                {meta.label}
                                <span style={{
                                    padding: '1px 7px', borderRadius: 999, fontSize: 11,
                                    background: active ? `${meta.color}33` : 'rgba(99,102,241,0.1)',
                                    color: active ? meta.color : '#475569',
                                }}>{count}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Toolbar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                    <p style={{ color: '#475569', fontSize: 14, margin: 0 }}>
                        Showing{' '}
                        <span style={{ color: '#818cf8', fontWeight: 700 }}>{filteredProducts.length}</span>
                        {' '}of{' '}
                        <span style={{ color: '#818cf8', fontWeight: 700 }}>{products.length}</span>
                        {' '}products
                        {searchTerm && <span style={{ color: '#64748b' }}> for "<span style={{ color: '#c084fc' }}>{searchTerm}</span>"</span>}
                    </p>
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        style={{
                            padding: '9px 16px',
                            background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.2)',
                            borderRadius: 12, color: '#c7d2fe', fontSize: 13, fontWeight: 600, outline: 'none', cursor: 'pointer',
                        }}
                    >
                        {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} style={{ background: '#0f172a' }}>{o.label}</option>)}
                    </select>
                </div>

                {/* Grid */}
                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} style={{
                                height: 360, borderRadius: 20,
                                background: 'linear-gradient(90deg, rgba(99,102,241,0.05) 25%, rgba(99,102,241,0.1) 50%, rgba(99,102,241,0.05) 75%)',
                                backgroundSize: '200% 100%',
                                animation: 'shimmer 1.5s infinite',
                            }} />
                        ))}
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                        {filteredProducts.map(product => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                isPurchased={purchasedProductIds.includes(product._id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 24px',
                            background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 36,
                        }}>🔍</div>
                        <h3 style={{ fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 10 }}>No products found</h3>
                        <p style={{ color: '#475569', marginBottom: 24 }}>
                            {searchTerm ? `No results for "${searchTerm}"` : `No products in "${CATEGORY_META[selectedCategory]?.label}" yet`}
                        </p>
                        <button
                            onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                            style={{
                                padding: '12px 28px', borderRadius: 12, border: 'none', cursor: 'pointer',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontWeight: 700, fontSize: 14,
                            }}
                        >Clear Filters</button>
                    </div>
                )}
            </div>

            <style>{`
                input::placeholder { color: #334155; }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </Layout>
    );
}
