import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getUser, clearAuth } from '../utils/auth';
import { FiLogOut, FiShield } from 'react-icons/fi';

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

    if (!mounted) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Admin Top Bar */}
            <nav className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                                    <div className="text-right">
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
                                        <span>Logout</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main>
                {children}
            </main>

            {/* Admin Footer */}
            <footer className="bg-gray-900 text-white py-6 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-gray-400 text-sm">
                        🔒 Secure Admin Area • DevMarket Platform
                    </p>
                </div>
            </footer>
        </div>
    );
}
