import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueRouter from 'vue-router/vite'
import tailwindcss from '@tailwindcss/vite'
import vueDevTools from 'vite-plugin-vue-devtools'

// the 'API_' prefix keeps these values out of the client bundle. Module level (not
// defineConfig(fn)) because vitest.config.ts passes this config to mergeConfig
const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), 'API_')

// https://vite.dev/config/
export default defineConfig({
  define: {
    // ISO string fixed when the build starts, shown on the version page.
    __APP_BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    vueRouter({
      routesFolder: 'src/pages',
      dts: 'typed-router.d.ts',
    }),
    vue(),
    tailwindcss(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      'trycloudflare.com',
      '.cloudflare.com',
      '.trycloudflare.com',
    ],
    proxy: {
      '/api': {
        target: env.API_PROXY_TARGET || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
