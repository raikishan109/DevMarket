import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import api from '../utils/api';
import { setAuth } from '../utils/auth';
import { FiLock, FiMail, FiShield } from 'react-icons/fi';

export default function AdminLogin() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/api/auth/admin-login', formData);

            if (response.data.success) {
                const { token, user } = response.data;

                // Save auth data
                setAuth(token, user);

                // Redirect to admin dashboard
                router.push('/admin/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Admin Login - DevMarket</title>
                <meta name="description" content="Admin panel login" />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 py-12">
                <div className="max-w-md w-full">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-600 to-red-700 rounded-full mb-4 shadow-2xl">
                            <FiShield className="text-white text-4xl" />
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
                        <p className="text-gray-400">Secure administrative access</p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-500"
                                        placeholder="admin@devmarket.com"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-500"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                {loading ? 'Authenticating...' : 'Access Admin Panel'}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="mt-6 pt-6 border-t border-gray-700 text-center">
                            <Link href="/login" className="text-gray-400 hover:text-white transition-colors text-sm">
                                ← Back to User Login
                            </Link>
                        </div>
                    </div>

                    {/* Security Notice */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-500 text-sm">
                            🔒 This area is restricted to authorized administrators only
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
