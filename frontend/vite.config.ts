import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Deployment configuration:
  // For GitHub Pages: uncomment and set to your repo name
  base: '/tft-professor/',
  
  // For Vercel/Netlify and local testing: use '/'
  // base: '/',
  
  // Build optimizations
  build: {
    sourcemap: false, // Disable source maps in production
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
})
