/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    safelist: [
        'bg-gray-900',
        'bg-gray-950',
        'bg-gray-800',
        'text-gray-100',
        'text-gray-300',
        'border-gray-800',
        'border-gray-700',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f5ff',
                    200: '#b8e8ff',
                    300: '#7dd8f8',
                    400: '#38c5f5',
                    500: '#56c8e8',
                    600: '#29b5d8',
                    700: '#1e9cbd',
                    800: '#177fa0',
                    900: '#0e6280',
                    950: '#084a61',
                },
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.5s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
