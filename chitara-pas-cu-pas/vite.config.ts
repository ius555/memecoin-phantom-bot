import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base: './' => aplicația merge și dacă e publicată într-un subfolder (ex. GitHub Pages)
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
