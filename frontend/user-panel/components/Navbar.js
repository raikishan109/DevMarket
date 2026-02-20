import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { FiMenu, FiX, FiUser, FiLogOut, FiPackage, FiHome, FiShoppingBag, FiMessageSquare, FiDollarSign, FiMonitor } from 'react-icons/fi';
import { getUser, clearAuth } from '../utils/auth';

export default function Navbar() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        setUser(getUser());
    }, [router.pathname]);

    const handleLogout = () => {
        clearAuth();
        setUser(null);
        router.push('/');
    };

    const navLinks = [
        { href: '/', label: 'Home', icon: <FiHome />, show: true },
        { href: '/marketplace', label: 'Marketplace', icon: <FiShoppingBag />, show: true },
        { href: '/chats', label: 'Chats', icon: <FiMessageSquare />, show: !!user },
        { href: '/buyer/dashboard', label: 'My Purchases', icon: <FiMonitor />, show: user?.role === 'buyer' },
        { href: '/developer/dashboard', label: 'Sell Products', icon: <FiMonitor />, show: !!user },
        { href: '/wallet', label: 'My Wallet', icon: <FiDollarSign />, show: !!user },
    ].filter(link => link.show);

    return (
        <>
            {/* ===== LEFT SIDEBAR (Desktop) ===== */}
            <div className="hidden md:flex fixed top-0 left-0 h-full w-60 bg-white shadow-xl border-r border-sky-100 z-40 flex-col">
                {/* Sidebar Links */}
                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${router.pathname === link.href
                                    ? 'bg-primary-100 text-primary-700 shadow-sm'
                                    : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                                }`}
                        >
                            <span className="text-lg">{link.icon}</span>
                            <span>{link.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>

            {/* ===== MOBILE SIDEBAR OVERLAY ===== */}
            {sidebarOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    <div className="w-60 bg-white shadow-xl border-r border-sky-100 flex flex-col">
                        <div className="h-16 px-4 flex items-center justify-between border-b border-gray-100">
                            <span className="font-bold text-primary-600">Menu</span>
                            <button onClick={() => setSidebarOpen(false)}>
                                <FiX size={22} className="text-gray-600" />
                            </button>
                        </div>
                        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${router.pathname === link.href
                                            ? 'bg-primary-100 text-primary-700'
                                            : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                                        }`}
                                >
                                    <span className="text-lg">{link.icon}</span>
                                    <span>{link.label}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                    {/* Backdrop */}
                    <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
                </div>
            )}

            {/* ===== TOP NAVBAR ===== */}
            <nav className="bg-white shadow-sm border-b border-sky-100 sticky top-0 z-30 md:ml-60">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">

                        {/* Left: Hamburger (mobile) + Logo */}
                        <div className="flex items-center space-x-3">
                            <button
                                className="md:hidden text-gray-600 hover:text-primary-600"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <FiMenu size={22} />
                            </button>
                            <Link href="/" className="flex items-center space-x-2">
                                <div className="w-9 h-9 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                                    <FiPackage className="text-white text-lg" />
                                </div>
                                <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                                    DevMarket
                                </span>
                            </Link>
                        </div>

                        {/* Right: Profile + Logout */}
                        <div className="flex items-center space-x-3">
                            {user ? (
                                <>
                                    <Link
                                        href="/profile"
                                        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors"
                                    >
                                        <FiUser className="text-primary-500" />
                                        <span className="hidden sm:block">{user.name}</span>
                                        <span className="badge badge-info text-xs hidden sm:block">{user.role}</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-1 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 font-medium transition-colors"
                                    >
                                        <FiLogOut />
                                        <span className="hidden sm:block">Logout</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="text-gray-700 hover:text-primary-600 font-medium px-3 py-2 transition-colors">
                                        Login
                                    </Link>
                                    <Link href="/register" className="btn btn-primary text-sm">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}
