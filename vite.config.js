import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // Copy sw.js and manifest.json to the build root as-is
  // (they must NOT be hashed/bundled — browsers expect them at a fixed path)
  publicDir: 'public',
})
