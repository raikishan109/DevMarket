import '../styles/globals.css';
import { ToastProvider } from '../contexts/ToastContext';
import { ThemeProvider } from '../contexts/ThemeContext';

function MyApp({ Component, pageProps }) {
    return (
        <ThemeProvider>
            <ToastProvider>
                <Component {...pageProps} />
            </ToastProvider>
        </ThemeProvider>
    );
}

export default MyApp;
