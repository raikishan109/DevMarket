import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { getUser } from '../../utils/auth';
import { useToast } from '../../contexts/ToastContext';
import { FiPlus, FiEdit, FiTrash2, FiDollarSign, FiPackage, FiTrendingUp } from 'react-icons/fi';

export default function DeveloperDashboard() {
    const router = useRouter();
    const toast = useToast();
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [sales, setSales] = useState([]);
    const [stats, setStats] = useState({ totalProducts: 0, totalEarnings: 0, totalSales: 0 });
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [platformCommission, setPlatformCommission] = useState(10);
    const [formData, setFormData] = useState({
        name: '',
        category: 'AI Tools',
        problemSolved: '',
        solution: '',
        targetAudience: '',
        features: '',
        price: '',
        demoLink: '',
        accessLink: ''
    });

    useEffect(() => {
        const currentUser = getUser();
        if (!currentUser) {
            router.push('/login');
            return;
        }
        setUser(currentUser);
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [productsRes, salesRes, settingsRes] = await Promise.all([
                api.get('/products/developer/my-products'),
                api.get('/orders/my-sales'),
                api.get('/admin/settings').catch(() => ({ data: { success: false } }))
            ]);

            // Set platform commission from settings
            if (settingsRes.data.success && settingsRes.data.settings) {
                setPlatformCommission(settingsRes.data.settings.platformCommission);
            }

            if (productsRes.data.success) {
                setProducts(productsRes.data.products);
                setStats(prev => ({ ...prev, totalProducts: productsRes.data.count }));
            }

            if (salesRes.data.success) {
                setSales(salesRes.data.orders);
                setStats(prev => ({
                    ...prev,
                    totalSales: salesRes.data.count,
                    totalEarnings: salesRes.data.totalEarnings
                }));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const featuresArray = formData.features.split('\n').filter(f => f.trim());

            await api.post('/products', {
                ...formData,
                features: featuresArray,
                price: Number(formData.price)
            });

            toast.success('Product submitted for approval!');
            setShowAddForm(false);
            setFormData({
                name: '',
                category: 'AI Tools',
                problemSolved: '',
                solution: '',
                targetAudience: '',
                features: '',
                price: '',
                demoLink: '',
                accessLink: ''
            });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating product');
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await toast.confirm('Are you sure you want to delete this product? This action cannot be undone.');
        if (!confirmed) return;

        try {
            await api.delete(`/products/${id}`);
            toast.success('Product deleted successfully');
            fetchData();
        } catch (error) {
            toast.error('Error deleting product');
        }
    };

    return (
        <Layout>
            <Head>
                <title>Seller Dashboard - DevMarket</title>
            </Head>

            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold mb-2">Seller Dashboard</h1>
                    <p className="text-primary-100">Manage your products and track earnings</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 mb-1">Total Products</p>
                                <p className="text-4xl font-bold">{stats.totalProducts}</p>
                            </div>
                            <FiPackage className="text-5xl text-blue-200" />
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 mb-1">Total Sales</p>
                                <p className="text-4xl font-bold">{stats.totalSales}</p>
                            </div>
                            <FiTrendingUp className="text-5xl text-green-200" />
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 mb-1">Total Earnings</p>
                                <p className="text-4xl font-bold">₹{stats.totalEarnings}</p>
                            </div>
                            <FiDollarSign className="text-5xl text-purple-200" />
                        </div>
                    </div>
                </div>

                {/* Add Product Button */}
                <div className="mb-6">
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="btn btn-primary flex items-center space-x-2"
                    >
                        <FiPlus />
                        <span>Add New Product</span>
                    </button>
                </div>

                {/* Add Product Form */}
                {showAddForm && (
                    <div className="card mb-8">
                        <h2 className="text-xl font-bold mb-4">Add New Product</h2>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="label">Product Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="label">Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="input"
                                        required
                                    >
                                        <option>AI Tools</option>
                                        <option>Automation</option>
                                        <option>Websites</option>
                                        <option>Mobile Apps</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="label">Problem *</label>
                                <textarea
                                    value={formData.problemSolved}
                                    onChange={(e) => setFormData({ ...formData, problemSolved: e.target.value })}
                                    className="input"
                                    rows="2"
                                    placeholder="What problem does this product solve?"
                                    required
                                ></textarea>
                            </div>

                            <div>
                                <label className="label">Solution *</label>
                                <textarea
                                    value={formData.solution}
                                    onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                                    className="input"
                                    rows="2"
                                    placeholder="How does this product solve the problem?"
                                    required
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="label">Target Audience *</label>
                                    <input
                                        type="text"
                                        value={formData.targetAudience}
                                        onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                                        className="input"
                                        placeholder="Who should use this product?"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="label">Your Base Price (₹) *</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="input"
                                        min="0"
                                        step="0.01"
                                        placeholder="Amount you'll receive"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">Features (one per line)</label>
                                <textarea
                                    value={formData.features}
                                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                                    className="input"
                                    rows="2"
                                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="label">Demo Link</label>
                                    <input
                                        type="url"
                                        value={formData.demoLink}
                                        onChange={(e) => setFormData({ ...formData, demoLink: e.target.value })}
                                        className="input"
                                        placeholder="https://demo.example.com"
                                    />
                                </div>

                                <div>
                                    <label className="label">Access Link *</label>
                                    <input
                                        type="url"
                                        value={formData.accessLink}
                                        onChange={(e) => setFormData({ ...formData, accessLink: e.target.value })}
                                        className="input"
                                        placeholder="https://product.example.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Platform Fee Preview - Compact */}
                            {formData.price && (
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-gray-600">Your Base:</span>
                                                <span className="font-semibold">₹{Number(formData.price).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-gray-600">Fee ({platformCommission}%):</span>
                                                <span className="text-orange-600 font-semibold">+₹{((Number(formData.price) * platformCommission) / 100).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between pt-1 border-t border-gray-300">
                                                <span className="font-bold">Customer Pays:</span>
                                                <span className="text-green-600 font-bold">₹{(Number(formData.price) + (Number(formData.price) * platformCommission) / 100).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex space-x-3 pt-2">
                                <button type="submit" className="btn btn-primary">Submit for Approval</button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Products List */}
                <div className="card">
                    <h2 className="text-2xl font-bold mb-6">My Products</h2>
                    {loading ? (
                        <div className="skeleton h-64"></div>
                    ) : products.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Sales</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {products.map((product) => (
                                        <tr key={product._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm">{product.name}</td>
                                            <td className="px-4 py-3 text-sm">{product.category}</td>
                                            <td className="px-4 py-3 text-sm">₹{product.price}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`badge ${product.status === 'approved' ? 'badge-success' :
                                                    product.status === 'pending' ? 'badge-warning' :
                                                        'badge-danger'
                                                    }`}>
                                                    {product.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">{product.sales}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <div className="flex space-x-2">
                                                    <Link href={`/products/${product._id}`} className="text-blue-600 hover:text-blue-700">
                                                        View
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(product._id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-600 text-center py-8">No products yet. Add your first product!</p>
                    )}
                </div>
            </div>
        </Layout>
    );
}
