import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { FiMenu, FiX, FiUser, FiLogOut, FiPackage } from 'react-icons/fi';
import { getUser, clearAuth } from '../utils/auth';

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
        <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">

                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                            <FiPackage className="text-white text-xl" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                            DevMarket
                        </span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center space-x-1">
                        <Link href="/" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors">
                            🏠 Home
                        </Link>
                        <Link href="/marketplace" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors">
                            🛍️ Marketplace
                        </Link>

                        {user && (
                            <Link href="/chats" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors">
                                💬 Chats
                            </Link>
                        )}

                        {user && user.role === 'developer' && (
                            <Link href="/developer/dashboard" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors">
                                💼 Sell Products
                            </Link>
                        )}

                        {user && user.role === 'buyer' && (
                            <>
                                <Link href="/buyer/dashboard" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors">
                                    🛒 My Purchases
                                </Link>
                                <Link href="/developer/dashboard" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors">
                                    💼 Sell Products
                                </Link>
                            </>
                        )}

                        {user && (
                            <Link href="/wallet" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors">
                                💰 Wallet
                            </Link>
                        )}
                    </div>

                    {/* Desktop Right Side - Auth */}
                    <div className="hidden md:flex items-center space-x-3">
                        {user ? (
                            <>
                                <Link href="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 font-medium transition-colors">
                                    <FiUser />
                                    <span>{user.name}</span>
                                    <span className="badge badge-info text-xs">{user.role}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-1 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 font-medium transition-colors"
                                >
                                    <FiLogOut />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="text-gray-700 hover:text-primary-600 font-medium transition-colors px-4 py-2">
                                    Login
                                </Link>
                                <Link href="/register" className="btn btn-primary">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
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
                    <div className="px-4 pt-2 pb-4 space-y-1">
                        <Link href="/" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors" onClick={() => setIsOpen(false)}>
                            🏠 Home
                        </Link>
                        <Link href="/marketplace" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors" onClick={() => setIsOpen(false)}>
                            🛍️ Marketplace
                        </Link>

                        {user && (
                            <Link href="/chats" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors" onClick={() => setIsOpen(false)}>
                                💬 Chats
                            </Link>
                        )}

                        {user ? (
                            <>
                                {user.role === 'developer' && (
                                    <Link href="/developer/dashboard" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors" onClick={() => setIsOpen(false)}>
                                        💼 Sell Products
                                    </Link>
                                )}
                                {user.role === 'buyer' && (
                                    <>
                                        <Link href="/buyer/dashboard" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors" onClick={() => setIsOpen(false)}>
                                            🛒 My Purchases
                                        </Link>
                                        <Link href="/developer/dashboard" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors" onClick={() => setIsOpen(false)}>
                                            💼 Sell Products
                                        </Link>
                                    </>
                                )}
                                <Link href="/wallet" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors" onClick={() => setIsOpen(false)}>
                                    💰 Wallet
                                </Link>
                                <Link href="/profile" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors" onClick={() => setIsOpen(false)}>
                                    <FiUser className="inline mr-2" />{user.name}
                                </Link>
                                <button
                                    onClick={() => { handleLogout(); setIsOpen(false); }}
                                    className="w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-red-50 font-medium transition-colors"
                                >
                                    <FiLogOut className="inline mr-2" />Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors" onClick={() => setIsOpen(false)}>
                                    Login
                                </Link>
                                <Link href="/register" className="block px-3 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 font-medium transition-colors text-center" onClick={() => setIsOpen(false)}>
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
