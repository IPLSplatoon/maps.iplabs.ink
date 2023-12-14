import { defineConfig } from 'vite'
export default defineConfig({
	base: "",
	root: 'src',
	build: {
		rollupOptions: {
			input: {
				editor: './src/index.html',
				viewer: './src/viewer/index.html'
			}
		},
		outDir: '../dist',
		emptyOutDir: true,
		manifest: true
	},
	define: {
		BUILD_DATE: getBuildDate()
	}
})

function getBuildDate() {
	return {
		date: new Date().toLocaleDateString('en-us', { year:"numeric", month:"long", day:"numeric"}) 
	}
}