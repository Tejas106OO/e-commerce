import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  test: {
    // Vitest only runs unit tests. E2E tests are run by Playwright separately.
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['tests/e2e/**', 'tests/load/**', 'node_modules/**', 'dist/**'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/main.jsx', 'src/data/', '**/*.config.*']
    }
  }
})

