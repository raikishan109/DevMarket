import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import api from '../utils/api';
import { setAuth } from '../utils/auth';
import { FiMail, FiLock, FiArrowRight, FiCode } from 'react-icons/fi';

export default function Login() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        if (!formData.email || !formData.password) return setError('Please fill in all fields');
        setLoading(true);
        try {
            const response = await api.post('/api/auth/login', formData);
            if (response.data.success) {
                setAuth(response.data.token, response.data.user);
                router.push(response.data.user.role === 'developer' ? '/developer/dashboard' : '/marketplace');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Head><title>Login - DevMarket</title></Head>

            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #0f172a 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '40px 16px',
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Glow orbs */}
                <div style={{ position: 'absolute', top: '20%', left: '15%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

                <div style={{ position: 'relative', width: '100%', maxWidth: 440 }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: 18, margin: '0 auto 20px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 8px 30px rgba(99,102,241,0.5)',
                        }}>
                            <FiCode color="white" size={28} />
                        </div>
                        <h2 style={{ fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 8, letterSpacing: '-0.5px' }}>
                            Welcome Back
                        </h2>
                        <p style={{ color: '#64748b', fontSize: 15 }}>Sign in to continue to DevMarket</p>
                    </div>

                    {/* Card */}
                    <div style={{
                        background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(99,102,241,0.2)', borderRadius: 24, padding: 36,
                    }}>
                        {error && (
                            <div style={{
                                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                                borderLeft: '4px solid #ef4444', borderRadius: 12, padding: '12px 16px',
                                color: '#f87171', marginBottom: 24, fontSize: 14,
                            }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#a5b4fc', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Email Address
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <FiMail style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#6366f1' }} />
                                    <input
                                        type="email" name="email" value={formData.email} onChange={handleChange}
                                        placeholder="john@example.com" required
                                        style={{
                                            width: '100%', paddingLeft: 44, paddingRight: 16, paddingTop: 13, paddingBottom: 13,
                                            background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                                            borderRadius: 12, color: 'white', fontSize: 15, outline: 'none',
                                            boxSizing: 'border-box', transition: 'all 0.2s',
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#6366f1'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.2)'}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#a5b4fc', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <FiLock style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#6366f1' }} />
                                    <input
                                        type="password" name="password" value={formData.password} onChange={handleChange}
                                        placeholder="••••••••" required
                                        style={{
                                            width: '100%', paddingLeft: 44, paddingRight: 16, paddingTop: 13, paddingBottom: 13,
                                            background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                                            borderRadius: 12, color: 'white', fontSize: 15, outline: 'none',
                                            boxSizing: 'border-box', transition: 'all 0.2s',
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#6366f1'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.2)'}
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} style={{
                                width: '100%', padding: '14px', borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                                background: loading ? '#4338ca' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white', fontWeight: 700, fontSize: 16,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                boxShadow: '0 8px 25px rgba(99,102,241,0.4)',
                                transition: 'all 0.3s', opacity: loading ? 0.7 : 1,
                            }}
                                onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                {loading ? 'Signing in...' : <><span>Sign In</span><FiArrowRight /></>}
                            </button>
                        </form>

                        <div style={{ margin: '24px 0', borderTop: '1px solid rgba(99,102,241,0.15)', paddingTop: 24, textAlign: 'center' }}>
                            <span style={{ color: '#475569', fontSize: 14 }}>New to DevMarket? </span>
                            <Link href="/register" style={{ color: '#818cf8', fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>
                                Create an account →
                            </Link>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <Link href="/admin-login" style={{ color: '#475569', fontSize: 13, textDecoration: 'none' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#818cf8'}
                                onMouseLeave={e => e.currentTarget.style.color = '#475569'}
                            >
                                Admin Login →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
