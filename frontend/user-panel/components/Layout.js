import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from './Navbar';
import Footer from './Footer';
import { FiShoppingBag, FiDollarSign, FiMonitor } from 'react-icons/fi';
import { getUser } from '../utils/auth';
import { useTheme } from '../contexts/ThemeContext';

export default function Layout({ children }) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const { theme } = useTheme();
    const isLight = theme === 'light';

    useEffect(() => {
        setUser(getUser());
    }, [router.pathname]);

    const navLinks = [
        { href: '/marketplace', label: 'Marketplace', icon: <FiShoppingBag /> },
        ...(user ? [{ href: '/developer/dashboard', label: 'Sell Products', icon: <FiMonitor /> }] : []),
        ...(user?.role === 'buyer' ? [{ href: '/buyer/dashboard', label: 'My Purchases', icon: <FiMonitor /> }] : []),
        ...(user ? [{ href: '/wallet', label: 'My Wallet', icon: <FiDollarSign /> }] : []),
    ];

    const noSidebarRoutes = ['/login', '/register', '/admin-login'];
    const isAuthPage = noSidebarRoutes.includes(router.pathname);

    /* ── Adaptive tokens ── */
    const pageBg = isLight ? '#f0f0fa' : '#0a0818';
    const sidebarBg = isLight ? 'rgba(245,243,255,0.98)' : 'rgba(15,10,40,0.95)';
    const sidebarBorder = isLight ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.12)';
    const mainInnerBg = isLight ? 'rgba(255,255,255,0.85)' : 'rgba(15,10,40,0.6)';
    const mainInnerBorder = isLight ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.1)';
    const linkActive = isLight ? '#4338ca' : '#a5b4fc';
    const linkActiveBg = isLight ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.2)';
    const linkActiveBorder = isLight ? '#6366f1' : '#6366f1';
    const linkColor = isLight ? '#6b7280' : '#94a3b8';
    const linkHoverBg = isLight ? 'rgba(99,102,241,0.07)' : 'rgba(99,102,241,0.08)';
    const linkHoverColor = isLight ? '#4338ca' : '#c7d2fe';

    if (isAuthPage) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: pageBg }}>
                <Navbar />
                <div style={{ flex: 1 }}>{children}</div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: pageBg, transition: 'background 0.25s' }}>
            <Navbar />

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* Sidebar */}
                <aside style={{
                    width: 240, flexShrink: 0,
                    background: sidebarBg,
                    borderRight: `1px solid ${sidebarBorder}`,
                    position: 'fixed', top: 64, left: 0,
                    height: 'calc(100vh - 64px)',
                    overflowY: 'auto', zIndex: 40,
                    display: 'flex', flexDirection: 'column',
                    transition: 'background 0.25s',
                    boxShadow: isLight ? '2px 0 16px rgba(99,102,241,0.06)' : 'none',
                }}>
                    <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {navLinks.map((link) => {
                            const active = router.pathname === link.href;
                            return (
                                <Link key={link.href} href={link.href} style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '11px 14px', borderRadius: 12,
                                    fontWeight: 600, fontSize: 14,
                                    textDecoration: 'none',
                                    transition: 'all 0.2s ease',
                                    background: active ? linkActiveBg : 'transparent',
                                    color: active ? linkActive : linkColor,
                                    borderLeft: active ? `3px solid ${linkActiveBorder}` : '3px solid transparent',
                                }}
                                    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = linkHoverBg; e.currentTarget.style.color = linkHoverColor; } }}
                                    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = linkColor; } }}
                                >
                                    <span style={{ fontSize: 18 }}>{link.icon}</span>
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content */}
                <main style={{
                    flex: 1, marginLeft: 240,
                    height: 'calc(100vh - 64px)',
                    overflowY: 'auto',
                    padding: '24px',
                    background: pageBg,
                    transition: 'background 0.25s',
                }}>
                    <div style={{
                        background: mainInnerBg,
                        backdropFilter: 'blur(10px)',
                        borderRadius: 20,
                        border: `1px solid ${mainInnerBorder}`,
                        minHeight: 'calc(100% - 80px)',
                        overflow: 'hidden',
                        boxShadow: isLight ? '0 4px 30px rgba(99,102,241,0.06)' : 'none',
                        transition: 'all 0.25s',
                    }}>
                        {children}
                    </div>
                    <Footer />
                </main>
            </div>
        </div>
    );
}
