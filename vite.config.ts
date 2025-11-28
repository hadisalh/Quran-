import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This replaces process.env.API_KEY in the code with the actual key string during build.
    // It acts as a fallback if Vercel env vars are not set, preventing "process is not defined" crash.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || process.env.VITE_API_KEY || "AIzaSyBsPsybFFviXStTBBbKJHGoKnUFJF0qL9s")
  },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1600,
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('@google/genai')) return 'genai-vendor';
            return 'vendor';
          }
        }
      }
    }
  }
})