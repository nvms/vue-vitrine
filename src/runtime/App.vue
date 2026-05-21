<script setup>
import { computed } from 'vue'
import StoryCanvas from './Canvas.vue'
import Controls from './Controls.vue'
import Sidebar from './Sidebar.vue'
import {
  activeControls,
  activeRecord,
  activeVariant,
  loading,
  records,
} from './store.js'

const crumb = computed(() => {
  const record = activeRecord.value
  if (!record) return []
  const parts = record.title
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean)
  if (activeVariant.value) parts.push(activeVariant.value)
  return parts
})
</script>

<template>
  <div class="vitrine">
    <aside class="sidebar">
      <div class="brand">
        <svg class="mark" viewBox="0 0 16 16" aria-hidden="true">
          <g
            fill="none"
            stroke="currentColor"
            stroke-width="1.4"
            stroke-linecap="round"
          >
            <path d="M1 5V1h4" />
            <path d="M11 1h4v4" />
            <path d="M15 11v4h-4" />
            <path d="M5 15H1v-4" />
          </g>
        </svg>
        <span class="wordmark">vitrine</span>
      </div>
      <Sidebar />
    </aside>

    <main class="main">
      <div class="topbar">
        <nav v-if="crumb.length" class="crumb">
          <template v-for="(part, index) in crumb" :key="index">
            <span v-if="index > 0" class="crumb-sep">/</span>
            <span :class="index === crumb.length - 1 ? 'crumb-leaf' : 'crumb-dir'">
              {{ part }}
            </span>
          </template>
        </nav>
      </div>

      <div v-if="loading" class="stagewrap">
        <p class="placeholder">Loading stories</p>
      </div>
      <div v-else-if="records.length === 0" class="stagewrap">
        <p class="placeholder">No story files found</p>
      </div>
      <StoryCanvas
        v-else-if="activeRecord"
        :record="activeRecord"
        :variant="activeVariant"
        :controls="activeControls"
      />
      <div v-else class="stagewrap">
        <p class="placeholder">Select a story</p>
      </div>
    </main>

    <aside v-if="activeRecord" class="panel">
      <Controls />
    </aside>
  </div>
</template>

<style scoped>
.vitrine {
  display: flex;
  height: 100%;
}

.sidebar {
  display: flex;
  flex-direction: column;
  width: 244px;
  flex-shrink: 0;
  background: var(--vt-panel);
  border-right: 1px solid var(--vt-line);
}

.brand {
  display: flex;
  align-items: center;
  gap: 9px;
  height: var(--vt-topbar);
  flex-shrink: 0;
  padding: 0 var(--vt-gutter);
  border-bottom: 1px solid var(--vt-line);
}

.mark {
  width: 16px;
  height: 16px;
  color: var(--vt-blue);
}

.wordmark {
  font-family: var(--vt-mono);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: var(--vt-ink);
}

.main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.topbar {
  display: flex;
  align-items: center;
  height: var(--vt-topbar);
  flex-shrink: 0;
  background: var(--vt-panel);
  border-bottom: 1px solid var(--vt-line);
}

.crumb {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 16px;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
}

.crumb-sep {
  color: var(--vt-ink-3);
}

.crumb-dir {
  color: var(--vt-ink-2);
}

.crumb-leaf {
  color: var(--vt-ink);
  font-weight: 600;
}

.stagewrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder {
  margin: 0;
  font-size: 13px;
  color: var(--vt-ink-3);
}

.panel {
  width: 296px;
  flex-shrink: 0;
  background: var(--vt-panel);
  border-left: 1px solid var(--vt-line);
}
</style>
