import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// For GitHub Pages fallback: set base: '/ContentWorkflow/' and switch the
// router to createHashRouter in src/router.tsx (see README).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
})
