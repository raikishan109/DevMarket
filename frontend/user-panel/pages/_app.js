import '../styles/globals.css';
import { ToastProvider } from '../contexts/ToastContext';

function MyApp({ Component, pageProps }) {
    return (
        <ToastProvider>
            <Component {...pageProps} />
        </ToastProvider>
    );
}

export default MyApp;
