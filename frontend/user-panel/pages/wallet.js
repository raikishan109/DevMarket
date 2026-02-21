import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../components/Layout';
import api from '../utils/api';
import { getUser } from '../utils/auth';
import {
    FiDollarSign, FiTrendingUp, FiTrendingDown, FiClock,
    FiPlus, FiArrowUpCircle, FiX, FiCopy, FiCheck,
    FiArrowDownLeft, FiArrowUpRight, FiRefreshCw, FiShield
} from 'react-icons/fi';

const INR_TO_USDT = 88;
const INR_TO_USDC = 88;

/* ─── Small helpers ─── */
function StatMini({ label, value, color }) {
    return (
        <div style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)', borderRadius: 14, padding: '14px 18px', flex: 1 }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: color || 'white', margin: 0 }}>{value}</p>
        </div>
    );
}

function DInput({ label, labelColor, ...props }) {
    const [focused, setFocused] = useState(false);
    const Tag = props.as === 'select' ? 'select' : 'input';
    const { as, children, ...rest } = props;
    return (
        <div>
            {label && <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: labelColor || '#818cf8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>}
            <Tag
                {...rest}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{
                    width: '100%', padding: '13px 16px', borderRadius: 12, outline: 'none', boxSizing: 'border-box',
                    background: 'rgba(15,23,42,0.9)', border: `1px solid ${focused ? 'rgba(129,140,248,0.6)' : 'rgba(99,102,241,0.18)'}`,
                    color: 'white', fontSize: 14, transition: 'border-color 0.2s',
                    boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
                }}
            >{children}</Tag>
        </div>
    );
}

/* ─── Modal shell ─── */
function Modal({ title, subtitle, icon, onClose, children }) {
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 20 }}>
            <div style={{ background: 'linear-gradient(135deg,#0a0f1e,#0d0a2e)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 24, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
                <div style={{ padding: '28px 28px 20px', borderBottom: '1px solid rgba(99,102,241,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', fontSize: 20 }}>{icon}</div>
                        <div>
                            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'white', margin: 0 }}>{title}</h3>
                            {subtitle && <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>{subtitle}</p>}
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', cursor: 'pointer', flexShrink: 0 }}>
                        <FiX size={16} />
                    </button>
                </div>
                <div style={{ padding: '24px 28px 28px' }}>{children}</div>
            </div>
        </div>
    );
}

/* ─── Payment type picker ─── */
function PayTypePicker({ value, onChange }) {
    const opts = [
        { v: 'crypto', icon: '₿', label: 'Crypto', sub: 'USDT / USDC' },
        { v: 'upi', icon: '📱', label: 'UPI', sub: 'Coming Soon', disabled: true },
    ];
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {opts.map(o => (
                <button key={o.v} type="button" disabled={o.disabled} onClick={() => !o.disabled && onChange(o.v)} style={{
                    padding: '16px 12px', borderRadius: 14, border: `1px solid ${value === o.v ? 'rgba(129,140,248,0.5)' : 'rgba(99,102,241,0.15)'}`,
                    background: value === o.v ? 'rgba(99,102,241,0.15)' : 'rgba(15,23,42,0.7)',
                    color: o.disabled ? '#334155' : value === o.v ? 'white' : '#64748b',
                    cursor: o.disabled ? 'not-allowed' : 'pointer', transition: 'all 0.2s', textAlign: 'center',
                    transform: value === o.v ? 'scale(1.02)' : 'scale(1)',
                }}>
                    <div style={{ fontSize: 26, marginBottom: 6 }}>{o.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{o.label}</div>
                    <div style={{ fontSize: 11, marginTop: 3, color: o.disabled ? '#f59e0b' : value === o.v ? '#a5b4fc' : '#475569' }}>{o.sub}</div>
                </button>
            ))}
        </div>
    );
}

/* ─── Copy button ─── */
function CopyBtn({ text }) {
    const [copied, setCopied] = useState(false);
    const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    return (
        <button type="button" onClick={copy} style={{ padding: '10px 14px', borderRadius: 10, background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)', border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.25)'}`, color: copied ? '#10b981' : '#818cf8', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, transition: 'all 0.2s' }}>
            {copied ? <><FiCheck size={13} /> Done</> : <><FiCopy size={13} /> Copy</>}
        </button>
    );
}

/* ─── TX category badge ─── */
const CAT_STYLE = {
    sale: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
    purchase: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
    deposit: { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)' },
    withdrawal: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
    commission: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)' },
    refund: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)' },
};

/* ═══════════════════════════════════════════════════ */
export default function Wallet() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [balance, setBalance] = useState(0);
    const [platformEarnings, setPlatformEarnings] = useState(0);
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
    const [paymentSettings, setPaymentSettings] = useState({ cryptoAddresses: [], upiIds: [] });
    const [refreshing, setRefreshing] = useState(false);
    const [txFilter, setTxFilter] = useState('all');

    useEffect(() => {
        const u = getUser();
        if (!u) { router.push('/login'); return; }
        setUser(u);
        fetchWallet();
        fetchPaymentSettings();
        const t = setInterval(fetchWallet, 10000);
        return () => clearInterval(t);
    }, []);

    const fetchWallet = async () => {
        try {
            const r = await api.get('/api/wallet');
            if (r.data.success) {
                setBalance(r.data.balance);
                setPlatformEarnings(r.data.platformEarnings || 0);
                setTransactions(r.data.transactions);
            }
        } catch { } finally { setLoading(false); }
    };

    const fetchPaymentSettings = async () => {
        try {
            const r = await api.get('/api/settings/payment-options');
            if (r.data.success) setPaymentSettings({ cryptoAddresses: r.data.cryptoAddresses || [], upiIds: r.data.upiIds || [] });
        } catch { }
    };

    const resetForm = () => { setAmount(''); setPaymentType(''); setCryptoCoin(''); setCryptoNetwork(''); setTransactionHash(''); setUpiId(''); setUtrNumber(''); };

    const cryptoAmt = () => {
        const n = parseFloat(amount); if (isNaN(n)) return 0;
        return (n / (cryptoCoin === 'USDT' ? INR_TO_USDT : INR_TO_USDC)).toFixed(4);
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault(); setProcessing(true);
        try {
            const payload = { amount: Number(amount), paymentType };
            if (paymentType === 'crypto') { payload.cryptoCoin = cryptoCoin; payload.cryptoNetwork = cryptoNetwork; payload.transactionHash = transactionHash; }
            else { payload.upiId = upiId; payload.utrNumber = utrNumber; }
            const r = await api.post('/api/wallet/payment', payload);
            if (r.data.success) { alert(r.data.message); resetForm(); setShowAddMoney(false); fetchWallet(); }
        } catch (err) { alert(err.response?.data?.message || 'Error submitting payment'); }
        finally { setProcessing(false); }
    };

    const handleWithdrawalSubmit = async (e) => {
        e.preventDefault(); setProcessing(true);
        try {
            const payload = { amount: Number(amount), withdrawalType: paymentType };
            if (paymentType === 'crypto') { payload.cryptoCoin = cryptoCoin; payload.cryptoNetwork = cryptoNetwork; payload.walletAddress = transactionHash; }
            else { payload.upiId = upiId; }
            const r = await api.post('/api/wallet/withdrawal', payload);
            if (r.data.success) { alert(r.data.message); resetForm(); setShowWithdraw(false); fetchWallet(); }
        } catch (err) { alert(err.response?.data?.message || 'Error submitting withdrawal'); }
        finally { setProcessing(false); }
    };

    const handleRefresh = async () => { setRefreshing(true); await fetchWallet(); setTimeout(() => setRefreshing(false), 600); };

    const totalEarned = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
    const totalSpent = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);

    const filteredTx = txFilter === 'all' ? transactions : transactions.filter(t => t.type === txFilter);

    const isAdmin = user?.role === 'admin';
    const pageTitle = isAdmin ? 'Platform Wallet' : 'My Wallet';

    /* ══════════════ RENDER ══════════════ */
    return (
        <Layout>
            <Head>
                <title>{pageTitle} – DevMarket</title>
                <meta name="description" content="Manage your DevMarket wallet — add money, withdraw earnings and view transactions." />
            </Head>

            {/* ── HERO ── */}
            <div style={{
                position: 'relative', overflow: 'hidden',
                background: 'linear-gradient(135deg, #020617 0%, #0a1628 55%, #020617 100%)',
                padding: '60px 5% 48px',
                borderBottom: '1px solid rgba(16,185,129,0.12)',
            }}>
                <div style={{ position: 'absolute', top: '-20%', right: '-5%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.14) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-40%', left: '25%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, marginBottom: 18, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
                        <FiDollarSign size={13} color="#10b981" />
                        <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>{pageTitle}</span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 900, color: 'white', margin: '0 0 10px', letterSpacing: '-1.5px', lineHeight: 1.1 }}>
                        {isAdmin ? 'Platform ' : 'My '}
                        <span style={{ background: 'linear-gradient(135deg,#10b981,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Wallet</span>
                    </h1>
                    <p style={{ fontSize: 15, color: '#475569', margin: 0 }}>Track your balance, add money and withdraw earnings.</p>
                </div>
            </div>

            <div style={{ background: '#070c18', minHeight: '60vh', padding: '36px 5% 80px' }}>

                {/* ── BALANCE CARD ── */}
                <div style={{
                    background: 'linear-gradient(135deg, #064e3b 0%, #0d1b4b 50%, #1e1b4b 100%)',
                    border: '1px solid rgba(16,185,129,0.25)',
                    borderRadius: 24, padding: '32px 36px', marginBottom: 28,
                    position: 'relative', overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                }}>
                    {/* Bg glow */}
                    <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle,rgba(16,185,129,0.25) 0%,transparent 70%)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: -80, left: '30%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,130,246,0.15) 0%,transparent 70%)', pointerEvents: 'none' }} />

                    {/* Top row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                        <div>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Available Balance</p>
                            {loading ? (
                                <div style={{ width: 180, height: 52, borderRadius: 12, background: 'rgba(255,255,255,0.1)' }} />
                            ) : (
                                <p style={{ fontSize: 'clamp(36px,5vw,56px)', fontWeight: 900, color: 'white', margin: 0, lineHeight: 1, letterSpacing: '-2px' }}>
                                    ₹{balance.toLocaleString('en-IN')}
                                </p>
                            )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <button onClick={handleRefresh} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
                                <FiRefreshCw size={15} style={{ transition: 'transform 0.6s', transform: refreshing ? 'rotate(360deg)' : 'rotate(0)' }} />
                            </button>
                            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontSize: 26 }}>
                                <FiDollarSign />
                            </div>
                        </div>
                    </div>

                    {/* Mini stats */}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
                        <StatMini label="Total Earned" value={`₹${totalEarned.toLocaleString()}`} color="#10b981" />
                        <StatMini label="Total Spent" value={`₹${totalSpent.toLocaleString()}`} color="#f87171" />
                        {isAdmin && <StatMini label="Platform Income" value={`₹${platformEarnings.toLocaleString()}`} color="#818cf8" />}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 14 }}>
                        <button onClick={() => { setShowAddMoney(true); resetForm(); }} style={{
                            flex: 1, padding: '14px', borderRadius: 14, border: 'none', cursor: 'pointer',
                            background: 'linear-gradient(135deg,#10b981,#059669)',
                            color: 'white', fontWeight: 700, fontSize: 15,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            boxShadow: '0 6px 20px rgba(16,185,129,0.35)',
                        }}>
                            <FiPlus size={18} /> Add Money
                        </button>
                        <button onClick={() => { setShowWithdraw(true); resetForm(); }} style={{
                            flex: 1, padding: '14px', borderRadius: 14,
                            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                            color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        }}>
                            <FiArrowUpCircle size={18} /> Withdraw
                        </button>
                    </div>
                </div>

                {/* ── TRANSACTIONS ── */}
                <div style={{ background: 'rgba(10,15,30,0.85)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 20, overflow: 'hidden' }}>
                    {/* Header */}
                    <div style={{ padding: '20px 26px', borderBottom: '1px solid rgba(99,102,241,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <FiClock color="#818cf8" />
                            <h3 style={{ fontSize: 17, fontWeight: 800, color: 'white', margin: 0 }}>Transactions</h3>
                            <span style={{ fontSize: 12, color: '#475569', background: 'rgba(99,102,241,0.1)', padding: '3px 10px', borderRadius: 999, border: '1px solid rgba(99,102,241,0.2)' }}>{transactions.length}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {['all', 'credit', 'debit'].map(f => (
                                <button key={f} onClick={() => setTxFilter(f)} style={{
                                    padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                    background: txFilter === f ? 'rgba(99,102,241,0.2)' : 'transparent',
                                    border: `1px solid ${txFilter === f ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.1)'}`,
                                    color: txFilter === f ? '#818cf8' : '#475569',
                                    transition: 'all 0.2s', textTransform: 'capitalize',
                                }}>{f === 'all' ? 'All' : f === 'credit' ? '↑ Credits' : '↓ Debits'}</button>
                            ))}
                        </div>
                    </div>

                    {/* List */}
                    {loading ? (
                        <div style={{ padding: 32 }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{ height: 64, borderRadius: 12, background: 'rgba(99,102,241,0.05)', marginBottom: 12 }} />
                            ))}
                        </div>
                    ) : filteredTx.length === 0 ? (
                        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                            <div style={{ fontSize: 40, marginBottom: 14 }}>💸</div>
                            <p style={{ color: '#475569', fontSize: 15 }}>{txFilter === 'all' ? 'No transactions yet' : `No ${txFilter} transactions`}</p>
                        </div>
                    ) : (
                        <div>
                            {filteredTx.map((tx, i) => {
                                const isCredit = tx.type === 'credit';
                                const cat = CAT_STYLE[tx.category] || CAT_STYLE['deposit'];
                                return (
                                    <div key={tx._id} style={{
                                        display: 'flex', alignItems: 'center', gap: 16,
                                        padding: '16px 26px',
                                        borderTop: i > 0 ? '1px solid rgba(99,102,241,0.06)' : 'none',
                                        transition: 'background 0.15s',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.04)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        {/* Icon */}
                                        <div style={{
                                            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                                            background: isCredit ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                                            border: `1px solid ${isCredit ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: isCredit ? '#10b981' : '#f87171', fontSize: 18,
                                        }}>
                                            {isCredit ? <FiArrowDownLeft /> : <FiArrowUpRight />}
                                        </div>

                                        {/* Description */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {tx.description}
                                            </p>
                                            <p style={{ fontSize: 12, color: '#475569', margin: '3px 0 0' }}>
                                                {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>

                                        {/* Right side */}
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <p style={{ fontSize: 17, fontWeight: 800, color: isCredit ? '#10b981' : '#f87171', margin: '0 0 4px' }}>
                                                {isCredit ? '+' : '−'}₹{tx.amount.toLocaleString()}
                                            </p>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: cat.color, background: cat.bg, border: `1px solid ${cat.border}`, padding: '2px 10px', borderRadius: 999 }}>
                                                {tx.category}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ══════ ADD MONEY MODAL ══════ */}
            {showAddMoney && (
                <Modal title="Add Money" subtitle="Send crypto and submit transaction details" icon={<FiPlus />} onClose={() => { setShowAddMoney(false); resetForm(); }}>
                    <PayTypePicker value={paymentType} onChange={t => { setPaymentType(t); setCryptoCoin(''); setCryptoNetwork(''); }} />
                    <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <DInput label="Amount (₹)" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter INR amount" min="1" required />

                        {paymentType === 'crypto' && (
                            <>
                                <DInput label="Select Coin" as="select" value={cryptoCoin} onChange={e => setCryptoCoin(e.target.value)} required>
                                    <option value="" style={{ background: '#0f172a' }}>Choose coin</option>
                                    <option value="USDT" style={{ background: '#0f172a' }}>USDT</option>
                                    <option value="USDC" style={{ background: '#0f172a' }}>USDC</option>
                                </DInput>

                                {amount && cryptoCoin && (
                                    <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '14px 18px' }}>
                                        <p style={{ fontSize: 12, color: '#10b981', margin: '0 0 4px', fontWeight: 700 }}>Amount to send in crypto</p>
                                        <p style={{ fontSize: 24, fontWeight: 900, color: 'white', margin: 0 }}>{cryptoAmt()} <span style={{ color: '#10b981' }}>{cryptoCoin}</span></p>
                                        <p style={{ fontSize: 11, color: '#475569', margin: '4px 0 0' }}>Rate: ₹{cryptoCoin === 'USDT' ? INR_TO_USDT : INR_TO_USDC} per {cryptoCoin}</p>
                                    </div>
                                )}

                                <DInput label="Select Network" as="select" value={cryptoNetwork} onChange={e => setCryptoNetwork(e.target.value)} required>
                                    <option value="" style={{ background: '#0f172a' }}>Choose network</option>
                                    <option value="BEP20" style={{ background: '#0f172a' }}>BEP20</option>
                                    <option value="Polygon" style={{ background: '#0f172a' }}>Polygon</option>
                                </DInput>

                                {cryptoNetwork && paymentSettings.cryptoAddresses.length > 0 && (
                                    <div style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: 12, padding: '16px' }}>
                                        <p style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', margin: '0 0 12px', textTransform: 'uppercase' }}>
                                            <FiShield style={{ display: 'inline', marginRight: 5 }} />Send to this address
                                        </p>
                                        {paymentSettings.cryptoAddresses.map((addr, i) => (
                                            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                                <div style={{ flex: 1, padding: '10px 14px', borderRadius: 10, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.15)', fontFamily: 'monospace', fontSize: 12, color: '#94a3b8', wordBreak: 'break-all' }}>{addr}</div>
                                                <CopyBtn text={addr} />
                                            </div>
                                        ))}
                                        <p style={{ fontSize: 12, color: '#64748b', margin: '8px 0 0' }}>Send {cryptoCoin} on {cryptoNetwork} network to the above address.</p>
                                    </div>
                                )}

                                <DInput label="Transaction Hash / Link" type="text" value={transactionHash} onChange={e => setTransactionHash(e.target.value)} placeholder="Enter your transaction hash" required />
                            </>
                        )}

                        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                            <button type="submit" disabled={processing || !paymentType} style={{ flex: 1, padding: '14px', borderRadius: 12, border: 'none', cursor: processing || !paymentType ? 'not-allowed' : 'pointer', background: processing || !paymentType ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg,#10b981,#059669)', color: 'white', fontWeight: 700, fontSize: 14 }}>
                                {processing ? '⏳ Submitting...' : '✅ Submit Payment'}
                            </button>
                            <button type="button" onClick={() => { setShowAddMoney(false); resetForm(); }} style={{ padding: '14px 20px', borderRadius: 12, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.15)', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ══════ WITHDRAW MODAL ══════ */}
            {showWithdraw && (
                <Modal title="Withdraw Funds" subtitle={`Available: ₹${balance.toLocaleString()}`} icon={<FiArrowUpCircle />} onClose={() => { setShowWithdraw(false); resetForm(); }}>
                    <PayTypePicker value={paymentType} onChange={t => { setPaymentType(t); setCryptoCoin(''); setCryptoNetwork(''); }} />
                    <form onSubmit={handleWithdrawalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <DInput label="Amount (₹)" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount to withdraw" min="1" max={balance} required />

                        {paymentType === 'crypto' && (
                            <>
                                <DInput label="Select Coin" as="select" value={cryptoCoin} onChange={e => setCryptoCoin(e.target.value)} required>
                                    <option value="" style={{ background: '#0f172a' }}>Choose coin</option>
                                    <option value="USDT" style={{ background: '#0f172a' }}>USDT</option>
                                    <option value="USDC" style={{ background: '#0f172a' }}>USDC</option>
                                </DInput>

                                {amount && cryptoCoin && (
                                    <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 12, padding: '14px 18px' }}>
                                        <p style={{ fontSize: 12, color: '#3b82f6', margin: '0 0 4px', fontWeight: 700 }}>You will receive</p>
                                        <p style={{ fontSize: 24, fontWeight: 900, color: 'white', margin: 0 }}>{cryptoAmt()} <span style={{ color: '#60a5fa' }}>{cryptoCoin}</span></p>
                                        <p style={{ fontSize: 11, color: '#475569', margin: '4px 0 0' }}>Rate: ₹{cryptoCoin === 'USDT' ? INR_TO_USDT : INR_TO_USDC} per {cryptoCoin}</p>
                                    </div>
                                )}

                                <DInput label="Select Network" as="select" value={cryptoNetwork} onChange={e => setCryptoNetwork(e.target.value)} required>
                                    <option value="" style={{ background: '#0f172a' }}>Choose network</option>
                                    <option value="BEP20" style={{ background: '#0f172a' }}>BEP20</option>
                                    <option value="Polygon" style={{ background: '#0f172a' }}>Polygon</option>
                                </DInput>

                                <DInput label="Your Wallet Address" type="text" value={transactionHash} onChange={e => setTransactionHash(e.target.value)} placeholder="Enter your crypto wallet address" required />
                            </>
                        )}

                        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                            <button type="submit" disabled={processing || !paymentType} style={{ flex: 1, padding: '14px', borderRadius: 12, border: 'none', cursor: processing || !paymentType ? 'not-allowed' : 'pointer', background: processing || !paymentType ? 'rgba(239,68,68,0.3)' : 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', fontWeight: 700, fontSize: 14 }}>
                                {processing ? '⏳ Submitting...' : '🏦 Submit Withdrawal'}
                            </button>
                            <button type="button" onClick={() => { setShowWithdraw(false); resetForm(); }} style={{ padding: '14px 20px', borderRadius: 12, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.15)', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            <style>{`input::placeholder,textarea::placeholder{color:#334155} select option{background:#0f172a;color:white}`}</style>
        </Layout>
    );
}
