import { createApp } from 'vue'
import App from './App.vue'
import './host.css'
import { loadAll, records, refreshStory } from './store.js'

createApp(App).mount('#vitrine-app')
loadAll()

if (import.meta.hot) {
  import.meta.hot.on('vite:afterUpdate', (payload) => {
    for (const update of payload.updates ?? []) {
      const relPath = (update.path ?? '').split('?')[0].replace(/^\//, '')
      const record = records.value.find((entry) => entry.relPath === relPath)
      if (record) refreshStory(record.id)
    }
  })
}
