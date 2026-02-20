import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getUser, clearAuth } from '../utils/auth';
import { FiLogOut, FiShield, FiGrid, FiPackage, FiUsers, FiDollarSign, FiMessageSquare, FiSettings, FiCreditCard, FiArrowDownCircle } from 'react-icons/fi';

export default function AdminLayout({ children }) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const currentUser = getUser();
        if (!currentUser || currentUser.role !== 'admin') {
            router.push('/admin-login');
        } else {
            setUser(currentUser);
        }
    }, [router.pathname]);

    const handleLogout = () => {
        clearAuth();
        router.push('/admin-login');
    };

    const navLinks = [
        { href: '/admin/dashboard', label: 'Overview', icon: <FiGrid /> },
        { href: '/admin/dashboard?tab=pending', label: 'Pending Products', icon: <FiPackage /> },
        { href: '/admin/dashboard?tab=developers', label: 'Developers', icon: <FiUsers /> },
        { href: '/admin/dashboard?tab=users', label: 'Users', icon: <FiUsers /> },
        { href: '/admin/dashboard?tab=payments', label: 'Payments', icon: <FiCreditCard /> },
        { href: '/admin/dashboard?tab=withdrawals', label: 'Withdrawals', icon: <FiArrowDownCircle /> },
        { href: '/admin/platform-wallet', label: 'Platform Wallet', icon: <FiDollarSign /> },
        { href: '/admin/dashboard?tab=chats', label: 'Chats', icon: <FiMessageSquare /> },
        { href: '/admin/dashboard?tab=settings', label: 'Settings', icon: <FiSettings /> },
    ];

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Top Navbar */}
            <nav className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg sticky top-0 z-50">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                                <FiShield className="text-white text-xl" />
                            </div>
                            <div>
                                <h1 className="text-white font-bold text-lg">Admin Panel</h1>
                                <p className="text-gray-400 text-xs">DevMarket Administration</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {user && (
                                <>
                                    <div className="text-right hidden sm:block">
                                        <p className="text-white font-medium">{user.name}</p>
                                        <p className="text-gray-400 text-xs">
                                            {user.isSubAdmin ? 'Sub-Admin' : 'Main Admin'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                                    >
                                        <FiLogOut />
                                        <span className="hidden sm:block">Logout</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Below Navbar: Sidebar + Content */}
            <div className="flex flex-1">
                {/* Permanent Sidebar */}
                <aside className="hidden md:flex flex-col w-56 bg-gray-900 shrink-0 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
                    <nav className="py-4 px-2 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium transition-all text-sm ${router.pathname === link.href
                                        ? 'bg-red-600 text-white'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <span className="text-base">{link.icon}</span>
                                <span>{link.label}</span>
                            </Link>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-4 md:ml-0">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-400 text-sm">🔒 Secure Admin Area • DevMarket Platform</p>
                </div>
            </footer>
        </div>
    );
}
