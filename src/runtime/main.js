import { createApp } from 'vue'
import App from './App.vue'
import './host.css'
import { loadAll, records, refreshStory, reloadMeta } from './store.js'

createApp(App).mount('#vitrine-app')
loadAll()

if (import.meta.hot) {
  import.meta.hot.on('vite:afterUpdate', (payload) => {
    let touchedVue = false
    for (const update of payload.updates ?? []) {
      const path = (update.path ?? '').split('?')[0]
      if (path.endsWith('.vue')) touchedVue = true
      const relPath = path.replace(/^\//, '')
      const record = records.value.find((entry) => entry.relPath === relPath)
      if (record) refreshStory(record.id)
    }
    if (touchedVue) reloadMeta()
  })
}
