import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getUser } from '../utils/auth';
import { FiCode, FiCpu, FiGlobe, FiSmartphone, FiArrowRight, FiCheck, FiTrendingUp, FiShield, FiZap } from 'react-icons/fi';

export default function Home() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        setUser(getUser());
    }, []);

    const getSellProductLink = () => {
        if (!user) return '/register';
        if (user.role === 'developer') return '/developer/dashboard';
        return '/developer/dashboard';
    };

    const categories = [
        {
            icon: <FiCpu className="text-4xl" />,
            name: 'AI Tools',
            description: 'Intelligent solutions powered by AI',
            color: 'from-purple-500 to-pink-500'
        },
        {
            icon: <FiZap className="text-4xl" />,
            name: 'Automation',
            description: 'Streamline workflows and save time',
            color: 'from-yellow-500 to-orange-500'
        },
        {
            icon: <FiGlobe className="text-4xl" />,
            name: 'Websites',
            description: 'Ready-to-use web applications',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            icon: <FiSmartphone className="text-4xl" />,
            name: 'Mobile Apps',
            description: 'iOS and Android applications',
            color: 'from-green-500 to-teal-500'
        }
    ];

    const features = [
        {
            icon: <FiShield />,
            title: 'Secure Payments',
            description: 'Safe and secure transactions with Razorpay'
        },
        {
            icon: <FiCheck />,
            title: 'Quality Assured',
            description: 'All products are reviewed and approved'
        },
        {
            icon: <FiTrendingUp />,
            title: 'Grow Your Business',
            description: 'Reach thousands of potential customers'
        }
    ];

    return (
        <Layout>
            <Head>
                <title>DevMarket - Marketplace for Developer Tools & Products</title>
                <meta name="description" content="Buy and sell developer tools, AI automation, websites, and mobile apps" />
            </Head>

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
                    <div className="text-center animate-fade-in">
                        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
                            The Developer
                            <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                                Marketplace
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
                            Buy and sell developer tools, AI automation, websites, and mobile apps.
                            Problem-first solutions for real-world challenges.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link href="/marketplace" className="btn bg-white text-primary-600 hover:bg-gray-100 shadow-2xl flex items-center space-x-2 text-lg">
                                <span>Browse Products</span>
                                <FiArrowRight />
                            </Link>
                            <Link href={getSellProductLink()} className="btn bg-primary-500 hover:bg-primary-400 border-2 border-white text-lg">
                                {user ? 'Sell Your Product' : 'Start Selling'}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 animate-slide-up">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Explore Categories
                        </h2>
                        <p className="text-xl text-gray-600">
                            Find the perfect solution for your needs
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {categories.map((category, index) => (
                            <div
                                key={index}
                                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 border border-gray-100 overflow-hidden"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                                <div className="relative">
                                    <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center text-white mb-4 transform group-hover:scale-110 transition-transform duration-300`}>
                                        {category.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        {category.name}
                                    </h3>
                                    <p className="text-gray-600">
                                        {category.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Why Choose DevMarket?
                        </h2>
                        <p className="text-xl text-gray-600">
                            The trusted platform for developers worldwide
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-8 text-center"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to Get Started?
                    </h2>
                    <p className="text-xl text-primary-100 mb-8">
                        Join thousands of developers buying and selling innovative products
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {user ? (
                            <>
                                <Link href={getSellProductLink()} className="btn bg-white text-primary-600 hover:bg-gray-100 shadow-xl text-lg">
                                    Sell Your Product
                                </Link>
                                <Link href="/marketplace" className="btn bg-primary-500 hover:bg-primary-400 border-2 border-white text-lg">
                                    Browse Marketplace
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 shadow-xl text-lg">
                                    Create Account
                                </Link>
                                <Link href="/marketplace" className="btn bg-primary-500 hover:bg-primary-400 border-2 border-white text-lg">
                                    Browse Marketplace
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>
        </Layout>
    );
}
