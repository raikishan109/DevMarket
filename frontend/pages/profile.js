import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../components/Layout';
import api from '../utils/api';
import { getUser } from '../utils/auth';
import { FiUser, FiMail, FiShield, FiEdit2, FiSave, FiX } from 'react-icons/fi';

export default function Profile() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        website: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const currentUser = getUser();
        if (!currentUser) {
            router.push('/login');
            return;
        }

        // Fetch complete user data from backend
        const fetchUserData = async () => {
            try {
                const response = await api.get('/auth/me');
                if (response.data.success) {
                    const userData = response.data.user;
                    setUser(userData);
                    setFormData({
                        name: userData.name || '',
                        bio: userData.bio || '',
                        website: userData.website || ''
                    });
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                // Fallback to localStorage data
                setUser(currentUser);
                setFormData({
                    name: currentUser.name || '',
                    bio: currentUser.bio || '',
                    website: currentUser.website || ''
                });
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        try {
            const response = await api.put('/auth/profile', formData);

            if (response.data.success) {
                // Update local storage
                const updatedUser = { ...user, ...formData };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                setEditing(false);
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update profile'
            });
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <div className="skeleton h-96"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <Head>
                <title>My Profile - DevMarket</title>
            </Head>

            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold mb-2">My Profile</h1>
                    <p className="text-primary-100">Manage your account information</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Success/Error Messages */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-red-50 border border-red-200 text-red-700'
                        }`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="md:col-span-1">
                        <div className="card text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{user?.name}</h2>
                            <p className="text-gray-600 mb-4">{user?.email}</p>

                            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full font-semibold">
                                <FiShield />
                                <span className="capitalize">{user?.role}</span>
                            </div>

                            {user?.role === 'developer' && (
                                <div className="mt-4">
                                    {user?.isVerified ? (
                                        <span className="badge badge-success">✓ Verified Developer</span>
                                    ) : (
                                        <span className="badge badge-warning">⏳ Pending Verification</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Profile Information */}
                    <div className="md:col-span-2">
                        <div className="card">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-gray-900">Profile Information</h3>
                                {!editing && (
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="btn btn-secondary flex items-center space-x-2"
                                    >
                                        <FiEdit2 />
                                        <span>Edit Profile</span>
                                    </button>
                                )}
                            </div>

                            {editing ? (
                                <form onSubmit={handleSubmit} className="space-y-6">
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
                                            required
                                        />
                                    </div>

                                    {user?.role === 'developer' && (
                                        <>
                                            <div>
                                                <label className="label">Bio</label>
                                                <textarea
                                                    name="bio"
                                                    value={formData.bio}
                                                    onChange={handleChange}
                                                    className="input"
                                                    rows="4"
                                                    placeholder="Tell us about yourself and your work..."
                                                ></textarea>
                                            </div>

                                            <div>
                                                <label className="label">Website</label>
                                                <input
                                                    type="url"
                                                    name="website"
                                                    value={formData.website}
                                                    onChange={handleChange}
                                                    className="input"
                                                    placeholder="https://yourwebsite.com"
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="flex space-x-4">
                                        <button type="submit" className="btn btn-primary flex items-center space-x-2">
                                            <FiSave />
                                            <span>Save Changes</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditing(false);
                                                setFormData({
                                                    name: user.name || '',
                                                    bio: user.bio || '',
                                                    website: user.website || ''
                                                });
                                                setMessage({ type: '', text: '' });
                                            }}
                                            className="btn btn-secondary flex items-center space-x-2"
                                        >
                                            <FiX />
                                            <span>Cancel</span>
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-1 block">
                                            <FiUser className="inline mr-2" />
                                            Full Name
                                        </label>
                                        <p className="text-gray-900 text-lg">{user?.name}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-1 block">
                                            <FiMail className="inline mr-2" />
                                            Email Address
                                        </label>
                                        <p className="text-gray-900 text-lg">{user?.email}</p>
                                    </div>

                                    {user?.role === 'developer' && (
                                        <>
                                            <div>
                                                <label className="text-sm font-semibold text-gray-700 mb-1 block">Bio</label>
                                                <p className="text-gray-700">
                                                    {user?.bio || 'No bio added yet. Click Edit Profile to add one.'}
                                                </p>
                                            </div>

                                            <div>
                                                <label className="text-sm font-semibold text-gray-700 mb-1 block">Website</label>
                                                {user?.website ? (
                                                    <a
                                                        href={user.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary-600 hover:text-primary-700 underline"
                                                    >
                                                        {user.website}
                                                    </a>
                                                ) : (
                                                    <p className="text-gray-500">No website added yet</p>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    <div className="pt-6 border-t border-gray-200">
                                        <label className="text-sm font-semibold text-gray-700 mb-1 block">Account Type</label>
                                        <p className="text-gray-900 text-lg capitalize">{user?.role}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-1 block">Member Since</label>
                                        <p className="text-gray-700">
                                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            }) : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
