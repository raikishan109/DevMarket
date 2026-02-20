import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import api from '../utils/api';
import { setAuth } from '../utils/auth';
import { FiMail, FiLock, FiUser, FiCode } from 'react-icons/fi';

export default function Register() {
    const router = useRouter();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (router.isReady) setReady(true);
    }, [router.isReady]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'buyer'
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!ready) return null;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

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
            // ✅ FIXED API ROUTE
            const response = await api.post('/api/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role
            });

            if (response.data.success) {
                setAuth(response.data.token, response.data.user);

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
                    <div className="text-center mb-8">
                        <h2 className="text-4xl font-bold text-gray-900 mb-2">Create Account</h2>
                        <p className="text-gray-600">Join the developer marketplace</p>
                    </div>

                    <div className="card">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="label"><FiUser className="inline mr-2" />Full Name</label>
                                <input name="name" value={formData.name} onChange={handleChange} className="input" />
                            </div>

                            <div>
                                <label className="label"><FiMail className="inline mr-2" />Email</label>
                                <input name="email" value={formData.email} onChange={handleChange} className="input" />
                            </div>

                            <div>
                                <label className="label"><FiLock className="inline mr-2" />Password</label>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} className="input" />
                            </div>

                            <div>
                                <label className="label"><FiLock className="inline mr-2" />Confirm Password</label>
                                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="input" />
                            </div>

                            <button type="submit" disabled={loading} className="w-full btn btn-primary">
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-gray-600">
                                Already have an account?{' '}
                                <Link href="/login" className="text-primary-600 font-semibold">
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
