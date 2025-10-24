import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import VueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts-next'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VueDevTools(),
    AutoImport({
      dts: true,
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
      },
      imports: [
        'vue',
        'vue-router',
        // 'pinia',
      ],
      dirs: [
        // Auto-import from your composables directory
        // './src/composables/**',
        // './src/model/interfaces/**',
        './src/utils/**',
        // './src/stores/**',
        // './src/constants/**',
      ],
      vueTemplate: true,
    }),
    Components({
      dirs: ['./src/components/', './src/views'],
      dts: true,
    }),
    Pages({
      dirs: ['./src/pages'],
      exclude: ['**/_components/**'],
    }),
    Layouts({
      layoutsDirs: 'src/layouts',
      pagesDirs: 'src/pages',
    }),
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
      '.coreblack.net',
    ],
  },
})
