import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import api from '../utils/api';
import { FiSearch, FiFilter } from 'react-icons/fi';

export default function Marketplace() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [user, setUser] = useState(null);
    const [purchasedProductIds, setPurchasedProductIds] = useState([]);

    const categories = ['all', 'AI Tools', 'Automation', 'Websites', 'Mobile Apps', 'Other'];

    useEffect(() => {
        fetchUser();
        fetchProducts();
    }, []);

    useEffect(() => {
        filterAndSortProducts();
    }, [products, searchTerm, selectedCategory, sortBy]);

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await api.get('/auth/me');
                if (response.data.success) {
                    setUser(response.data.user);
                    fetchPurchasedProducts();
                }
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    const fetchPurchasedProducts = async () => {
        try {
            const response = await api.get('/orders/my-purchases');
            if (response.data.success) {
                const productIds = response.data.orders.map(order => order.product._id || order.product);
                setPurchasedProductIds(productIds);
            }
        } catch (error) {
            console.error('Error fetching purchased products:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            if (response.data.success) {
                setProducts(response.data.products);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortProducts = () => {
        let filtered = [...products];

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.problemSolved.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sort
        switch (sortBy) {
            case 'price-low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                filtered.sort((a, b) => b.averageRating - a.averageRating);
                break;
            default: // newest
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        setFilteredProducts(filtered);
    };

    return (
        <Layout>
            <Head>
                <title>Marketplace - DevMarket</title>
                <meta name="description" content="Browse developer tools, AI automation, websites, and mobile apps" />
            </Head>

            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Marketplace</h1>
                    <p className="text-xl text-primary-100">Discover innovative developer products</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Search and Filters */}
                <div className="mb-8 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                        <input
                            type="text"
                            placeholder="Search products by name or problem..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Category Filter */}
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <FiFilter className="inline mr-2" />
                                Category
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat === 'all' ? 'All Categories' : cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Sort By
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="newest">Newest First</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="rating">Highest Rated</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-gray-600">
                        Showing <span className="font-semibold">{filteredProducts.length}</span> products
                    </p>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="card skeleton h-96"></div>
                        ))}
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProducts.map(product => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                isPurchased={purchasedProductIds.includes(product._id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
                        <p className="text-gray-600">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>
        </Layout>
    );
}
