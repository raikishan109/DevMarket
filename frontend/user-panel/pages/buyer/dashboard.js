import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { getUser } from '../../utils/auth';
import {
    FiShoppingBag, FiExternalLink, FiCalendar,
    FiDollarSign, FiGrid, FiPackage, FiCpu,
    FiZap, FiGlobe, FiSmartphone, FiArrowRight,
    FiMessageSquare, FiStar
} from 'react-icons/fi';

const CAT_META = {
    'AI Tools': { icon: '🤖', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
    'Automation': { icon: '⚡', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    'Websites': { icon: '🌐', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    'Mobile Apps': { icon: '📱', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
    'Other': { icon: '💡', color: '#ec4899', bg: 'rgba(236,72,153,0.15)' },
};

function StatCard({ icon, label, value, color, sub }) {
    return (
        <div style={{
            background: `linear-gradient(135deg, ${color}12, ${color}07)`,
            border: `1px solid ${color}28`,
            borderRadius: 20, padding: '22px 26px',
            display: 'flex', alignItems: 'center', gap: 18,
            position: 'relative', overflow: 'hidden',
        }}>
            <div style={{ position: 'absolute', top: -16, right: -16, width: 90, height: 90, borderRadius: '50%', background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ width: 50, height: 50, borderRadius: 14, background: `${color}18`, border: `1px solid ${color}38`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, fontSize: 22, flexShrink: 0 }}>
                {icon}
            </div>
            <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
                <p style={{ fontSize: 28, fontWeight: 900, color: 'white', margin: 0, lineHeight: 1 }}>{value}</p>
                {sub && <p style={{ fontSize: 12, color: '#475569', margin: '4px 0 0' }}>{sub}</p>}
            </div>
        </div>
    );
}

function PurchaseCard({ purchase }) {
    const [hovered, setHovered] = useState(false);
    const product = purchase.product;
    const cat = CAT_META[product?.category] || CAT_META['Other'];

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: hovered ? `linear-gradient(135deg, ${cat.color}0e, rgba(10,15,30,0.95))` : 'rgba(10,15,30,0.85)',
                border: `1px solid ${hovered ? cat.color + '40' : 'rgba(99,102,241,0.12)'}`,
                borderRadius: 20,
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: hovered ? `0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px ${cat.color}22` : '0 4px 16px rgba(0,0,0,0.2)',
                display: 'flex', flexDirection: 'column',
            }}
        >
            {/* Card Top Banner */}
            <div style={{
                padding: '22px 22px 18px',
                background: `linear-gradient(135deg, ${cat.color}18, ${cat.color}08)`,
                borderBottom: `1px solid ${cat.color}20`,
                position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: `radial-gradient(circle, ${cat.color}25 0%, transparent 70%)`, pointerEvents: 'none' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 36 }}>{cat.icon}</span>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '5px 12px', borderRadius: 999,
                        background: `${cat.color}22`, border: `1px solid ${cat.color}44`,
                        color: cat.color, fontSize: 11, fontWeight: 700,
                    }}>
                        {product?.category || 'Product'}
                    </span>
                </div>
                <h3 style={{
                    fontSize: 16, fontWeight: 800, color: 'white', margin: '12px 0 0',
                    lineHeight: 1.35,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                    {product?.name || 'Deleted Product'}
                </h3>
            </div>

            {/* Card Body */}
            <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14, flexGrow: 1 }}>
                {product?.problemSolved && (
                    <p style={{
                        fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: 0,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                        {product.problemSolved}
                    </p>
                )}

                {/* Meta row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: `1px solid rgba(99,102,241,0.1)` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569', fontSize: 12 }}>
                        <FiCalendar size={12} />
                        {new Date(purchase.purchaseDate || purchase.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#818cf8' }}>₹{purchase.amount}</div>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
                    {product?.accessLink ? (
                        <a
                            href={product.accessLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                padding: '12px', borderRadius: 12, textDecoration: 'none',
                                background: `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)`,
                                color: 'white', fontWeight: 700, fontSize: 14,
                                boxShadow: hovered ? `0 6px 20px ${cat.color}50` : 'none',
                                transition: 'box-shadow 0.3s',
                            }}
                        >
                            Access Product <FiExternalLink size={14} />
                        </a>
                    ) : (
                        <div style={{ padding: '12px', borderRadius: 12, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#475569', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
                            Link Unavailable
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Link href={`/products/${product?._id}`} style={{ flex: 1 }}>
                            <span style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                padding: '10px', borderRadius: 12,
                                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                                color: '#818cf8', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                            }}>
                                View Details
                            </span>
                        </Link>
                        {purchase.chatRoomId && (
                            <Link href={`/chat/${purchase.chatRoomId}`} style={{ flex: 1 }}>
                                <span style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                    padding: '10px', borderRadius: 12,
                                    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                                    color: '#10b981', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                                }}>
                                    <FiMessageSquare size={13} /> Chat
                                </span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BuyerDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const currentUser = getUser();
        if (!currentUser) { router.push('/login'); return; }
        setUser(currentUser);
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        try {
            const res = await api.get('/api/orders/my-purchases');
            if (res.data.success) setPurchases(res.data.orders);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const categories = ['all', ...new Set(purchases.map(p => p.product?.category).filter(Boolean))];
    const filtered = filter === 'all' ? purchases : purchases.filter(p => p.product?.category === filter);
    const totalSpent = purchases.reduce((s, p) => s + (p.amount || 0), 0);
    const uniqueCats = new Set(purchases.map(p => p.product?.category).filter(Boolean)).size;

    return (
        <Layout>
            <Head>
                <title>My Purchases – DevMarket</title>
                <meta name="description" content="Access all your purchased developer products on DevMarket." />
            </Head>

            {/* ── HERO ── */}
            <div style={{
                position: 'relative', overflow: 'hidden',
                background: 'linear-gradient(135deg, #020617 0%, #0d0a2e 60%, #0d1117 100%)',
                padding: '60px 5% 48px',
                borderBottom: '1px solid rgba(99,102,241,0.12)',
            }}>
                <div style={{ position: 'absolute', top: '-30%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-40%', left: '30%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, marginBottom: 18, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)' }}>
                        <FiShoppingBag size={13} color="#818cf8" />
                        <span style={{ fontSize: 12, color: '#818cf8', fontWeight: 600 }}>Buyer Dashboard</span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 900, color: 'white', margin: '0 0 10px', letterSpacing: '-1.5px', lineHeight: 1.1 }}>
                        My{' '}
                        <span style={{ background: 'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Purchases
                        </span>
                    </h1>
                    <p style={{ fontSize: 15, color: '#475569', margin: 0 }}>
                        Welcome back, <span style={{ color: '#94a3b8', fontWeight: 600 }}>{user?.name?.split(' ')[0]}</span> — access all your products below.
                    </p>
                </div>
            </div>

            <div style={{ background: '#070c18', minHeight: '60vh', padding: '36px 5% 80px' }}>

                {/* ── STATS ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 18, marginBottom: 36 }}>
                    <StatCard icon={<FiShoppingBag />} label="Total Purchases" value={purchases.length} color="#6366f1" sub="All time" />
                    <StatCard icon={<FiDollarSign />} label="Total Spent" value={`₹${totalSpent.toLocaleString()}`} color="#10b981" sub="Across all products" />
                    <StatCard icon={<FiGrid />} label="Categories" value={uniqueCats || '—'} color="#8b5cf6" sub="Types owned" />
                </div>

                {/* ── CATEGORY FILTER ── */}
                {categories.length > 1 && (
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
                        {categories.map(cat => {
                            const meta = cat === 'all' ? { icon: '🛍️', color: '#6366f1' } : CAT_META[cat] || CAT_META['Other'];
                            const count = cat === 'all' ? purchases.length : purchases.filter(p => p.product?.category === cat).length;
                            const active = filter === cat;
                            return (
                                <button key={cat} onClick={() => setFilter(cat)} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 7,
                                    padding: '9px 16px', borderRadius: 999, cursor: 'pointer',
                                    background: active ? `${meta.color}20` : 'rgba(10,15,30,0.7)',
                                    border: `1px solid ${active ? meta.color + '55' : 'rgba(99,102,241,0.12)'}`,
                                    color: active ? meta.color : '#64748b',
                                    fontWeight: 700, fontSize: 13, transition: 'all 0.2s',
                                    transform: active ? 'scale(1.04)' : 'scale(1)',
                                    boxShadow: active ? `0 4px 14px ${meta.color}30` : 'none',
                                }}>
                                    {meta.icon} {cat === 'all' ? 'All' : cat}
                                    <span style={{ padding: '1px 7px', borderRadius: 999, fontSize: 11, background: active ? `${meta.color}30` : 'rgba(99,102,241,0.1)', color: active ? meta.color : '#475569' }}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* ── CONTENT ── */}
                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} style={{
                                height: 360, borderRadius: 20,
                                background: 'linear-gradient(90deg, rgba(99,102,241,0.04) 25%, rgba(99,102,241,0.08) 50%, rgba(99,102,241,0.04) 75%)',
                                backgroundSize: '200% 100%',
                                animation: 'shimmer 1.5s infinite',
                            }} />
                        ))}
                    </div>
                ) : filtered.length > 0 ? (
                    <>
                        <p style={{ color: '#475569', fontSize: 13, marginBottom: 20 }}>
                            Showing <span style={{ color: '#818cf8', fontWeight: 700 }}>{filtered.length}</span> product{filtered.length !== 1 ? 's' : ''}
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
                            {filtered.map(purchase => (
                                <PurchaseCard key={purchase._id} purchase={purchase} />
                            ))}
                        </div>
                    </>
                ) : purchases.length === 0 ? (
                    /* No purchases at all */
                    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                        <div style={{ width: 90, height: 90, borderRadius: '50%', margin: '0 auto 28px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                            🛍️
                        </div>
                        <h3 style={{ fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 10 }}>No purchases yet</h3>
                        <p style={{ color: '#475569', marginBottom: 32, fontSize: 15 }}>Explore the marketplace and find your first tool!</p>
                        <Link href="/marketplace">
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 10,
                                padding: '14px 32px', borderRadius: 14,
                                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer',
                                boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
                            }}>Browse Marketplace <FiArrowRight /></span>
                        </Link>
                    </div>
                ) : (
                    /* No results for this filter */
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <p style={{ color: '#475569', fontSize: 15, marginBottom: 16 }}>No purchases in this category</p>
                        <button onClick={() => setFilter('all')} style={{ padding: '11px 24px', borderRadius: 12, border: 'none', background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontWeight: 700, cursor: 'pointer' }}>
                            Show All
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes shimmer {
                    0%   { background-position: -200% 0; }
                    100% { background-position:  200% 0; }
                }
            `}</style>
        </Layout>
    );
}
