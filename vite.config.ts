import preactRefresh from '@prefresh/vite'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
    esbuild: {
        jsxFactory: 'h',
        jsxFragment: 'Fragment',
        jsxInject: `import { h, Fragment } from 'preact'`
    },
    optimizeDeps: {
        include: ['preact/debug', 'preact/hooks', 'preact/compat']
    },
    plugins: [preactRefresh()]
});
