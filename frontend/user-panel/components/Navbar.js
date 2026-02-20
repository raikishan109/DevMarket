import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { FiUser, FiLogOut, FiPackage, FiHome, FiShoppingBag, FiMessageSquare, FiDollarSign, FiMonitor, FiGrid, FiX } from 'react-icons/fi';
import { getUser, clearAuth } from '../utils/auth';

// Sidebar state is shared via module-level so Layout can use it
let _setSidebarOpen = null;
export const toggleSidebar = (val) => _setSidebarOpen && _setSidebarOpen(val);

export default function Navbar() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState(null);

    // Expose setter globally
    _setSidebarOpen = setSidebarOpen;

    useEffect(() => {
        setUser(getUser());
    }, [router.pathname]);

    const handleLogout = () => {
        clearAuth();
        setUser(null);
        setSidebarOpen(false);
        router.push('/');
    };

    const navLinks = [
        { href: '/', label: 'Home', icon: <FiHome /> },
        { href: '/marketplace', label: 'Marketplace', icon: <FiShoppingBag /> },
        ...(user ? [{ href: '/chats', label: 'Chats', icon: <FiMessageSquare /> }] : []),
        ...(user?.role === 'buyer' ? [{ href: '/buyer/dashboard', label: 'My Purchases', icon: <FiMonitor /> }] : []),
        ...(user ? [{ href: '/developer/dashboard', label: 'Sell Products', icon: <FiMonitor /> }] : []),
        ...(user ? [{ href: '/wallet', label: 'My Wallet', icon: <FiDollarSign /> }] : []),
    ];

    return (
        <>
            {/* ===== FIXED LEFT SIDEBAR ===== */}
            <div className={`fixed top-0 left-0 h-full z-40 flex flex-col bg-white shadow-xl border-r border-sky-100 transition-all duration-300 ${sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full overflow-hidden'}`}>
                {/* Sidebar Header */}
                <div className="h-16 px-5 flex items-center justify-between border-b border-sky-100 bg-gradient-to-r from-primary-500 to-primary-600 shrink-0">
                    <span className="text-white font-bold text-lg whitespace-nowrap">📋 Dashboard</span>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* User Info */}
                {user && (
                    <div className="px-5 py-4 bg-primary-50 border-b border-sky-100 shrink-0">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary-200 rounded-full flex items-center justify-center shrink-0">
                                <FiUser className="text-primary-600 text-lg" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                                <span className="badge badge-info text-xs capitalize">{user.role}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Nav Links */}
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${router.pathname === link.href
                                    ? 'bg-primary-100 text-primary-700 shadow-sm border-l-4 border-primary-500'
                                    : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                                }`}
                        >
                            <span className="text-lg shrink-0">{link.icon}</span>
                            <span>{link.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Sidebar Footer - Logout */}
                {user && (
                    <div className="p-4 border-t border-sky-100 shrink-0">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-medium transition-colors whitespace-nowrap"
                        >
                            <FiLogOut />
                            <span>Logout</span>
                        </button>
                    </div>
                )}
            </div>

            {/* ===== TOP NAVBAR ===== */}
            <nav className={`bg-white shadow-sm border-b border-sky-100 sticky top-0 z-30 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">

                        {/* Left: Logo + Dashboard Button */}
                        <div className="flex items-center space-x-4">
                            <Link href="/" className="flex items-center space-x-2">
                                <div className="w-9 h-9 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                                    <FiPackage className="text-white text-lg" />
                                </div>
                                <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                                    DevMarket
                                </span>
                            </Link>

                            {/* Dashboard Toggle Button */}
                            <button
                                onClick={() => { router.push('/marketplace'); setSidebarOpen(true); }}
                                className="flex items-center space-x-2 px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-600 rounded-xl font-medium transition-all border border-primary-200 hover:border-primary-300"
                            >
                                <FiGrid size={18} />
                                <span className="hidden sm:block">Dashboard</span>
                            </button>
                        </div>

                        {/* Right: Profile + Logout */}
                        <div className="flex items-center space-x-2">
                            {user ? (
                                <>
                                    <Link
                                        href="/profile"
                                        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors"
                                    >
                                        <FiUser className="text-primary-500" />
                                        <span className="hidden sm:block text-sm">{user.name}</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-1 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 font-medium transition-colors"
                                    >
                                        <FiLogOut />
                                        <span className="hidden sm:block text-sm">Logout</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="text-gray-700 hover:text-primary-600 font-medium px-3 py-2 text-sm transition-colors">
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
