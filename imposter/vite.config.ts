import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Allow setting base path for GitHub Pages (e.g., /imposter)
const base = process.env.BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [react()],
})
