import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: '../my-app/dist',
    minify: false,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        home: resolve(__dirname, 'home.html'),
        test_wasm: resolve(__dirname, "test_wasm.html")
      },
    }
  },
});
