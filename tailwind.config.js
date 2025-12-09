/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: {
                    DEFAULT: '#0d0d0d',
                    card: 'rgba(26, 26, 26, 0.7)',
                    overlay: 'rgba(0, 0, 0, 0.8)',
                },
                primary: {
                    green: '#2d7a5f',
                    gold: '#8b7355',
                    teal: '#1e5f5a',
                    orange: '#8b5a3f',
                    blue: '#1e3a5f',
                },
                accent: {
                    success: '#34d399',
                    warning: '#fbbf24',
                    error: '#ef4444',
                    info: '#3b82f6',
                },
                text: {
                    primary: '#ffffff',
                    secondary: '#a1a1a1',
                    tertiary: '#6b7280',
                },
                border: 'rgba(255, 255, 255, 0.1)',
            },
            fontFamily: {
                sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
            },
            fontSize: {
                'display': ['64px', { lineHeight: '1.2', fontWeight: '700' }],
                'h1': ['48px', { lineHeight: '1.2', fontWeight: '700' }],
                'h2': ['32px', { lineHeight: '1.3', fontWeight: '600' }],
                'h3': ['24px', { lineHeight: '1.4', fontWeight: '600' }],
                'body-lg': ['16px', { lineHeight: '1.5', fontWeight: '500' }],
                'body': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
                'caption': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
            },
            borderRadius: {
                'card': '24px',
                'card-lg': '32px',
                'modal': '20px',
            },
            backdropBlur: {
                'card': '20px',
            },
            boxShadow: {
                'card': '0 8px 32px rgba(0, 0, 0, 0.3)',
                'card-hover': '0 12px 48px rgba(0, 0, 0, 0.4)',
            },
            spacing: {
                'xs': '4px',
                'sm': '8px',
                'md': '16px',
                'lg': '24px',
                'xl': '32px',
                '2xl': '48px',
            },
        },
    },
    plugins: [],
}
