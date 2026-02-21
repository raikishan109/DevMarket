import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { getUser } from '../utils/auth';
import {
    FiCode, FiCpu, FiGlobe, FiSmartphone, FiArrowRight,
    FiCheck, FiTrendingUp, FiShield, FiZap, FiStar,
    FiUsers, FiPackage, FiDollarSign, FiMenu, FiX,
    FiChevronDown, FiMoon, FiSun
} from 'react-icons/fi';

const stats = [
    { icon: <FiUsers />, value: '10K+', label: 'Developers' },
    { icon: <FiPackage />, value: '500+', label: 'Products' },
    { icon: <FiDollarSign />, value: '₹50L+', label: 'Transactions' },
    { icon: <FiStar />, value: '4.9', label: 'Avg Rating' },
];

const categories = [
    { icon: <FiCpu />, name: 'AI Tools', description: 'Intelligent solutions powered by machine learning', color: 'from-violet-600 to-purple-600', bg: 'bg-violet-50', count: '120+' },
    { icon: <FiZap />, name: 'Automation', description: 'Streamline workflows and save valuable time', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', count: '85+' },
    { icon: <FiGlobe />, name: 'Websites', description: 'Ready-to-use web applications & templates', color: 'from-sky-500 to-cyan-500', bg: 'bg-sky-50', count: '200+' },
    { icon: <FiSmartphone />, name: 'Mobile Apps', description: 'iOS and Android applications & components', color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', count: '95+' },
    { icon: <FiCode />, name: 'Scripts & APIs', description: 'Reusable code, scripts and API integrations', color: 'from-rose-500 to-pink-500', bg: 'bg-rose-50', count: '150+' },
    { icon: <FiShield />, name: 'Security Tools', description: 'Protect your apps with battle-tested solutions', color: 'from-blue-600 to-indigo-600', bg: 'bg-blue-50', count: '60+' },
];

const features = [
    { icon: <FiShield />, title: 'Secure Payments', description: 'Safe and encrypted transactions via Razorpay with instant settlements.', color: 'from-green-400 to-emerald-500' },
    { icon: <FiCheck />, title: 'Quality Assured', description: 'Every product reviewed by our team for security and functionality.', color: 'from-blue-400 to-cyan-500' },
    { icon: <FiTrendingUp />, title: 'Grow Your Revenue', description: 'Reach thousands of developers actively looking for your exact solution.', color: 'from-purple-400 to-violet-500' },
    { icon: <FiZap />, title: 'Instant Delivery', description: 'Digital products delivered instantly upon purchase. No waiting.', color: 'from-orange-400 to-amber-500' },
];

const testimonials = [
    { name: 'Rahul Sharma', role: 'Full Stack Developer', text: 'Sold my first SaaS boilerplate here and made ₹80,000 in just 2 months!', avatar: 'RS', stars: 5 },
    { name: 'Priya Patel', role: 'AI Engineer', text: 'Found an amazing ML pipeline tool that saved me weeks of work. Worth every rupee.', avatar: 'PP', stars: 5 },
    { name: 'Arjun Kumar', role: 'Indie Hacker', text: 'DevMarket is the best platform for Indian developers to monetize their skills.', avatar: 'AK', stars: 5 },
];

export default function Home() {
    const [user, setUser] = useState(null);
    const [navOpen, setNavOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeTestimonial, setActiveTestimonial] = useState(0);
    const heroRef = useRef(null);

    useEffect(() => {
        setUser(getUser());
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveTestimonial(prev => (prev + 1) % testimonials.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    const getSellLink = () => {
        if (!user) return '/register';
        return '/developer/dashboard';
    };

    return (
        <>
            <Head>
                <title>DevMarket — India's #1 Marketplace for Developer Products</title>
                <meta name="description" content="Buy and sell developer tools, AI automation, websites, and mobile apps. Problem-first solutions for real-world challenges." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
            </Head>

            <div style={{ fontFamily: "'Inter', sans-serif" }}>

                {/* ── NAVBAR ── */}
                <nav style={{
                    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                    transition: 'all 0.3s ease',
                    background: scrolled ? 'rgba(15,10,40,0.97)' : 'transparent',
                    backdropFilter: 'blur(20px)',
                    borderBottom: scrolled ? '1px solid rgba(99,102,241,0.2)' : 'none',
                    boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.4)' : 'none',
                    padding: '0 6%',
                }}>
                    <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>
                        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                                width: 38, height: 38, borderRadius: 10,
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 15px rgba(99,102,241,0.4)'
                            }}>
                                <FiCode color="white" size={20} />
                            </div>
                            <span style={{ fontWeight: 800, fontSize: 20, color: 'white', letterSpacing: '-0.5px' }}>
                                Dev<span style={{ color: '#6366f1' }}>Market</span>
                            </span>
                        </Link>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Link href="/marketplace" style={{
                                padding: '9px 20px', borderRadius: 8, fontWeight: 600, fontSize: 14,
                                color: '#a5b4fc',
                                textDecoration: 'none', transition: 'all 0.2s'
                            }}>
                                Browse
                            </Link>
                            {user ? (
                                <Link href={getSellLink()} style={{
                                    padding: '9px 22px', borderRadius: 8, fontWeight: 600, fontSize: 14,
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    color: 'white', textDecoration: 'none',
                                    boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
                                }}>
                                    Dashboard
                                </Link>
                            ) : (
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <Link href="/login" style={{
                                        padding: '9px 20px', borderRadius: 8, fontWeight: 600, fontSize: 14,
                                        color: '#a5b4fc',
                                        textDecoration: 'none', border: '1px solid rgba(99,102,241,0.3)',
                                    }}>
                                        Login
                                    </Link>
                                    <Link href="/register" style={{
                                        padding: '9px 22px', borderRadius: 8, fontWeight: 600, fontSize: 14,
                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        color: 'white', textDecoration: 'none',
                                        boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
                                    }}>
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>

                {/* ── HERO ── */}
                <section ref={heroRef} style={{
                    minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center',
                    background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
                    overflow: 'hidden',
                }}>
                    {/* Animated orbs */}
                    <div style={{
                        position: 'absolute', top: '10%', left: '5%',
                        width: 500, height: 500, borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
                        animation: 'pulse 4s ease-in-out infinite',
                        pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: '10%', right: '5%',
                        width: 400, height: 400, borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
                        animation: 'pulse 4s ease-in-out infinite 2s',
                        pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 800, height: 800, borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />

                    {/* Grid pattern */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: `linear-gradient(rgba(99,102,241,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.07) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px',
                        pointerEvents: 'none',
                    }} />

                    <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: '120px 6% 80px', textAlign: 'center', width: '100%' }}>

                        {/* Badge */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)',
                                borderRadius: 100, padding: '6px 16px',
                                animation: 'fadeSlideDown 0.6s ease-out',
                            }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#818cf8', boxShadow: '0 0 8px #818cf8' }} />
                                <span style={{ color: '#c7d2fe', fontSize: 13, fontWeight: 600 }}>
                                    India's #1 Developer Marketplace
                                </span>
                            </div>
                        </div>

                        {/* Headline */}
                        <h1 style={{
                            fontSize: 'clamp(40px, 7vw, 82px)', fontWeight: 900, lineHeight: 1.05,
                            marginBottom: 24, color: 'white', letterSpacing: '-2px',
                            animation: 'fadeSlideDown 0.6s ease-out 0.1s both',
                        }}>
                            Sell Your Code.
                            <br />
                            <span style={{
                                background: 'linear-gradient(135deg, #818cf8, #c084fc, #fb7185)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}>
                                Build Your Future.
                            </span>
                        </h1>

                        <p style={{
                            fontSize: 'clamp(16px, 2vw, 20px)', color: '#94a3b8', marginBottom: 48,
                            maxWidth: 600, margin: '0 auto 48px', lineHeight: 1.7,
                            animation: 'fadeSlideDown 0.6s ease-out 0.2s both',
                        }}>
                            The ultimate marketplace for developer tools, AI automation, websites, and mobile apps.
                            Turn your code into cash — starting today.
                        </p>

                        {/* CTAs */}
                        <div style={{
                            display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap',
                            animation: 'fadeSlideDown 0.6s ease-out 0.3s both',
                        }}>
                            <Link href="/marketplace" style={{
                                display: 'inline-flex', alignItems: 'center', gap: 10,
                                padding: '16px 32px', borderRadius: 14, fontWeight: 700, fontSize: 16,
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white', textDecoration: 'none',
                                boxShadow: '0 8px 30px rgba(99,102,241,0.5)',
                                transition: 'all 0.3s ease',
                            }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <span>Browse Products</span> <FiArrowRight />
                            </Link>
                            <Link href={getSellLink()} style={{
                                display: 'inline-flex', alignItems: 'center', gap: 10,
                                padding: '16px 32px', borderRadius: 14, fontWeight: 700, fontSize: 16,
                                background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: 'white', textDecoration: 'none',
                                transition: 'all 0.3s ease',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                <span>{user ? 'Sell Your Product' : 'Start Selling'}</span>
                            </Link>
                        </div>

                        {/* Stats */}
                        <div style={{
                            display: 'flex', justifyContent: 'center', gap: 'clamp(24px, 5vw, 60px)',
                            marginTop: 72, flexWrap: 'wrap',
                            animation: 'fadeSlideDown 0.6s ease-out 0.4s both',
                        }}>
                            {stats.map((s, i) => (
                                <div key={i} style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: 'white', letterSpacing: '-1px' }}>{s.value}</div>
                                    <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginTop: 4 }}>{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Scroll hint */}
                        <div style={{ marginTop: 60, animation: 'bounce 2s infinite' }}>
                            <FiChevronDown color="#475569" size={24} style={{ margin: '0 auto' }} />
                        </div>
                    </div>
                </section>

                {/* ── CATEGORIES ── */}
                <section style={{ padding: '100px 6%', background: '#f8fafc' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: 64 }}>
                            <span style={{
                                display: 'inline-block', padding: '6px 16px', borderRadius: 100,
                                background: 'rgba(99,102,241,0.1)', color: '#6366f1',
                                fontSize: 13, fontWeight: 700, marginBottom: 16, letterSpacing: '0.5px',
                                textTransform: 'uppercase',
                            }}>Categories</span>
                            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-1px', marginBottom: 12 }}>
                                Everything You Need to Build
                            </h2>
                            <p style={{ fontSize: 18, color: '#64748b', maxWidth: 500, margin: '0 auto' }}>
                                From AI tools to mobile apps — find it all in one marketplace.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
                            {categories.map((cat, i) => (
                                <Link key={i} href="/marketplace" style={{ textDecoration: 'none' }}>
                                    <div
                                        style={{
                                            background: 'white', borderRadius: 20, padding: 32,
                                            border: '1px solid #e2e8f0', cursor: 'pointer',
                                            transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden',
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.transform = 'translateY(-6px)';
                                            e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.12)';
                                            e.currentTarget.style.borderColor = 'transparent';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                                            <div style={{
                                                width: 56, height: 56, borderRadius: 16,
                                                background: `linear-gradient(135deg, ${cat.color.replace('from-', '').replace(' to-', ', ')})`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'white', fontSize: 24,
                                                boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                                            }}>
                                                {cat.icon}
                                            </div>
                                            <span style={{
                                                background: '#f1f5f9', color: '#475569',
                                                borderRadius: 8, padding: '4px 12px', fontSize: 13, fontWeight: 600
                                            }}>{cat.count}</span>
                                        </div>
                                        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>{cat.name}</h3>
                                        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{cat.description}</p>
                                        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 6, color: '#6366f1', fontWeight: 600, fontSize: 14 }}>
                                            <span>Explore</span> <FiArrowRight size={14} />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── HOW IT WORKS ── */}
                <section style={{ padding: '100px 6%', background: 'white' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: 64 }}>
                            <span style={{
                                display: 'inline-block', padding: '6px 16px', borderRadius: 100,
                                background: 'rgba(139,92,246,0.1)', color: '#8b5cf6',
                                fontSize: 13, fontWeight: 700, marginBottom: 16, letterSpacing: '0.5px',
                                textTransform: 'uppercase',
                            }}>How It Works</span>
                            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-1px', marginBottom: 12 }}>
                                Start in 3 Simple Steps
                            </h2>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40, position: 'relative' }}>
                            {[
                                { step: '01', title: 'Create Account', desc: 'Sign up free in 30 seconds. No credit card required.', icon: <FiUsers size={28} />, color: '#6366f1' },
                                { step: '02', title: 'List Your Product', desc: 'Upload your tool, set a price, and go live instantly.', icon: <FiPackage size={28} />, color: '#8b5cf6' },
                                { step: '03', title: 'Earn Money', desc: 'Get paid directly to your account on every sale.', icon: <FiDollarSign size={28} />, color: '#ec4899' },
                            ].map((item, i) => (
                                <div key={i} style={{ textAlign: 'center', padding: '0 16px' }}>
                                    <div style={{
                                        width: 80, height: 80, borderRadius: '50%', margin: '0 auto 24px',
                                        background: `linear-gradient(135deg, ${item.color}22, ${item.color}44)`,
                                        border: `2px solid ${item.color}33`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: item.color, position: 'relative',
                                    }}>
                                        {item.icon}
                                        <div style={{
                                            position: 'absolute', top: -8, right: -8,
                                            width: 26, height: 26, borderRadius: '50%',
                                            background: item.color, color: 'white',
                                            fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>{i + 1}</div>
                                    </div>
                                    <h3 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>{item.title}</h3>
                                    <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7 }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FEATURES ── */}
                <section style={{ padding: '100px 6%', background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 100%)' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: 64 }}>
                            <span style={{
                                display: 'inline-block', padding: '6px 16px', borderRadius: 100,
                                background: 'rgba(99,102,241,0.2)', color: '#818cf8',
                                fontSize: 13, fontWeight: 700, marginBottom: 16, letterSpacing: '0.5px',
                                textTransform: 'uppercase',
                            }}>Why DevMarket</span>
                            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: 'white', letterSpacing: '-1px', marginBottom: 12 }}>
                                Built for Developers,<br />By Developers
                            </h2>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
                            {features.map((f, i) => (
                                <div key={i} style={{
                                    background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32,
                                    transition: 'all 0.3s ease', cursor: 'default',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                    <div style={{
                                        width: 52, height: 52, borderRadius: 14, marginBottom: 20,
                                        background: `linear-gradient(135deg, ${f.color.replace('from-', '').replace(' to-', ', ')})`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontSize: 22,
                                        boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                                    }}>
                                        {f.icon}
                                    </div>
                                    <h3 style={{ fontSize: 19, fontWeight: 700, color: 'white', marginBottom: 10 }}>{f.title}</h3>
                                    <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7 }}>{f.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── TESTIMONIALS ── */}
                <section style={{ padding: '100px 6%', background: '#f8fafc' }}>
                    <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
                        <span style={{
                            display: 'inline-block', padding: '6px 16px', borderRadius: 100,
                            background: 'rgba(251,191,36,0.1)', color: '#d97706',
                            fontSize: 13, fontWeight: 700, marginBottom: 16, letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                        }}>Testimonials</span>
                        <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-1px', marginBottom: 48 }}>
                            Loved by Developers
                        </h2>

                        <div style={{ position: 'relative', minHeight: 200 }}>
                            {testimonials.map((t, i) => (
                                <div key={i} style={{
                                    position: i === activeTestimonial ? 'relative' : 'absolute',
                                    top: 0, left: 0, right: 0,
                                    opacity: i === activeTestimonial ? 1 : 0,
                                    transform: i === activeTestimonial ? 'translateY(0)' : 'translateY(20px)',
                                    transition: 'all 0.5s ease',
                                    pointerEvents: i === activeTestimonial ? 'auto' : 'none',
                                    background: 'white', borderRadius: 24, padding: '40px 48px',
                                    boxShadow: '0 4px 40px rgba(0,0,0,0.08)',
                                    border: '1px solid #e2e8f0',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 20 }}>
                                        {[...Array(t.stars)].map((_, j) => (
                                            <FiStar key={j} size={18} fill="#f59e0b" color="#f59e0b" />
                                        ))}
                                    </div>
                                    <p style={{ fontSize: 20, color: '#334155', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 28 }}>
                                        "{t.text}"
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                                        <div style={{
                                            width: 44, height: 44, borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                            color: 'white', fontWeight: 700, fontSize: 14,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>{t.avatar}</div>
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 15 }}>{t.name}</div>
                                            <div style={{ color: '#64748b', fontSize: 13 }}>{t.role}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                            {testimonials.map((_, i) => (
                                <button key={i} onClick={() => setActiveTestimonial(i)} style={{
                                    width: i === activeTestimonial ? 28 : 8, height: 8, borderRadius: 100, border: 'none', cursor: 'pointer',
                                    background: i === activeTestimonial ? '#6366f1' : '#cbd5e1',
                                    transition: 'all 0.3s ease', padding: 0,
                                }} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA BANNER ── */}
                <section style={{
                    padding: '100px 6%',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px',
                    }} />
                    <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
                        <h2 style={{ fontSize: 'clamp(32px, 5vw, 58px)', fontWeight: 900, color: 'white', letterSpacing: '-1.5px', marginBottom: 16 }}>
                            Ready to Ship Your<br />First Product?
                        </h2>
                        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', marginBottom: 48, lineHeight: 1.7 }}>
                            Join 10,000+ developers already making money on DevMarket.<br />
                            It's free to list — you only pay when you earn.
                        </p>
                        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                            {user ? (
                                <>
                                    <Link href={getSellLink()} style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 8,
                                        padding: '16px 36px', borderRadius: 14, fontWeight: 700, fontSize: 17,
                                        background: 'white', color: '#6366f1', textDecoration: 'none',
                                        boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                                        transition: 'all 0.3s',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        Go to Dashboard <FiArrowRight />
                                    </Link>
                                    <Link href="/marketplace" style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 8,
                                        padding: '16px 36px', borderRadius: 14, fontWeight: 700, fontSize: 17,
                                        background: 'rgba(255,255,255,0.15)', color: 'white',
                                        border: '2px solid rgba(255,255,255,0.4)',
                                        textDecoration: 'none', transition: 'all 0.3s',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                                    >
                                        Browse Products
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link href="/register" style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 8,
                                        padding: '16px 36px', borderRadius: 14, fontWeight: 700, fontSize: 17,
                                        background: 'white', color: '#6366f1', textDecoration: 'none',
                                        boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                                        transition: 'all 0.3s',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        Create Free Account <FiArrowRight />
                                    </Link>
                                    <Link href="/marketplace" style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 8,
                                        padding: '16px 36px', borderRadius: 14, fontWeight: 700, fontSize: 17,
                                        background: 'rgba(255,255,255,0.15)', color: 'white',
                                        border: '2px solid rgba(255,255,255,0.4)',
                                        textDecoration: 'none', transition: 'all 0.3s',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                                    >
                                        Browse Marketplace
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── FOOTER ── */}
                <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '60px 6% 32px' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 48 }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                    <div style={{
                                        width: 34, height: 34, borderRadius: 8,
                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <FiCode color="white" size={17} />
                                    </div>
                                    <span style={{ fontWeight: 800, fontSize: 18, color: 'white' }}>DevMarket</span>
                                </div>
                                <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 220 }}>
                                    India's premier marketplace for buying and selling developer products.
                                </p>
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, color: 'white', marginBottom: 16, fontSize: 15 }}>Product</div>
                                {['Browse Marketplace', 'Sell Your Product', 'Pricing'].map(l => (
                                    <div key={l} style={{ marginBottom: 10 }}>
                                        <Link href="/marketplace" style={{ color: '#64748b', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#6366f1'}
                                            onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                                        >{l}</Link>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, color: 'white', marginBottom: 16, fontSize: 15 }}>Account</div>
                                {[['Login', '/login'], ['Register', '/register'], ['Dashboard', '/developer/dashboard']].map(([l, h]) => (
                                    <div key={l} style={{ marginBottom: 10 }}>
                                        <Link href={h} style={{ color: '#64748b', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#6366f1'}
                                            onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                                        >{l}</Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid #1e293b', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                            <span style={{ fontSize: 13 }}>© 2025 DevMarket. All rights reserved.</span>
                            <span style={{ fontSize: 13 }}>Made with ❤️ for Indian Developers</span>
                        </div>
                    </div>
                </footer>
            </div>

            <style>{`
                @keyframes fadeSlideDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 0.3; }
                    50% { transform: scale(1.1); opacity: 0.5; }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(8px); }
                }
                * { margin: 0; padding: 0; box-sizing: border-box; }
            `}</style>
        </>
    );
}
