import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext', // Ensure modern JS for the AI library
    chunkSizeWarningLimit: 1600,
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Split vendor chunks to avoid large file warnings
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('@google/genai')) return 'genai-vendor';
            return 'vendor';
          }
        }
      }
    }
  }
})