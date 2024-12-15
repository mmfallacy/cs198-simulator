/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			gridTemplateColumns: {
				'20': 'repeat(20, minmax(0, max-content))'
			}
		}
	},

	corePlugins: {
		preflight: false
	},

	plugins: [require('@tailwindcss/typography')]
};
