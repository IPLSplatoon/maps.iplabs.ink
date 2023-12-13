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
		emptyOutDir: true
	}
})