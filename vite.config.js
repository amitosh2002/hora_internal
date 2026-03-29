import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    strictPort: true, // Fail if port is taken
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5175, // Force HMR to use the same port
    },
    // Set explicit origin for dev server if multiple instances run
    origin: 'http://localhost:5175'
  }
})
