import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from './Navbar';
import Footer from './Footer';
import { FiShoppingBag, FiMessageSquare, FiDollarSign, FiMonitor, FiUser } from 'react-icons/fi';
import { getUser } from '../utils/auth';

export default function Layout({ children }) {
    const router = useRouter();
    const [user, setUser] = useState(null);

    useEffect(() => {
        setUser(getUser());
    }, [router.pathname]);

    const navLinks = [
        { href: '/marketplace', label: 'Marketplace', icon: <FiShoppingBag /> },
        ...(user ? [{ href: '/chats', label: 'Chats', icon: <FiMessageSquare /> }] : []),
        ...(user?.role === 'buyer' ? [{ href: '/buyer/dashboard', label: 'My Purchases', icon: <FiMonitor /> }] : []),
        ...(user ? [{ href: '/developer/dashboard', label: 'Sell Products', icon: <FiMonitor /> }] : []),
        ...(user ? [{ href: '/wallet', label: 'My Wallet', icon: <FiDollarSign /> }] : []),
        ...(user ? [{ href: '/profile', label: 'My Profile', icon: <FiUser /> }] : []),
    ];
    const noSidebarRoutes = ['/login', '/register', '/admin-login'];
    const isAuthPage = noSidebarRoutes.includes(router.pathname);

    // Auth pages: sirf Navbar + fullscreen content, no sidebar/footer
    if (isAuthPage) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0818' }}>
                <Navbar />
                <div style={{ flex: 1 }}>
                    {children}
                </div>
            </div>
        );
    }


    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0818' }}>
            <Navbar />

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* Sidebar */}
                <aside style={{
                    width: 240, flexShrink: 0,
                    background: 'rgba(15,10,40,0.95)',
                    borderRight: '1px solid rgba(99,102,241,0.12)',
                    position: 'fixed', top: 64, left: 0,
                    height: 'calc(100vh - 64px)',
                    overflowY: 'auto', zIndex: 40,
                    display: 'flex', flexDirection: 'column',
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
                                    background: active ? 'rgba(99,102,241,0.2)' : 'transparent',
                                    color: active ? '#a5b4fc' : '#94a3b8',
                                    borderLeft: active ? '3px solid #6366f1' : '3px solid transparent',
                                }}
                                    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.color = '#c7d2fe'; } }}
                                    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; } }}
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
                    background: '#0a0818',
                }}>
                    <div style={{
                        background: 'rgba(15,10,40,0.6)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 20,
                        border: '1px solid rgba(99,102,241,0.1)',
                        minHeight: '100%',
                        overflow: 'hidden',
                    }}>
                        {children}
                    </div>
                </main>
            </div>

            <div style={{ marginLeft: 240 }}>
                <Footer />
            </div>
        </div>
    );
}
