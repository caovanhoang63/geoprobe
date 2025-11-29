import type { Config } from 'tailwindcss';
import daisyui from 'daisyui';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter', 'sans-serif']
			},
			colors: {
				'bg-darkest': '#1a1d21',
				'bg-card': '#242830',
				'bg-input': '#2a2f38'
			}
		}
	},
	plugins: [daisyui],
	daisyui: {
		themes: [
			{
				dark: {
					primary: '#10b981',
					secondary: '#3b82f6',
					accent: '#f59e0b',
					neutral: '#1e2228',
					'base-100': '#1a1d21',
					error: '#ef4444',
					success: '#10b981'
				}
			}
		],
		darkTheme: 'dark'
	}
} satisfies Config;
