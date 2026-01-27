import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import api from '../utils/api';
import { setAuth } from '../utils/auth';
import { FiMail, FiLock, FiUser, FiCode } from 'react-icons/fi';

export default function Register() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'buyer'
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

        // Validation
        if (!formData.name || !formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role
            });

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
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Head>
                <title>Register - DevMarket</title>
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md mx-auto">
                    <div className="text-center mb-8 animate-fade-in">
                        <h2 className="text-4xl font-bold text-gray-900 mb-2">Create Account</h2>
                        <p className="text-gray-600">Join the developer marketplace</p>
                    </div>

                    <div className="card animate-slide-up">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name */}
                            <div>
                                <label className="label">
                                    <FiUser className="inline mr-2" />
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="label">
                                    <FiMail className="inline mr-2" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="label">
                                    <FiLock className="inline mr-2" />
                                    Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="label">
                                    <FiLock className="inline mr-2" />
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            {/* Role Selection */}
                            <div>
                                <label className="label">
                                    <FiCode className="inline mr-2" />
                                    I want to
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: 'buyer' })}
                                        className={`p-4 rounded-lg border-2 transition-all ${formData.role === 'buyer'
                                                ? 'border-primary-600 bg-primary-50'
                                                : 'border-gray-300 hover:border-primary-300'
                                            }`}
                                    >
                                        <div className="font-semibold text-gray-900">Buy Products</div>
                                        <div className="text-sm text-gray-600">Browse & purchase</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: 'developer' })}
                                        className={`p-4 rounded-lg border-2 transition-all ${formData.role === 'developer'
                                                ? 'border-primary-600 bg-primary-50'
                                                : 'border-gray-300 hover:border-primary-300'
                                            }`}
                                    >
                                        <div className="font-semibold text-gray-900">Sell Products</div>
                                        <div className="text-sm text-gray-600">List & earn</div>
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn btn-primary"
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-gray-600">
                                Already have an account?{' '}
                                <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                                    Login
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
