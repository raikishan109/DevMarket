import Link from 'next/link';
import { FiGithub, FiTwitter, FiLinkedin, FiMail } from 'react-icons/fi';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">DevMarket</h3>
                        <p className="text-gray-400 text-sm">
                            The premier marketplace for developers to sell and buy tools, AI automation, websites, and mobile apps.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/marketplace" className="text-gray-400 hover:text-white transition-colors">
                                    Marketplace
                                </Link>
                            </li>
                            <li>
                                <Link href="/register" className="text-gray-400 hover:text-white transition-colors">
                                    Sell Your Product
                                </Link>
                            </li>
                            <li>
                                <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
                                    Login
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Categories</h4>
                        <ul className="space-y-2">
                            <li className="text-gray-400">AI Tools</li>
                            <li className="text-gray-400">Automation</li>
                            <li className="text-gray-400">Websites</li>
                            <li className="text-gray-400">Mobile Apps</li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Connect</h4>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <FiGithub size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <FiTwitter size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <FiLinkedin size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <FiMail size={20} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
                    <p>&copy; {new Date().getFullYear()} DevMarket. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
