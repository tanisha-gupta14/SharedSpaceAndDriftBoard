import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const backend = 'http://127.0.0.1:8080'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    global: 'globalThis',
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: backend,
        changeOrigin: true,
      },
      '/uploads': {
        target: backend,
        changeOrigin: true,
      },
      '/ws': {
        target: backend,
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
