import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import api from '../utils/api';
import { getUser } from '../utils/auth';
import { useTheme } from '../contexts/ThemeContext';
import {
    FiMessageSquare, FiShield, FiCheckCircle,
    FiShoppingBag, FiChevronRight, FiClock
} from 'react-icons/fi';

export default function ChatList() {
    const router = useRouter();
    const { theme } = useTheme();
    const isLight = theme === 'light';

    const [user, setUser] = useState(null);
    const [chatRooms, setChatRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    // ── theme tokens ──
    const pageBg = isLight ? '#f0f0fa' : '#080814';
    const heroBg = isLight
        ? 'linear-gradient(135deg,#f5f3ff 0%,#ede9fe 100%)'
        : 'linear-gradient(135deg,#0f0c1f 0%,#0a0818 100%)';
    const heroBorder = isLight ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.14)';
    const cardBg = isLight ? 'rgba(255,255,255,0.97)' : 'rgba(15,13,28,0.98)';
    const cardBorder = isLight ? '1.5px solid rgba(124,58,237,0.1)' : '1.5px solid rgba(124,58,237,0.13)';
    const titleColor = isLight ? '#1e1b4b' : '#f1f5f9';
    const mutedColor = isLight ? '#6b7280' : '#64748b';
    const bodyColor = isLight ? '#4b5563' : '#94a3b8';
    const divider = isLight ? 'rgba(124,58,237,0.09)' : 'rgba(124,58,237,0.11)';

    useEffect(() => {
        const currentUser = getUser();
        if (!currentUser) { router.push('/login'); return; }
        setUser(currentUser);
        fetchChatRooms();
    }, []);

    const fetchChatRooms = async () => {
        try {
            const res = await api.get('/api/chat/rooms');
            if (res.data.success) setChatRooms(res.data.chatRooms);
        } catch (e) {
            console.error('Error fetching chats:', e);
        } finally {
            setLoading(false);
        }
    };

    const getUserRole = (room) => {
        if (!user) return '';
        if (room.buyer._id === user.id) return 'buyer';
        if (room.seller._id === user.id) return 'seller';
        if (room.admin && room.admin._id === user.id) return 'admin';
        return '';
    };

    const getOtherPartyName = (room) => {
        const role = getUserRole(room);
        if (role === 'buyer') return room.seller.name;
        if (role === 'seller') return room.buyer.name;
        return `${room.buyer.name} & ${room.seller.name}`;
    };

    const getInitials = (name = '') =>
        name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const avatarColors = [
        ['#6366f1', '#4f46e5'], ['#8b5cf6', '#7c3aed'],
        ['#ec4899', '#db2777'], ['#10b981', '#059669'],
        ['#f59e0b', '#d97706'], ['#3b82f6', '#2563eb'],
    ];
    const getAvatarColor = (str = '') => avatarColors[str.charCodeAt(0) % avatarColors.length];

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const now = new Date();
        const diff = now - d;
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    return (
        <Layout>
            <Head>
                <title>My Chats – DevMarket</title>
                <meta name="description" content="Your conversations with sellers and buyers on DevMarket." />
            </Head>

            <div style={{ background: pageBg, minHeight: '100vh' }}>

                {/* ── HERO ── */}
                <div style={{
                    background: heroBg,
                    borderBottom: `1px solid ${heroBorder}`,
                    padding: '40px 5% 32px',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', top: -60, right: '5%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.18) 0%,transparent 70%)', pointerEvents: 'none' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '5px 14px', borderRadius: 999, marginBottom: 14,
                            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
                        }}>
                            <FiMessageSquare size={13} color="#818cf8" />
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', letterSpacing: '0.4px' }}>Messages</span>
                        </div>
                        <h1 style={{ fontSize: 'clamp(26px,4vw,38px)', fontWeight: 900, color: titleColor, margin: '0 0 8px', letterSpacing: '-1px' }}>
                            My Chats
                        </h1>
                        <p style={{ fontSize: 15, color: mutedColor, margin: 0 }}>
                            {chatRooms.length > 0
                                ? `${chatRooms.length} active conversation${chatRooms.length !== 1 ? 's' : ''}`
                                : 'Your conversations with sellers & buyers'}
                        </p>
                    </div>
                </div>

                {/* ── CONTENT ── */}
                <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 5% 80px' }}>

                    {loading ? (
                        // ── Skeleton ──
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{
                                    height: 88, borderRadius: 18,
                                    background: isLight
                                        ? 'linear-gradient(90deg,#e8e0ff 25%,#d4c8ff 50%,#e8e0ff 75%)'
                                        : 'linear-gradient(90deg,rgba(99,102,241,0.05) 25%,rgba(99,102,241,0.1) 50%,rgba(99,102,241,0.05) 75%)',
                                    backgroundSize: '200% 100%',
                                    animation: 'shimmer 1.5s infinite',
                                }} />
                            ))}
                        </div>
                    ) : chatRooms.length === 0 ? (
                        // ── Empty state ──
                        <div style={{
                            background: cardBg, border: cardBorder, borderRadius: 24,
                            padding: '60px 40px', textAlign: 'center',
                            boxShadow: isLight ? '0 4px 24px rgba(99,102,241,0.07)' : 'none',
                        }}>
                            <div style={{
                                width: 80, height: 80, borderRadius: '50%',
                                background: 'rgba(99,102,241,0.1)', border: '1.5px solid rgba(99,102,241,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 20px', fontSize: 32,
                            }}>
                                <FiMessageSquare size={32} color="#818cf8" />
                            </div>
                            <h3 style={{ color: titleColor, fontSize: 22, fontWeight: 800, margin: '0 0 10px' }}>No chats yet</h3>
                            <p style={{ color: bodyColor, fontSize: 14, lineHeight: 1.65, margin: '0 0 28px', maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
                                Start a conversation by contacting a seller on any product page. Your messages will appear here.
                            </p>
                            <Link
                                href="/marketplace"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                    padding: '12px 28px', borderRadius: 14, fontWeight: 700, fontSize: 14,
                                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                    color: 'white', textDecoration: 'none',
                                    boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
                                }}
                            >
                                <FiShoppingBag size={15} /> Browse Marketplace
                            </Link>
                        </div>
                    ) : (
                        // ── Chat list ──
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {chatRooms.map((room, idx) => {
                                const otherName = getOtherPartyName(room);
                                const [c1, c2] = getAvatarColor(otherName);
                                const isResolved = room.status === 'resolved';
                                const role = getUserRole(room);

                                return (
                                    <Link
                                        key={room._id}
                                        href={`/chat/${room._id}`}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <div
                                            style={{
                                                background: cardBg,
                                                border: cardBorder,
                                                borderRadius: 18,
                                                padding: '18px 20px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 16,
                                                cursor: 'pointer',
                                                transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
                                                boxShadow: isLight ? '0 2px 12px rgba(99,102,241,0.05)' : 'none',
                                                position: 'relative',
                                                overflow: 'hidden',
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = isLight
                                                    ? '0 8px 28px rgba(99,102,241,0.12)'
                                                    : '0 8px 28px rgba(0,0,0,0.35)';
                                                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = isLight ? '0 2px 12px rgba(99,102,241,0.05)' : 'none';
                                                e.currentTarget.style.borderColor = isLight ? 'rgba(124,58,237,0.1)' : 'rgba(124,58,237,0.13)';
                                            }}
                                        >
                                            {/* Left accent bar */}
                                            <div style={{
                                                position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                                                background: `linear-gradient(180deg,${c1},${c2})`,
                                                borderRadius: '18px 0 0 18px',
                                                opacity: isResolved ? 0.4 : 1,
                                            }} />

                                            {/* Avatar */}
                                            <div style={{
                                                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                                                background: `linear-gradient(135deg,${c1},${c2})`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 800, fontSize: 16, color: 'white',
                                                boxShadow: `0 4px 12px ${c1}55`,
                                            }}>
                                                {getInitials(otherName)}
                                            </div>

                                            {/* Info */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                    <p style={{ fontSize: 15, fontWeight: 700, color: titleColor, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {otherName}
                                                    </p>
                                                    {room.admin && <FiShield size={13} color="#f59e0b" title="Admin joined" />}
                                                    {isResolved && <FiCheckCircle size={13} color="#10b981" title="Resolved" />}
                                                </div>

                                                <p style={{
                                                    fontSize: 13, color: mutedColor, margin: '0 0 6px',
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                }}>
                                                    📦 {room.product?.name}
                                                </p>

                                                {room.lastMessage && (
                                                    <p style={{
                                                        fontSize: 12, color: bodyColor, margin: 0,
                                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                    }}>
                                                        {room.lastMessage}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Right side */}
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                                                {/* Price */}
                                                <p style={{ fontSize: 16, fontWeight: 800, color: '#a78bfa', margin: 0 }}>
                                                    ₹{room.product?.price}
                                                </p>

                                                {/* Badges */}
                                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                                    <span style={{
                                                        padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                                                        background: room.isPurchased ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.1)',
                                                        border: room.isPurchased ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(245,158,11,0.3)',
                                                        color: room.isPurchased ? '#10b981' : '#f59e0b',
                                                    }}>
                                                        {room.isPurchased ? '✓ Purchased' : 'Negotiating'}
                                                    </span>
                                                    {isResolved && (
                                                        <span style={{
                                                            padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                                                            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8',
                                                        }}>Resolved</span>
                                                    )}
                                                </div>

                                                {/* Time + Role */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <FiClock size={11} color={mutedColor} />
                                                    <span style={{ fontSize: 11, color: mutedColor }}>
                                                        {formatTime(room.updatedAt)}
                                                    </span>
                                                    <span style={{
                                                        padding: '1px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700,
                                                        background: 'rgba(99,102,241,0.1)', color: '#818cf8', textTransform: 'capitalize',
                                                    }}>{role}</span>
                                                </div>
                                            </div>

                                            <FiChevronRight size={18} color={mutedColor} style={{ flexShrink: 0 }} />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
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
