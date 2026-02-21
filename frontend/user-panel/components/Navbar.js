import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { FiUser, FiLogOut, FiCode, FiSun, FiMoon } from 'react-icons/fi';
import { getUser, clearAuth } from '../utils/auth';
import { useTheme } from '../contexts/ThemeContext';

export default function Navbar() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const isLight = theme === 'light';

    useEffect(() => {
        setUser(getUser());
    }, [router.pathname]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleLogout = () => {
        clearAuth();
        setUser(null);
        router.push('/');
    };

    /* ── Adaptive colors ── */
    const navBg = scrolled
        ? (isLight ? 'rgba(255,255,255,0.97)' : 'rgba(15,10,40,0.97)')
        : (isLight ? 'rgba(255,255,255,0.92)' : 'rgba(15,10,40,0.8)');
    const navBorder = isLight ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.15)';
    const logoText = isLight ? '#1e1b4b' : 'white';
    const logoAccent = '#6366f1';

    return (
        <nav style={{
            position: 'sticky', top: 0, zIndex: 50,
            background: navBg,
            backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${navBorder}`,
            boxShadow: scrolled
                ? (isLight ? '0 4px 20px rgba(99,102,241,0.12)' : '0 4px 30px rgba(0,0,0,0.3)')
                : 'none',
            transition: 'all 0.3s ease',
        }}>
            <div style={{ padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

                {/* Logo */}
                <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
                    }}>
                        <FiCode color="white" size={18} />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 18, color: logoText, letterSpacing: '-0.5px' }}>
                        Dev<span style={{ color: logoAccent }}>Market</span>
                    </span>
                </Link>

                {/* Right */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

                    {/* ── Theme Toggle ── */}
                    <button
                        onClick={toggleTheme}
                        title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                        style={{
                            width: 40, height: 40, borderRadius: 10, border: 'none', cursor: 'pointer',
                            background: isLight
                                ? 'linear-gradient(135deg, #fef3c7, #fbbf24)'
                                : 'linear-gradient(135deg, #1e1b4b, #3730a3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: isLight
                                ? '0 2px 10px rgba(251,191,36,0.4)'
                                : '0 2px 10px rgba(99,102,241,0.35)',
                            transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                            transform: 'scale(1)',
                            flexShrink: 0,
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08) rotate(15deg)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
                    >
                        {isLight
                            ? <FiMoon size={17} color="#1e1b4b" strokeWidth={2.5} />
                            : <FiSun size={17} color="#fbbf24" strokeWidth={2.5} />
                        }
                    </button>

                    {user ? (
                        <>
                            <Link href="/profile" style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '8px 14px', borderRadius: 10,
                                color: isLight ? '#4338ca' : '#a5b4fc',
                                textDecoration: 'none',
                                background: isLight ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.1)',
                                border: `1px solid ${isLight ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.2)'}`,
                                fontSize: 14, fontWeight: 600,
                                transition: 'all 0.2s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.16)'}
                                onMouseLeave={e => e.currentTarget.style.background = isLight ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.1)'}
                            >
                                <FiUser size={15} />
                                <span>{user.name?.split(' ')[0]}</span>
                            </Link>
                            <button onClick={handleLogout} style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                                background: 'rgba(239,68,68,0.1)',
                                color: isLight ? '#dc2626' : '#f87171',
                                fontSize: 14, fontWeight: 600,
                                transition: 'all 0.2s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.18)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                            >
                                <FiLogOut size={15} />
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" style={{
                                padding: '8px 18px', borderRadius: 10,
                                color: isLight ? '#4338ca' : '#a5b4fc',
                                textDecoration: 'none',
                                fontSize: 14, fontWeight: 600,
                                transition: 'all 0.2s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.color = isLight ? '#1e1b4b' : 'white'}
                                onMouseLeave={e => e.currentTarget.style.color = isLight ? '#4338ca' : '#a5b4fc'}
                            >
                                Login
                            </Link>
                            <Link href="/register" style={{
                                padding: '9px 20px', borderRadius: 10,
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white', textDecoration: 'none',
                                fontSize: 14, fontWeight: 700,
                                boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
                                transition: 'all 0.2s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
