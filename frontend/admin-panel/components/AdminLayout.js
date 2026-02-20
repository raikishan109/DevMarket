import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getUser, clearAuth } from '../utils/auth';
import {
    FiLogOut, FiShield, FiGrid, FiPackage, FiUsers,
    FiDollarSign, FiMessageSquare, FiSettings, FiCreditCard,
    FiArrowDownCircle, FiCheckSquare, FiAlertCircle, FiUserCheck, FiMenu, FiX, FiDatabase
} from 'react-icons/fi';

export default function AdminLayout({ children }) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [mounted, setMounted] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

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

    const isActive = (href, tab) => {
        if (href === '/admin/platform-wallet') return router.pathname === href;
        return router.pathname === '/admin/dashboard' && router.query.tab === tab;
    };

    const navLinks = [
        { href: '/admin/dashboard', tab: 'overview', label: 'Overview', icon: <FiGrid /> },
        { href: '/admin/dashboard?tab=pending', tab: 'pending', label: 'Pending Products', icon: <FiPackage /> },
        { href: '/admin/dashboard?tab=approved', tab: 'approved', label: 'Approved Products', icon: <FiCheckSquare /> },
        { href: '/admin/dashboard?tab=developers', tab: 'developers', label: 'Developers', icon: <FiUserCheck /> },
        { href: '/admin/dashboard?tab=users', tab: 'users', label: 'Users', icon: <FiUsers /> },
        { href: '/admin/dashboard?tab=payments', tab: 'payments', label: 'Payments', icon: <FiCreditCard /> },
        { href: '/admin/dashboard?tab=withdrawals', tab: 'withdrawals', label: 'Withdrawals', icon: <FiArrowDownCircle /> },
        { href: '/admin/platform-wallet', tab: null, label: 'Platform Wallet', icon: <FiDollarSign /> },
        { href: '/admin/dashboard?tab=reportedChats', tab: 'reportedChats', label: 'Reported Chats', icon: <FiAlertCircle /> },
        { href: '/admin/dashboard?tab=chats', tab: 'chats', label: 'All Chats', icon: <FiMessageSquare /> },
        ...(!user?.isSubAdmin ? [{ href: '/admin/dashboard?tab=subAdmins', tab: 'subAdmins', label: 'Sub-Admins', icon: <FiUsers /> }] : []),
        { href: '/admin/dashboard?tab=settings', tab: 'settings', label: 'Settings', icon: <FiSettings /> },
        ...(!user?.isSubAdmin ? [{ href: '/admin/dashboard?tab=database', tab: 'database', label: 'Database', icon: <FiDatabase /> }] : []),
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full">

            {/* Nav Links */}
            <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
                {navLinks.map((link) => {
                    const active = link.tab === null
                        ? router.pathname === '/admin/platform-wallet'
                        : router.pathname === '/admin/dashboard' && (router.query.tab === link.tab || (!router.query.tab && link.tab === 'overview'));

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium transition-all text-sm ${active
                                ? 'bg-red-600 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <span className="text-base shrink-0">{link.icon}</span>
                            <span className="truncate">{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout at bottom */}
            <div className="p-3 border-t border-gray-700 shrink-0">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-red-900/40 hover:text-red-400 font-medium transition-all text-sm"
                >
                    <FiLogOut />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );

    if (!mounted) return <div className="min-h-screen bg-gray-900" />;

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
            {/* Top Navbar */}
            <nav className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg sticky top-0 z-50">
                <div className="px-4 sm:px-6">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center space-x-3">
                            {/* Mobile menu button */}
                            <button
                                className="md:hidden text-gray-400 hover:text-white"
                                onClick={() => setMobileOpen(!mobileOpen)}
                            >
                                {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                            </button>
                            <div className="w-9 h-9 bg-gradient-to-r from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                                <FiShield className="text-white text-lg" />
                            </div>
                            <div>
                                <h1 className="text-white font-bold">Admin Panel</h1>
                                <p className="text-gray-400 text-xs">DevMarket Administration</p>
                            </div>
                        </div>

                        {user && (
                            <div className="flex items-center space-x-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-white font-medium text-sm">{user.name}</p>
                                    <p className="text-gray-400 text-xs">{user.isSubAdmin ? 'Sub-Admin' : 'Main Admin'}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                                >
                                    <FiLogOut />
                                    <span className="hidden sm:block">Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Below navbar: Sidebar + Content */}
            <div className="flex flex-1 relative">
                {/* Desktop Sidebar */}
                <aside className="hidden md:flex flex-col w-56 bg-gray-900 shrink-0 sticky top-16 h-[calc(100vh-64px)]">
                    <SidebarContent />
                </aside>

                {/* Mobile Sidebar Overlay */}
                {mobileOpen && (
                    <div className="md:hidden fixed inset-0 z-40 flex">
                        <div className="w-56 bg-gray-900 flex flex-col">
                            <SidebarContent />
                        </div>
                        <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-1 overflow-auto bg-gray-800">
                    {children}
                </main>
            </div>
        </div>
    );
}
