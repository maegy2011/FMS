import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
    darkMode: "class",
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
        extend: {
                colors: {
                        // Islamic Egyptian Colors
                        'egyptian-gold': '#D4AF37',
                        'egyptian-sand': '#E6D690',
                        'egyptian-blue': '#1E3A8A',
                        'egyptian-green': '#0F766E',
                        'egyptian-red': '#DC2626',
                        'egyptian-cream': '#FEF3C7',
                        'egyptian-stone': '#57534E',
                        'egyptian-sky': '#0EA5E9',
                        
                        background: 'hsl(var(--background))',
                        foreground: 'hsl(var(--foreground))',
                        card: {
                                DEFAULT: 'hsl(var(--card))',
                                foreground: 'hsl(var(--card-foreground))'
                        },
                        popover: {
                                DEFAULT: 'hsl(var(--popover))',
                                foreground: 'hsl(var(--popover-foreground))'
                        },
                        primary: {
                                DEFAULT: 'hsl(var(--primary))',
                                foreground: 'hsl(var(--primary-foreground))'
                        },
                        secondary: {
                                DEFAULT: 'hsl(var(--secondary))',
                                foreground: 'hsl(var(--secondary-foreground))'
                        },
                        muted: {
                                DEFAULT: 'hsl(var(--muted))',
                                foreground: 'hsl(var(--muted-foreground))'
                        },
                        accent: {
                                DEFAULT: 'hsl(var(--accent))',
                                foreground: 'hsl(var(--accent-foreground))'
                        },
                        destructive: {
                                DEFAULT: 'hsl(var(--destructive))',
                                foreground: 'hsl(var(--destructive-foreground))'
                        },
                        border: 'hsl(var(--border))',
                        input: 'hsl(var(--input))',
                        ring: 'hsl(var(--ring))',
                        chart: {
                                '1': 'hsl(var(--chart-1))',
                                '2': 'hsl(var(--chart-2))',
                                '3': 'hsl(var(--chart-3))',
                                '4': 'hsl(var(--chart-4))',
                                '5': 'hsl(var(--chart-5))'
                        }
                },
                borderRadius: {
                        lg: 'var(--radius)',
                        md: 'calc(var(--radius) - 2px)',
                        sm: 'calc(var(--radius) - 4px)'
                },
                // Islamic patterns and animations
                keyframes: {
                        'islamic-pattern': {
                                '0%': { backgroundPosition: '0% 0%' },
                                '100%': { backgroundPosition: '100% 100%' }
                        },
                        'gold-glow': {
                                '0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)' },
                                '50%': { boxShadow: '0 0 40px rgba(212, 175, 55, 0.6)' }
                        },
                        'egyptian-float': {
                                '0%, 100%': { transform: 'translateY(0px)' },
                                '50%': { transform: 'translateY(-10px)' }
                        }
                },
                animation: {
                        'islamic-pattern': 'islamic-pattern 20s ease infinite',
                        'gold-glow': 'gold-glow 3s ease-in-out infinite',
                        'egyptian-float': 'egyptian-float 4s ease-in-out infinite'
                }
        }
  },
  plugins: [tailwindcssAnimate],
};
export default config;
