import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				black: 'hsl(var(--background))',
				'surface-alt': 'hsl(var(--surface-alt))',

				/* Legacy palette remapped to brand: lime & pink -> cobalt blue (StartAce-inspired) */
				lime: {
					300: '#7c93f2',
					400: '#3858e9',
					500: '#3858e9',
					600: '#2c46c4',
				},
				pink: {
					300: '#7c93f2',
					400: '#5b75ef',
					500: '#3858e9',
					600: '#2c46c4',
				},

				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-secondary': 'var(--gradient-secondary)',
				'gradient-hero': 'var(--gradient-hero)',
			},
			boxShadow: {
				'glow': 'var(--shadow-glow)',
				'card': 'var(--shadow-card)',
			},
			transitionTimingFunction: {
				'smooth': 'var(--transition-smooth)',
				'bounce': 'var(--transition-bounce)',
			},
			fontFamily: {
				'sans': ['Inter', 'system-ui', 'sans-serif'],
				'futura': ['Inter', 'system-ui', 'sans-serif'],
				'syne': ['Inter', 'system-ui', 'sans-serif'],
				'dm': ['Inter', 'system-ui', 'sans-serif'],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(40px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'glow-pulse': {
					'0%, 100%': {
						boxShadow: '0 0 20px hsl(230 80% 56% / 0.3)'
					},
					'50%': {
						boxShadow: '0 0 40px hsl(230 80% 56% / 0.6)'
					}
				},
				'scroll': {
					'0%': {
						transform: 'translateX(0)'
					},
					'100%': {
						transform: 'translateX(-50%)'
					}
				},
				'scroll-reverse': {
					'0%': {
						transform: 'translateX(-50%)'
					},
					'100%': {
						transform: 'translateX(0)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0px) rotate(0deg)'
					},
					'33%': {
						transform: 'translateY(-20px) rotate(1deg)'
					},
					'66%': {
						transform: 'translateY(-10px) rotate(-1deg)'
					}
				},
				'grid-pan': {
					'0%': {
						backgroundPosition: '0px 0px'
					},
					'100%': {
						backgroundPosition: '70px 70px'
					}
				},
				'grid-glow': {
					'0%': {
						background: 'radial-gradient(circle 380px at 15% 30%, rgba(56,88,233,0.20), transparent 70%)'
					},
					'50%': {
						background: 'radial-gradient(circle 480px at 55% 60%, rgba(91,117,239,0.18), transparent 70%)'
					},
					'100%': {
						background: 'radial-gradient(circle 380px at 15% 30%, rgba(56,88,233,0.20), transparent 70%)'
					}
				}
			},

			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'slide-up': 'slide-up 0.8s ease-out',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				'scroll': 'scroll 20s linear infinite',
				'scroll-reverse': 'scroll-reverse 20s linear infinite',
				'float': 'float 20s ease-in-out infinite',
				'grid-pan': 'grid-pan 8s linear infinite',
				'grid-glow': 'grid-glow 10s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
