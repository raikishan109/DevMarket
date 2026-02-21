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
                const response = await api.get('/api/auth/me');
                if (response.data.success) {
                    setUser(response.data.user);
                    fetchPurchasedProducts();
                }
            }
        } catch (error) { console.error(error); }
    };

    const fetchPurchasedProducts = async () => {
        try {
            const response = await api.get('/api/orders/my-purchases');
            if (response.data.success) {
                const productIds = response.data.orders.map(o => o.product._id || o.product);
                setPurchasedProductIds(productIds);
            }
        } catch (error) { console.error(error); }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get('/api/products');
            if (response.data.success) setProducts(response.data.products);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const filterAndSortProducts = () => {
        let filtered = [...products];
        if (selectedCategory !== 'all') filtered = filtered.filter(p => p.category === selectedCategory);
        if (searchTerm) filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.problemSolved.toLowerCase().includes(searchTerm.toLowerCase())
        );
        switch (sortBy) {
            case 'price-low': filtered.sort((a, b) => a.price - b.price); break;
            case 'price-high': filtered.sort((a, b) => b.price - a.price); break;
            case 'rating': filtered.sort((a, b) => b.averageRating - a.averageRating); break;
            default: filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        setFilteredProducts(filtered);
    };

    return (
        <Layout>
            <Head>
                <title>Marketplace - DevMarket</title>
                <meta name="description" content="Browse developer tools, AI automation, websites, and mobile apps" />
            </Head>

            {/* Hero */}
            <div style={{
                background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 100%)',
                padding: '64px 40px',
                borderBottom: '1px solid rgba(99,102,241,0.2)',
                position: 'relative', overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute', top: '-50%', right: '-10%',
                    width: 400, height: 400, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />
                <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: 'white', marginBottom: 8, letterSpacing: '-1px' }}>
                    Marketplace
                </h1>
                <p style={{ fontSize: 16, color: '#94a3b8' }}>Discover innovative developer products</p>
            </div>

            <div style={{ padding: '32px 32px' }}>
                {/* Search & Filters */}
                <div style={{ marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Search */}
                    <div style={{ position: 'relative' }}>
                        <FiSearch style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: '#6366f1', fontSize: 18 }} />
                        <input
                            type="text"
                            placeholder="Search products by name or problem..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%', paddingLeft: 50, paddingRight: 20, paddingTop: 14, paddingBottom: 14,
                                background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                                borderRadius: 14, color: 'white', fontSize: 15, outline: 'none',
                                boxSizing: 'border-box',
                                transition: 'all 0.2s',
                            }}
                            onFocus={e => e.target.style.borderColor = '#6366f1'}
                            onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.2)'}
                        />
                    </div>

                    {/* Filters */}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#818cf8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                <FiFilter style={{ display: 'inline', marginRight: 6 }} />Category
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={e => setSelectedCategory(e.target.value)}
                                style={{
                                    width: '100%', padding: '11px 16px',
                                    background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                                    borderRadius: 12, color: '#c7d2fe', fontSize: 14, outline: 'none',
                                }}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat} style={{ background: '#1e1b4b' }}>
                                        {cat === 'all' ? 'All Categories' : cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#818cf8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Sort By
                            </label>
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                style={{
                                    width: '100%', padding: '11px 16px',
                                    background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                                    borderRadius: 12, color: '#c7d2fe', fontSize: 14, outline: 'none',
                                }}
                            >
                                <option value="newest" style={{ background: '#1e1b4b' }}>Newest First</option>
                                <option value="price-low" style={{ background: '#1e1b4b' }}>Price: Low to High</option>
                                <option value="price-high" style={{ background: '#1e1b4b' }}>Price: High to Low</option>
                                <option value="rating" style={{ background: '#1e1b4b' }}>Highest Rated</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Count */}
                <div style={{ marginBottom: 24 }}>
                    <p style={{ color: '#64748b', fontSize: 14 }}>
                        Showing <span style={{ color: '#a5b4fc', fontWeight: 700 }}>{filteredProducts.length}</span> products
                    </p>
                </div>

                {/* Grid */}
                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="skeleton" style={{ height: 340, borderRadius: 16 }} />
                        ))}
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
                        {filteredProducts.map(product => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                isPurchased={purchasedProductIds.includes(product._id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '80px 0' }}>
                        <div style={{ fontSize: 60, marginBottom: 16 }}>🔍</div>
                        <h3 style={{ fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 8 }}>No products found</h3>
                        <p style={{ color: '#64748b' }}>Try adjusting your search or filters</p>
                    </div>
                )}
            </div>
        </Layout>
    );
}
