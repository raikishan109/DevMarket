import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { FiUser, FiLogOut, FiPackage } from 'react-icons/fi';
import { getUser, clearAuth } from '../utils/auth';

export default function Navbar() {
    const router = useRouter();
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
        <nav className="bg-white shadow-sm border-b border-sky-100 sticky top-0 z-50">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">

                    {/* Left: Logo */}
                    <div className="flex items-center">
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
                    <div className="flex items-center space-x-2">
                        {user ? (
                            <>
                                <Link href="/profile" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors">
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
    );
}
