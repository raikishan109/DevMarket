import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow md:ml-64 p-4 md:p-6">
                <div className="bg-white rounded-2xl shadow-sm min-h-full overflow-hidden">
                    {children}
                </div>
            </main>
            <div className="md:ml-64">
                <Footer />
            </div>
        </div>
    );
}
