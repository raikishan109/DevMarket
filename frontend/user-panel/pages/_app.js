import '../styles/globals.css';
import { ToastProvider } from '../contexts/ToastContext';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
    return (
        <ToastProvider>
            <Head>
                <style>{`
                    *, *::before, *::after {
                        -webkit-user-select: none !important;
                        -moz-user-select: none !important;
                        -ms-user-select: none !important;
                        user-select: none !important;
                    }
                    input, textarea, [contenteditable="true"] {
                        -webkit-user-select: text !important;
                        -moz-user-select: text !important;
                        user-select: text !important;
                    }
                `}</style>
            </Head>
            <Component {...pageProps} />
        </ToastProvider>
    );
}

export default MyApp;
