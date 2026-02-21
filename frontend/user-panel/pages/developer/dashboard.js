import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { getUser } from '../../utils/auth';
import { useToast } from '../../contexts/ToastContext';
import {
    FiPlus, FiTrash2, FiDollarSign, FiPackage,
    FiTrendingUp, FiX, FiCode, FiCpu, FiZap,
    FiGlobe, FiSmartphone, FiExternalLink, FiCheck,
    FiClock, FiAlertCircle, FiEye, FiTag, FiLink
} from 'react-icons/fi';

const CATEGORIES = [
    { label: 'AI Tools', icon: <FiCpu />, color: '#8b5cf6' },
    { label: 'Automation', icon: <FiZap />, color: '#f59e0b' },
    { label: 'Websites', icon: <FiGlobe />, color: '#10b981' },
    { label: 'Mobile Apps', icon: <FiSmartphone />, color: '#3b82f6' },
    { label: 'Other', icon: <FiPackage />, color: '#ec4899' },
];

const STATUS_CONFIG = {
    approved: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)', icon: <FiCheck size={11} />, label: 'Approved' },
    pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', icon: <FiClock size={11} />, label: 'Pending' },
    rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)', icon: <FiAlertCircle size={11} />, label: 'Rejected' },
    removed: { color: '#64748b', bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.35)', icon: <FiX size={11} />, label: 'Removed' },
};

function StatCard({ icon, label, value, color, sub }) {
    return (
        <div style={{
            background: `linear-gradient(135deg, ${color}14, ${color}08)`,
            border: `1px solid ${color}30`,
            borderRadius: 20, padding: '24px 28px',
            display: 'flex', alignItems: 'center', gap: 20,
            position: 'relative', overflow: 'hidden',
        }}>
            <div style={{
                position: 'absolute', top: -20, right: -20, width: 100, height: 100,
                borderRadius: '50%', background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
                pointerEvents: 'none',
            }} />
            <div style={{
                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                background: `${color}20`, border: `1px solid ${color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: color, fontSize: 22,
            }}>{icon}</div>
            <div>
                <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{label}</p>
                <p style={{ fontSize: 30, fontWeight: 900, color: 'white', margin: 0, lineHeight: 1 }}>{value}</p>
                {sub && <p style={{ fontSize: 12, color: '#475569', margin: '4px 0 0' }}>{sub}</p>}
            </div>
        </div>
    );
}

const EMPTY_FORM = {
    name: '', category: 'AI Tools', problemSolved: '',
    solution: '', targetAudience: '', features: '',
    price: '', demoLink: '', accessLink: ''
};

export default function DeveloperDashboard() {
    const router = useRouter();
    const toast = useToast();
    const formRef = useRef(null);

    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [sales, setSales] = useState([]);
    const [stats, setStats] = useState({ totalProducts: 0, totalEarnings: 0, totalSales: 0 });
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [platformCommission, setPlatformCommission] = useState(10);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [featureInput, setFeatureInput] = useState('');
    const [featureList, setFeatureList] = useState([]);

    useEffect(() => {
        const currentUser = getUser();
        if (!currentUser) { router.push('/login'); return; }
        setUser(currentUser);
        fetchData();
    }, []);

    useEffect(() => {
        if (showForm && formRef.current) {
            setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        }
    }, [showForm]);

    const fetchData = async () => {
        try {
            const [productsRes, salesRes, settingsRes] = await Promise.all([
                api.get('/api/products/developer/my-products'),
                api.get('/api/orders/my-sales'),
                api.get('/api/admin/settings').catch(() => ({ data: { success: false } }))
            ]);
            if (settingsRes.data.success && settingsRes.data.settings)
                setPlatformCommission(settingsRes.data.settings.platformCommission);
            if (productsRes.data.success) {
                setProducts(productsRes.data.products);
                setStats(p => ({ ...p, totalProducts: productsRes.data.count }));
            }
            if (salesRes.data.success) {
                setSales(salesRes.data.orders);
                setStats(p => ({ ...p, totalSales: salesRes.data.count, totalEarnings: salesRes.data.totalEarnings }));
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const addFeature = () => {
        const f = featureInput.trim();
        if (f && !featureList.includes(f)) { setFeatureList(p => [...p, f]); setFeatureInput(''); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/api/products', {
                ...formData,
                features: featureList,
                price: Number(formData.price)
            });
            toast.success('🎉 Product submitted for approval!');
            setShowForm(false);
            setFormData(EMPTY_FORM);
            setFeatureList([]);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error creating product');
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        const confirmed = await toast.confirm('Delete this product? This cannot be undone.');
        if (!confirmed) return;
        try {
            await api.delete(`/api/products/${id}`);
            toast.success('Product deleted');
            fetchData();
        } catch { toast.error('Error deleting product'); }
    };

    const selectedCatMeta = CATEGORIES.find(c => c.label === formData.category) || CATEGORIES[0];
    const basePrice = Number(formData.price) || 0;
    const fee = (basePrice * platformCommission) / 100;
    const customerPrice = basePrice + fee;

    const s = {
        page: { background: '#070c18', minHeight: '100vh' },
        section: { padding: '0 5% 80px' },
        label: { display: 'block', fontSize: 12, fontWeight: 700, color: '#818cf8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' },
        input: (focused) => ({
            width: '100%', padding: '13px 16px', borderRadius: 12, outline: 'none', boxSizing: 'border-box',
            background: 'rgba(15,23,42,0.8)', border: `1px solid ${focused ? 'rgba(129,140,248,0.6)' : 'rgba(99,102,241,0.15)'}`,
            color: 'white', fontSize: 14,
            transition: 'border-color 0.2s',
            boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
        }),
    };

    function FormInput({ label, ...props }) {
        const [focused, setFocused] = useState(false);
        const isTextarea = props.as === 'textarea';
        const Tag = isTextarea ? 'textarea' : props.as === 'select' ? 'select' : 'input';
        const { as, children, ...rest } = props;
        return (
            <div>
                <label style={s.label}>{label}</label>
                <Tag
                    {...rest}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={s.input(focused)}
                >{children}</Tag>
            </div>
        );
    }

    return (
        <Layout>
            <Head><title>Seller Dashboard – DevMarket</title></Head>

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
                        <FiCode size={13} color="#818cf8" />
                        <span style={{ fontSize: 12, color: '#818cf8', fontWeight: 600 }}>Developer Console</span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 900, color: 'white', margin: '0 0 10px', letterSpacing: '-1.5px', lineHeight: 1.1 }}>
                        Welcome back,{' '}
                        <span style={{ background: 'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {user?.name?.split(' ')[0] || 'Developer'}
                        </span>
                    </h1>
                    <p style={{ fontSize: 15, color: '#475569', margin: 0 }}>Manage your products, track earnings and monitor performance.</p>
                </div>
            </div>

            <div style={s.section}>
                {/* ── STATS ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20, padding: '36px 0 32px' }}>
                    <StatCard icon={<FiPackage />} label="Total Products" value={stats.totalProducts} color="#6366f1" sub={`${products.filter(p => p.status === 'approved').length} approved`} />
                    <StatCard icon={<FiTrendingUp />} label="Total Sales" value={stats.totalSales} color="#10b981" sub="Cumulative orders" />
                    <StatCard icon={<FiDollarSign />} label="Total Earnings" value={`₹${stats.totalEarnings}`} color="#8b5cf6" sub="After platform fee" />
                </div>

                {/* ── ADD PRODUCT BUTTON ── */}
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 10,
                            padding: '14px 28px', borderRadius: 14, border: 'none', cursor: 'pointer',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: 'white', fontWeight: 700, fontSize: 15,
                            boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
                            transition: 'all 0.2s', marginBottom: 36,
                        }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 32px rgba(99,102,241,0.5)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.35)'}
                    >
                        <FiPlus size={20} /> List a New Product
                    </button>
                )}

                {/* ── PRODUCT FORM ── */}
                {showForm && (
                    <div ref={formRef} style={{
                        background: 'rgba(10,15,30,0.95)',
                        border: '1px solid rgba(99,102,241,0.2)',
                        borderRadius: 24, padding: '36px', marginBottom: 40,
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
                    }}>
                        {/* Form Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                            <div>
                                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', margin: 0, marginBottom: 4 }}>📦 List New Product</h2>
                                <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>Fill in the details below — your product will be reviewed by admin before going live.</p>
                            </div>
                            <button onClick={() => setShowForm(false)} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', cursor: 'pointer' }}>
                                <FiX size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Section 1: Basic Info */}
                            <div style={{ marginBottom: 28 }}>
                                <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                                    — Basic Information
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <FormInput label="Product Name *" type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. AI LinkedIn Post Generator" required />
                                    </div>

                                    {/* Category selector */}
                                    <div>
                                        <label style={s.label}>Category *</label>
                                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                            {CATEGORIES.map(cat => (
                                                <button
                                                    key={cat.label} type="button"
                                                    onClick={() => setFormData({ ...formData, category: cat.label })}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: 7,
                                                        padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
                                                        background: formData.category === cat.label ? `${cat.color}22` : 'rgba(15,23,42,0.6)',
                                                        border: `1px solid ${formData.category === cat.label ? cat.color + '66' : 'rgba(99,102,241,0.1)'}`,
                                                        color: formData.category === cat.label ? cat.color : '#475569',
                                                        fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
                                                    }}
                                                >
                                                    {cat.icon} {cat.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <FormInput label="Target Audience *" type="text" value={formData.targetAudience} onChange={e => setFormData({ ...formData, targetAudience: e.target.value })} placeholder="e.g. Freelancers, Startup founders" required />
                                </div>
                            </div>

                            {/* Section 2: Problem & Solution */}
                            <div style={{ marginBottom: 28 }}>
                                <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                                    — Problem & Solution
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                    <div>
                                        <label style={{ ...s.label, color: '#f87171' }}>❌ Problem Solved *</label>
                                        <div style={{ position: 'relative' }}>
                                            <textarea
                                                value={formData.problemSolved}
                                                onChange={e => setFormData({ ...formData, problemSolved: e.target.value })}
                                                rows={4} required
                                                placeholder="What pain point does your product address?"
                                                style={{ ...s.input(false), resize: 'vertical', background: 'rgba(239,68,68,0.04)', borderColor: 'rgba(239,68,68,0.2)' }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ ...s.label, color: '#34d399' }}>✅ Your Solution *</label>
                                        <textarea
                                            value={formData.solution}
                                            onChange={e => setFormData({ ...formData, solution: e.target.value })}
                                            rows={4} required
                                            placeholder="How does your product solve that problem?"
                                            style={{ ...s.input(false), resize: 'vertical', background: 'rgba(16,185,129,0.04)', borderColor: 'rgba(16,185,129,0.2)' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Features */}
                            <div style={{ marginBottom: 28 }}>
                                <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                                    — Features & Links
                                </p>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={s.label}><FiTag style={{ display: 'inline', marginRight: 4 }} />Features</label>
                                    <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                                        <input
                                            type="text" value={featureInput}
                                            onChange={e => setFeatureInput(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                                            placeholder="Type a feature and press Enter or click Add"
                                            style={{ ...s.input(false), flex: 1 }}
                                        />
                                        <button type="button" onClick={addFeature} style={{ padding: '0 20px', borderRadius: 10, background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>+ Add</button>
                                    </div>
                                    {featureList.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                            {featureList.map((f, i) => (
                                                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#c7d2fe', fontSize: 13, fontWeight: 600 }}>
                                                    {f}
                                                    <button type="button" onClick={() => setFeatureList(p => p.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', padding: 0, lineHeight: 1 }}>×</button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                    <div>
                                        <label style={s.label}><FiLink style={{ display: 'inline', marginRight: 4 }} />Demo Link</label>
                                        <input type="url" value={formData.demoLink} onChange={e => setFormData({ ...formData, demoLink: e.target.value })} placeholder="https://demo.example.com" style={s.input(false)} />
                                    </div>
                                    <div>
                                        <label style={{ ...s.label, color: '#f59e0b' }}><FiLink style={{ display: 'inline', marginRight: 4 }} />Access Link *</label>
                                        <input type="url" value={formData.accessLink} onChange={e => setFormData({ ...formData, accessLink: e.target.value })} placeholder="https://product.example.com" style={s.input(false)} required />
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Pricing */}
                            <div style={{ marginBottom: 32 }}>
                                <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                                    — Pricing
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start' }}>
                                    <div>
                                        <label style={s.label}>Your Earnings Price (₹) *</label>
                                        <input
                                            type="number" value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                            min="0" step="1" placeholder="Amount you'll receive per sale"
                                            style={{ ...s.input(false), fontSize: 20, fontWeight: 700, color: '#818cf8' }}
                                            required
                                        />
                                        <p style={{ fontSize: 12, color: '#475569', margin: '6px 0 0' }}>Platform fee of {platformCommission}% will be added on top</p>
                                    </div>

                                    {basePrice > 0 && (
                                        <div style={{
                                            background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                                            borderRadius: 16, padding: '20px 24px', minWidth: 220,
                                        }}>
                                            <p style={{ fontSize: 11, color: '#818cf8', fontWeight: 700, margin: '0 0 12px', textTransform: 'uppercase' }}>💰 Price Breakdown</p>
                                            {[
                                                { label: 'Your Earnings', value: `₹${basePrice.toFixed(0)}`, color: '#818cf8' },
                                                { label: `Platform Fee (${platformCommission}%)`, value: `+₹${fee.toFixed(0)}`, color: '#f59e0b' },
                                            ].map((row, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                                                    <span style={{ color: '#64748b' }}>{row.label}</span>
                                                    <span style={{ fontWeight: 700, color: row.color }}>{row.value}</span>
                                                </div>
                                            ))}
                                            <div style={{ borderTop: '1px solid rgba(99,102,241,0.2)', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontWeight: 700, color: 'white', fontSize: 14 }}>Customer Pays</span>
                                                <span style={{ fontWeight: 900, color: '#34d399', fontSize: 18 }}>₹{customerPrice.toFixed(0)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div style={{ display: 'flex', gap: 14 }}>
                                <button
                                    type="submit" disabled={submitting}
                                    style={{
                                        flex: 1, padding: '15px', borderRadius: 14, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                                        background: submitting ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        color: 'white', fontWeight: 700, fontSize: 15,
                                        boxShadow: submitting ? 'none' : '0 8px 24px rgba(99,102,241,0.35)',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {submitting ? '⏳ Submitting...' : '🚀 Submit for Approval'}
                                </button>
                                <button
                                    type="button" onClick={() => { setShowForm(false); setFormData(EMPTY_FORM); setFeatureList([]); }}
                                    style={{ padding: '15px 28px', borderRadius: 14, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.2)', color: '#64748b', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── MY PRODUCTS ── */}
                <div style={{ background: 'rgba(10,15,30,0.8)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 20, overflow: 'hidden', marginBottom: 32 }}>
                    <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(99,102,241,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'white', margin: 0 }}>My Products</h2>
                        <span style={{ fontSize: 13, color: '#475569', background: 'rgba(99,102,241,0.1)', padding: '4px 12px', borderRadius: 999, border: '1px solid rgba(99,102,241,0.2)' }}>
                            {products.length} total
                        </span>
                    </div>

                    {loading ? (
                        <div style={{ padding: 40, textAlign: 'center' }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{ height: 56, borderRadius: 10, background: 'rgba(99,102,241,0.05)', marginBottom: 12 }} />
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(99,102,241,0.05)' }}>
                                        {['Product', 'Category', 'Price', 'Status', 'Sales', 'Actions'].map(h => (
                                            <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product, i) => {
                                        const st = STATUS_CONFIG[product.status] || STATUS_CONFIG.pending;
                                        const catMeta = CATEGORIES.find(c => c.label === product.category) || CATEGORIES[4];
                                        return (
                                            <tr key={product._id} style={{ borderTop: '1px solid rgba(99,102,241,0.07)', transition: 'background 0.15s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.04)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <td style={{ padding: '16px 20px' }}>
                                                    <p style={{ fontSize: 14, fontWeight: 700, color: 'white', margin: 0, lineHeight: 1.3 }}>{product.name}</p>
                                                </td>
                                                <td style={{ padding: '16px 20px' }}>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: catMeta.color, background: `${catMeta.color}15`, padding: '4px 11px', borderRadius: 999, border: `1px solid ${catMeta.color}30` }}>
                                                        {catMeta.icon} {product.category}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px 20px', fontSize: 15, fontWeight: 800, color: '#818cf8' }}>₹{product.price}</td>
                                                <td style={{ padding: '16px 20px' }}>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: st.color, background: st.bg, border: `1px solid ${st.border}`, padding: '4px 12px', borderRadius: 999 }}>
                                                        {st.icon} {st.label}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px 20px', fontSize: 14, color: '#64748b', fontWeight: 600 }}>
                                                    {product.sales > 0 ? <span style={{ color: '#10b981' }}>🔥 {product.sales}</span> : '—'}
                                                </td>
                                                <td style={{ padding: '16px 20px' }}>
                                                    <div style={{ display: 'flex', gap: 10 }}>
                                                        <Link href={`/products/${product._id}`}>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 9, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                                                                <FiEye size={13} /> View
                                                            </span>
                                                        </Link>
                                                        <button onClick={() => handleDelete(product._id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 9, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 13, cursor: 'pointer' }}>
                                                            <FiTrash2 size={13} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ padding: '64px 20px', textAlign: 'center' }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
                            <h3 style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 8 }}>No products yet</h3>
                            <p style={{ color: '#475569', marginBottom: 24 }}>List your first product and start earning today!</p>
                            <button onClick={() => setShowForm(true)} style={{ padding: '12px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
                                + Add Your First Product
                            </button>
                        </div>
                    )}
                </div>

                {/* ── RECENT SALES ── */}
                {sales.length > 0 && (
                    <div style={{ background: 'rgba(10,15,30,0.8)', border: '1px solid rgba(16,185,129,0.12)', borderRadius: 20, overflow: 'hidden' }}>
                        <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(16,185,129,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'white', margin: 0 }}>🔥 Recent Sales</h2>
                            <span style={{ fontSize: 13, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '4px 12px', borderRadius: 999, border: '1px solid rgba(16,185,129,0.2)', fontWeight: 700 }}>
                                {stats.totalSales} total
                            </span>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(16,185,129,0.04)' }}>
                                        {['Product', 'Buyer', 'Amount', 'Date'].map(h => (
                                            <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sales.slice(0, 8).map((sale) => (
                                        <tr key={sale._id} style={{ borderTop: '1px solid rgba(16,185,129,0.06)' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.03)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{sale.product?.name || '—'}</td>
                                            <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748b' }}>{sale.buyer?.name || '—'}</td>
                                            <td style={{ padding: '14px 20px', fontSize: 15, fontWeight: 800, color: '#10b981' }}>₹{sale.developerAmount || sale.amount}</td>
                                            <td style={{ padding: '14px 20px', fontSize: 12, color: '#475569' }}>{new Date(sale.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                input::placeholder, textarea::placeholder { color: #334155; }
                select option { background: #0f172a; color: white; }
            `}</style>
        </Layout>
    );
}
