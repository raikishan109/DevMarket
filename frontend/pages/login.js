import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import api from '../utils/api';
import { setAuth } from '../utils/auth';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

export default function Login() {
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

        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/login', formData);

            if (response.data.success) {
                setAuth(response.data.token, response.data.user);

                // Redirect based on role
                if (response.data.user.role === 'developer') {
                    router.push('/developer/dashboard');
                } else {
                    router.push('/marketplace');
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Head>
                <title>Login - DevMarket</title>
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center">
                <div className="max-w-md mx-auto w-full">
                    {/* Header */}
                    <div className="text-center mb-8 animate-fade-in">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl mb-4 shadow-lg">
                            <FiLock className="text-white text-2xl" />
                        </div>
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                            Welcome Back
                        </h2>
                        <p className="text-gray-600">Sign in to continue to DevMarket</p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 animate-slide-up border border-gray-100">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start">
                                <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FiMail className="text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FiLock className="text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center group"
                            >
                                {loading ? (
                                    <span>Logging in...</span>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">New to DevMarket?</span>
                            </div>
                        </div>

                        {/* Register Link */}
                        <div className="text-center">
                            <Link
                                href="/register"
                                className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                            >
                                Create an account
                                <FiArrowRight className="ml-1" />
                            </Link>
                        </div>
                    </div>

                    {/* Footer Links */}
                    <div className="mt-6 text-center space-y-2">
                        <p className="text-sm text-gray-600">
                            Are you an administrator?{' '}
                            <Link href="/admin-login" className="text-primary-600 hover:text-primary-700 font-semibold">
                                Admin Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
