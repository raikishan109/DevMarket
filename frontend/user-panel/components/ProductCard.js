import Link from 'next/link';
import { FiStar, FiDollarSign, FiTag } from 'react-icons/fi';

export default function ProductCard({ product, isPurchased = false }) {
    return (
        <Link href={`/products/${product._id}`}>
            <div className="card hover:transform hover:-translate-y-2 transition-all duration-300 cursor-pointer h-full flex flex-col">
                {/* Category Badge */}
                <div className="flex items-center justify-between mb-3">
                    <span className="badge badge-info flex items-center space-x-1">
                        <FiTag size={12} />
                        <span>{product.category}</span>
                    </span>
                    <div className="flex items-center space-x-2">
                        {isPurchased && (
                            <span className="badge bg-green-500 text-white font-semibold px-3 py-1">
                                ✓ Purchased
                            </span>
                        )}
                        {product.averageRating > 0 && (
                            <div className="flex items-center space-x-1 text-yellow-500">
                                <FiStar size={14} fill="currentColor" />
                                <span className="text-sm font-semibold text-gray-700">{product.averageRating}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Product Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                </h3>

                {/* Problem Solved */}
                <div className="mb-4">
                    <p className="text-sm font-semibold text-red-600 mb-1">❌ Problem:</p>
                    <p className="text-gray-600 text-sm line-clamp-2">{product.problemSolved}</p>
                </div>

                {/* Solution */}
                <div className="mb-4 flex-grow">
                    <p className="text-sm font-semibold text-green-600 mb-1">✅ Solution:</p>
                    <p className="text-gray-600 text-sm line-clamp-2">{product.solution}</p>
                </div>

                {/* Price */}
                <div className="mb-4">
                    <div className="flex items-center space-x-2">
                        <FiDollarSign className="text-primary-600" />
                        <span className="text-2xl font-bold text-primary-600">₹{product.price}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">One-time payment</p>
                </div>

                {/* View Details Button */}
                <button className="btn btn-primary w-full">
                    View Details
                </button>

                {/* Sales Count */}
                {product.sales > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                        {product.sales} {product.sales === 1 ? 'sale' : 'sales'}
                    </div>
                )}
            </div>
        </Link>
    );
}
