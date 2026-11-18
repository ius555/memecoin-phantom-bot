/**
 * Build "într-un singur fișier": `npm run build:single` → dist-single/index.html
 * Tot codul (inclusiv partea 3D), stilurile și logo-ul sunt incluse în fișier, deci se deschide
 * direct în browser (dublu-clic), fără server. Fără service worker și fără instalare ca aplicație.
 */
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { readFileSync } from 'node:fs'

const iconSvg = readFileSync(new URL('./public/icon.svg', import.meta.url), 'utf8')
const iconData = `data:image/svg+xml;base64,${Buffer.from(iconSvg).toString('base64')}`

/** Înlocuiește referințele la fișierele din public/ cu date incluse și scoate ce nu are sens offline. */
function inlinePublicAssets(): Plugin {
  return {
    name: 'inline-public-assets',
    enforce: 'post',
    generateBundle(_, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type === 'chunk') file.code = file.code.replaceAll('./icon.svg', iconData)
      }
    },
    transformIndexHtml(html) {
      return html
        .replace(/\s*<link rel="manifest"[^>]*>/, '')
        .replace(/\s*<link rel="apple-touch-icon"[^>]*>/, '')
        .replace('href="./icon.svg"', `href="${iconData}"`)
    },
  }
}

export default defineConfig({
  base: './',
  mode: 'single',
  publicDir: false,
  plugins: [react(), tailwindcss(), viteSingleFile(), inlinePublicAssets()],
  build: { outDir: 'dist-single', emptyOutDir: true, chunkSizeWarningLimit: 4000 },
})
