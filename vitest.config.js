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
    // run files sequentially: the vue-component-meta test is CPU-heavy and
    // starves the timing-sensitive file-watch test when run concurrently
    fileParallelism: false,
  },
})
