import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
                <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%236366f1'/><stop offset='100%25' stop-color='%238b5cf6'/></linearGradient></defs><rect width='100' height='100' rx='22' fill='url(%23g)'/><text y='72' x='50' font-size='58' text-anchor='middle' font-family='monospace' font-weight='bold' fill='white'>%3C/%3E</text></svg>" />
                <title>DevMarket</title>
            </Head>
            <body className="font-['Inter']">
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
