import Link from 'next/link';
import { FiCode, FiGithub, FiTwitter, FiLinkedin, FiMail } from 'react-icons/fi';

export default function Footer() {
    return (
        <footer style={{ background: '#0f172a', borderTop: '1px solid rgba(99,102,241,0.15)', color: '#94a3b8', padding: '56px 6% 28px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 48 }}>

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                            <div style={{
                                width: 34, height: 34, borderRadius: 8,
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <FiCode color="white" size={17} />
                            </div>
                            <span style={{ fontWeight: 800, fontSize: 17, color: 'white' }}>DevMarket</span>
                        </div>
                        <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 220 }}>
                            India's premier marketplace for buying and selling developer products.
                        </p>
                        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                            {[FiGithub, FiTwitter, FiLinkedin, FiMail].map((Icon, i) => (
                                <a key={i} href="#" style={{
                                    width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                                    color: '#818cf8', transition: 'all 0.2s',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.25)'; e.currentTarget.style.color = 'white'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.color = '#818cf8'; }}
                                >
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div style={{ fontWeight: 700, color: 'white', marginBottom: 16, fontSize: 15 }}>Product</div>
                        {[['Browse Marketplace', '/marketplace'], ['Sell Your Product', '/register'], ['Login', '/login']].map(([l, h]) => (
                            <div key={l} style={{ marginBottom: 10 }}>
                                <Link href={h} style={{ color: '#64748b', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#818cf8'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                                >{l}</Link>
                            </div>
                        ))}
                    </div>

                    <div>
                        <div style={{ fontWeight: 700, color: 'white', marginBottom: 16, fontSize: 15 }}>Categories</div>
                        {['AI Tools', 'Automation', 'Websites', 'Mobile Apps', 'Scripts & APIs'].map(c => (
                            <div key={c} style={{ marginBottom: 10, fontSize: 14, color: '#64748b' }}>{c}</div>
                        ))}
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #1e293b', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <span style={{ fontSize: 13 }}>© {new Date().getFullYear()} DevMarket. All rights reserved.</span>
                    <span style={{ fontSize: 13 }}>Made with ❤️ for Indian Developers</span>
                </div>
            </div>
        </footer>
    );
}
