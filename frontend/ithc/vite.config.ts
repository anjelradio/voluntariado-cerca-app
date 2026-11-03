import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Simula el navegador para poder renderizar componentes de React en los tests
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
