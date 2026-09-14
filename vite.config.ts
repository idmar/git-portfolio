import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// base path set for GitHub Pages subdirectory deployment
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/git-portfolio/',
})
