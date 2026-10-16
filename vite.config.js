import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    // Inventário dos arquivos e imports, conferido antes de publicar.
    manifest: true,
    rollupOptions: {
      output: {
        // React em chunk próprio — não muda entre deploys, navegador pode cachear por meses.
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
        },
      },
    },
  },
})
