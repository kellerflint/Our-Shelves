import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,             // allows using describe/expect without imports
    environment: 'happy-dom',      // simulates browser environment
    setupFiles: './src/__tests__/setupTests.js', // runs configuration before tests
    css: true,                 // processes CSS files
  }
})
