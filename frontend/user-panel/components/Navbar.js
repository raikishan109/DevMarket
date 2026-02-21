import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { FiUser, FiLogOut, FiCode } from 'react-icons/fi';
import { getUser, clearAuth } from '../utils/auth';

export default function Navbar() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [scrolled, setScrolled] = useState(false);

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

    return (
        <nav style={{
            position: 'sticky', top: 0, zIndex: 50,
            background: scrolled ? 'rgba(15,10,40,0.95)' : 'rgba(15,10,40,0.8)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(99,102,241,0.15)',
            boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.3)' : 'none',
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
                    <span style={{ fontWeight: 800, fontSize: 18, color: 'white', letterSpacing: '-0.5px' }}>
                        Dev<span style={{ color: '#818cf8' }}>Market</span>
                    </span>
                </Link>

                {/* Right */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {user ? (
                        <>
                            <Link href="/profile" style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '8px 14px', borderRadius: 10,
                                color: '#a5b4fc', textDecoration: 'none',
                                background: 'rgba(99,102,241,0.1)',
                                border: '1px solid rgba(99,102,241,0.2)',
                                fontSize: 14, fontWeight: 600,
                                transition: 'all 0.2s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
                            >
                                <FiUser size={15} />
                                <span style={{ display: 'none' }} className="sm-show">{user.name}</span>
                            </Link>
                            <button onClick={handleLogout} style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                                background: 'rgba(239,68,68,0.1)', color: '#f87171',
                                fontSize: 14, fontWeight: 600,
                                transition: 'all 0.2s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
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
                                color: '#a5b4fc', textDecoration: 'none',
                                fontSize: 14, fontWeight: 600,
                                transition: 'all 0.2s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                                onMouseLeave={e => e.currentTarget.style.color = '#a5b4fc'}
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
