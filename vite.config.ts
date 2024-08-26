import path from 'path';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/main.ts'),
            name: 'PaymentWidget',
            fileName: (format) => 'widget.js'
        },
        rollupOptions: {
            output: {
                exports: 'named'
            }
        },
        minify: 'terser',
        terserOptions: {
            keep_classnames: true, // Do not mangle class names
            keep_fnames: true // Do not mangle function names
        }
    },
    plugins: [nodePolyfills()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
});
