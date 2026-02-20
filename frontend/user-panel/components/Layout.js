import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
    // Sync sidebar state for main content offset
    // We read sidebar state from Navbar via CSS transition (navbar shifts, so layout follows)
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow p-4 md:p-6">
                <div className="bg-white rounded-2xl shadow-sm min-h-full overflow-hidden">
                    {children}
                </div>
            </main>
            <Footer />
        </div>
    );
}
