import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from './Navbar';
import Footer from './Footer';
import { FiHome, FiShoppingBag, FiMessageSquare, FiDollarSign, FiMonitor, FiUser } from 'react-icons/fi';
import { getUser } from '../utils/auth';

export default function Layout({ children }) {
    const router = useRouter();
    const [user, setUser] = useState(null);

    useEffect(() => {
        setUser(getUser());
    }, [router.pathname]);

    const navLinks = [
        { href: '/', label: 'Home', icon: <FiHome /> },
        { href: '/marketplace', label: 'Marketplace', icon: <FiShoppingBag /> },
        ...(user ? [{ href: '/chats', label: 'Chats', icon: <FiMessageSquare /> }] : []),
        ...(user?.role === 'buyer' ? [{ href: '/buyer/dashboard', label: 'My Purchases', icon: <FiMonitor /> }] : []),
        ...(user ? [{ href: '/developer/dashboard', label: 'Sell Products', icon: <FiMonitor /> }] : []),
        ...(user ? [{ href: '/wallet', label: 'My Wallet', icon: <FiDollarSign /> }] : []),
        ...(user ? [{ href: '/profile', label: 'My Profile', icon: <FiUser /> }] : []),
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Top Navbar */}
            <Navbar />

            {/* Below Navbar: Sidebar + Content */}
            <div className="flex flex-1">

                {/* Permanent Left Sidebar */}
                <aside className="hidden md:flex flex-col w-60 bg-white border-r border-sky-100 shadow-sm shrink-0 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
                    <nav className="py-4 px-3 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${router.pathname === link.href
                                        ? 'bg-primary-100 text-primary-700 border-l-4 border-primary-500'
                                        : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                                    }`}
                            >
                                <span className="text-lg">{link.icon}</span>
                                <span>{link.label}</span>
                            </Link>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-6 overflow-auto">
                    <div className="bg-white rounded-2xl shadow-sm min-h-full overflow-hidden">
                        {children}
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
}
