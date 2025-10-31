import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://taskmanager-app-w2iz.onrender.com/api',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
