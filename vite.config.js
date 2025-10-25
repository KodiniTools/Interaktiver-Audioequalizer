import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  base: '/audioequalizer/',  // ⚠️ CRITICAL: For subdirectory deployment
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'audio-engine': ['./src/composables/useAudioEqualizer.js', './src/composables/useVisualizer.js']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
