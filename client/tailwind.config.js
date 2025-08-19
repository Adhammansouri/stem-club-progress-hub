/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./index.html',
		'./src/**/*.{js,jsx,ts,tsx}',
	],
	theme: {
		extend: {
			container: {
				center: true,
				padding: '1rem',
			},
			colors: {
				brand: {
					DEFAULT: '#10b981',
					dark: '#059669',
				},
			},
		},
	},
	plugins: [],
}; 