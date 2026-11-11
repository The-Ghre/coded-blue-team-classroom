import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

// BASE_PATH lets the same build target either a root-hosted static host
// (Vercel, Netlify, Cloudflare Pages -> "/") or a GitHub Pages project page
// (-> "/coded-blue-team-classroom/"). Set it in CI; defaults to root.
const base = process.env.BASE_PATH ?? '/'

/**
 * GitHub Pages has no SPA rewrite rule. Copying index.html to 404.html makes
 * Pages serve the app shell for any deep link, so /session/3/present/7 and a
 * browser refresh both resolve correctly instead of returning a 404.
 */
function spaFallback() {
  return {
    name: 'spa-404-fallback',
    closeBundle() {
      const index = resolve(__dirname, 'dist/index.html')
      if (existsSync(index)) copyFileSync(index, resolve(__dirname, 'dist/404.html'))
    },
  }
}

export default defineConfig({
  base,
  plugins: [react(), spaFallback()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
    rollupOptions: {
      output: {
        /**
         * The course content is most of the bundle and it changes whenever a
         * lesson is edited, while the framework almost never does. Splitting
         * them means a content edit invalidates only the content chunk, and
         * returning students re-download kilobytes rather than megabytes.
         */
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor'
          if (id.includes('/src/content/')) return 'course'
          return undefined
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
})
