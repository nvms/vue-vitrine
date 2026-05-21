import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      'vue-vitrine': fileURLToPath(new URL('./src/index.js', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
  },
})
