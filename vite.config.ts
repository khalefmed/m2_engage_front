import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

function spaFallbackPlugin(): Plugin {
  return {
    name: 'spa-fallback-copy',
    closeBundle() {
      const distDir = resolve(rootDir, 'dist')
      const indexFile = resolve(distDir, 'index.html')
      const fallbackFile = resolve(distDir, '404.html')
      const html = readFileSync(indexFile, 'utf-8')
      writeFileSync(fallbackFile, html)
    },
  }
}

export default defineConfig({
  plugins: [react(), spaFallbackPlugin()],
})
