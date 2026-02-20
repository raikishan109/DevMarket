import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { FiMenu, FiX, FiUser, FiLogOut, FiShoppingBag, FiPackage, FiMessageSquare } from 'react-icons/fi';
import { getUser, clearAuth, isAuthenticated } from '../utils/auth';

export default function Navbar() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        setUser(getUser());
    }, [router.pathname]);

    const handleLogout = () => {
        clearAuth();
        setUser(null);
        router.push('/');
    };

    return (
        <>
            {/* Left Sidebar Menu - Always Open on Desktop */}
            <div className="hidden md:block fixed top-0 left-0 h-full w-64 bg-white shadow-xl border-r border-gray-200 z-40 overflow-y-auto">
                <div className="h-16 px-4 flex items-center border-b border-gray-200 shadow-lg bg-white sticky top-0 z-10">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                            <FiPackage className="text-white text-xl" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                            DevMarket
                        </span>
                    </Link>
                </div>
                <nav className="py-4">
                    <Link href="/" className="block px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors border-b border-gray-100">
                        🏠 Home
                    </Link>
                    <Link href="/marketplace" className="block px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors border-b border-gray-100">
                        🛍️ Marketplace
                    </Link>

                    {user && (
                        <Link href="/chats" className="block px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors border-b border-gray-100">
                            💬 Chats
                        </Link>
                    )}

                    {user && user.role === 'developer' && (
                        <Link href="/developer/dashboard" className="block px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors border-b border-gray-100">
                            💼 Sell Products
                        </Link>
                    )}

                    {user && user.role === 'buyer' && (
                        <>
                            <Link href="/buyer/dashboard" className="block px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors border-b border-gray-100">
                                🛒 My Purchases
                            </Link>
                            <Link href="/developer/dashboard" className="block px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors border-b border-gray-100">
                                💼 Sell Products
                            </Link>
                        </>
                    )}

                    {user && (
                        <Link href="/wallet" className="block px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors border-b border-gray-100">
                            💰 My Wallet
                        </Link>
                    )}
                </nav>
            </div>

            {/* Top Navbar - Pushed to right on desktop */}
            <nav className="bg-white shadow-lg sticky top-0 z-50 md:ml-64">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo - Only visible on mobile */}
                        <div className="flex items-center space-x-4 md:hidden">
                            <Link href="/" className="flex items-center space-x-2">
                                <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                                    <FiPackage className="text-white text-xl" />
                                </div>
                                <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                                    DevMarket
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Right Side */}
                        <div className="hidden md:flex items-center space-x-4 ml-auto">
                            {user ? (
                                <div className="flex items-center space-x-4">
                                    <Link href="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 font-medium transition-colors">
                                        <FiUser className="text-gray-600" />
                                        <span>My Profile</span>
                                    </Link>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-gray-700 font-medium">{user.name}</span>
                                        <span className="badge badge-info">{user.role}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium transition-colors"
                                    >
                                        <FiLogOut />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <Link href="/login" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                                        Login
                                    </Link>
                                    <Link href="/register" className="btn btn-primary">
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="text-gray-700 hover:text-primary-600 focus:outline-none"
                            >
                                {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="md:hidden bg-white border-t border-gray-200">
                        <div className="px-4 pt-2 pb-4 space-y-2">
                            <Link
                                href="/"
                                className="block px-3 py-2 rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                🏠 Home
                            </Link>
                            <Link
                                href="/marketplace"
                                className="block px-3 py-2 rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                🛍️ Marketplace
                            </Link>

                            {user && (
                                <Link
                                    href="/chats"
                                    className="block px-3 py-2 rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    💬 Chats
                                </Link>
                            )}

                            {user ? (
                                <>
                                    {user.role === 'developer' && (
                                        <Link
                                            href="/developer/dashboard"
                                            className="block px-3 py-2 rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Sell Products
                                        </Link>
                                    )}
                                    {user.role === 'buyer' && (
                                        <>
                                            <Link
                                                href="/buyer/dashboard"
                                                className="block px-3 py-2 rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                My Purchases
                                            </Link>
                                            <Link
                                                href="/developer/dashboard"
                                                className="block px-3 py-2 rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                Sell Products
                                            </Link>
                                        </>
                                    )}

                                    <Link
                                        href="/wallet"
                                        className="block px-3 py-2 rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        My Wallet
                                    </Link>

                                    <Link
                                        href="/profile"
                                        className="block px-3 py-2 rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        My Profile
                                    </Link>

                                    <div className="px-3 py-2 border-t border-gray-200 mt-2">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <FiUser className="text-gray-600" />
                                            <span className="text-gray-700 font-medium">{user.name}</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsOpen(false);
                                            }}
                                            className="w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-red-50 font-medium transition-colors"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="block px-3 py-2 rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="block px-3 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 font-medium transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}
