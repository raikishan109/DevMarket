import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
                <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23dc2626'/%3E%3Cstop offset='100%25' stop-color='%23b91c1c'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' rx='20' fill='url(%23g)'/%3E%3Cpath d='M50 15 L78 27 L78 50 C78 67 64 78 50 85 C36 78 22 67 22 50 L22 27 Z' fill='none' stroke='white' stroke-width='6' stroke-linejoin='round'/%3E%3C/svg%3E" />
                <title>DevMarket Admin</title>
            </Head>
            <body className="font-['Inter']" style={{ backgroundColor: '#111827', color: '#f3f4f6' }}>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
