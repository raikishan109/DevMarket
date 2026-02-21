import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import api from '../utils/api';
import { setAuth } from '../utils/auth';
import { FiMail, FiLock, FiUser, FiCode, FiArrowRight } from 'react-icons/fi';

export default function Register() {
    const router = useRouter();
    const [ready, setReady] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'buyer' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => { if (router.isReady) setReady(true); }, [router.isReady]);
    if (!ready) return null;

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        if (!formData.name || !formData.email || !formData.password) return setError('Please fill in all fields');
        if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
        if (formData.password.length < 6) return setError('Password must be at least 6 characters');
        setLoading(true);
        try {
            const response = await api.post('/api/auth/register', {
                name: formData.name, email: formData.email, password: formData.password, role: formData.role
            });
            if (response.data.success) {
                setAuth(response.data.token, response.data.user);
                router.push(response.data.user.role === 'developer' ? '/developer/dashboard' : '/marketplace');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%', paddingLeft: 44, paddingRight: 16, paddingTop: 13, paddingBottom: 13,
        background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 12, color: 'white', fontSize: 15, outline: 'none',
        boxSizing: 'border-box', transition: 'all 0.2s',
    };

    return (
        <Layout>
            <Head><title>Register - DevMarket</title></Head>

            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #0f172a 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '40px 16px', position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', top: '10%', right: '10%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

                <div style={{ position: 'relative', width: '100%', maxWidth: 480 }}>
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
                            Create Account
                        </h2>
                        <p style={{ color: '#64748b', fontSize: 15 }}>Join India's developer marketplace</p>
                    </div>

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

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            {/* Name */}
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#a5b4fc', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <FiUser style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#6366f1' }} />
                                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Your full name" style={inputStyle}
                                        onFocus={e => e.target.style.borderColor = '#6366f1'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.2)'}
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#a5b4fc', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</label>
                                <div style={{ position: 'relative' }}>
                                    <FiMail style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#6366f1' }} />
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" style={inputStyle}
                                        onFocus={e => e.target.style.borderColor = '#6366f1'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.2)'}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#a5b4fc', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <FiLock style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#6366f1' }} />
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Min 6 characters" style={inputStyle}
                                        onFocus={e => e.target.style.borderColor = '#6366f1'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.2)'}
                                    />
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#a5b4fc', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <FiLock style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#6366f1' }} />
                                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter password" style={inputStyle}
                                        onFocus={e => e.target.style.borderColor = '#6366f1'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.2)'}
                                    />
                                </div>
                            </div>

                            {/* Role */}
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#a5b4fc', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>I am a...</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    {['buyer', 'developer'].map(role => (
                                        <button key={role} type="button" onClick={() => setFormData({ ...formData, role })} style={{
                                            padding: '12px', borderRadius: 12, border: '2px solid',
                                            borderColor: formData.role === role ? '#6366f1' : 'rgba(99,102,241,0.2)',
                                            background: formData.role === role ? 'rgba(99,102,241,0.2)' : 'transparent',
                                            color: formData.role === role ? '#a5b4fc' : '#64748b',
                                            fontWeight: 700, fontSize: 14, cursor: 'pointer',
                                            textTransform: 'capitalize', transition: 'all 0.2s',
                                        }}>
                                            {role === 'buyer' ? '🛒 Buyer' : '💻 Developer'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" disabled={loading} style={{
                                width: '100%', padding: '14px', borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                                background: loading ? '#4338ca' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white', fontWeight: 700, fontSize: 16,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                boxShadow: '0 8px 25px rgba(99,102,241,0.4)',
                                transition: 'all 0.3s', opacity: loading ? 0.7 : 1, marginTop: 4,
                            }}
                                onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                {loading ? 'Creating Account...' : <><span>Create Account</span><FiArrowRight /></>}
                            </button>
                        </form>

                        <div style={{ marginTop: 24, borderTop: '1px solid rgba(99,102,241,0.15)', paddingTop: 24, textAlign: 'center' }}>
                            <span style={{ color: '#475569', fontSize: 14 }}>Already have an account? </span>
                            <Link href="/login" style={{ color: '#818cf8', fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>
                                Login →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
