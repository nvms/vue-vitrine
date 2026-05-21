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
  selectVariant,
} from './store.js'

const variants = computed(() => activeRecord.value?.variants ?? [])

const crumb = computed(() =>
  (activeRecord.value?.title ?? '')
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean),
)
</script>

<template>
  <div class="vitrine">
    <aside class="sidebar">
      <div class="brand">
        <svg class="mark" viewBox="0 0 16 16" aria-hidden="true">
          <rect
            x="1.6"
            y="1.6"
            width="12.8"
            height="12.8"
            rx="2.6"
            fill="none"
            stroke="currentColor"
            stroke-width="1.3"
          />
          <rect x="5.5" y="5.5" width="5" height="5" rx="1.2" fill="currentColor" />
        </svg>
        <span class="wordmark">vitrine</span>
      </div>
      <Sidebar />
    </aside>

    <main class="main">
      <div class="topbar">
        <div v-if="activeRecord" class="crumb">
          <template v-for="(part, index) in crumb" :key="index">
            <span v-if="index > 0" class="crumb-sep">/</span>
            <span :class="index === crumb.length - 1 ? 'crumb-leaf' : 'crumb-dir'">
              {{ part }}
            </span>
          </template>
        </div>
        <nav v-if="variants.length" class="vtabs">
          <button
            v-for="name in variants"
            :key="name"
            class="vtab"
            :class="{ active: name === activeVariant }"
            @click="selectVariant(name)"
          >
            {{ name }}
          </button>
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
  width: 240px;
  flex-shrink: 0;
  background: var(--vt-surface);
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
  color: var(--vt-accent);
}

.wordmark {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: var(--vt-text);
}

.main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.topbar {
  display: flex;
  align-items: stretch;
  height: var(--vt-topbar);
  flex-shrink: 0;
  background: var(--vt-surface);
  border-bottom: 1px solid var(--vt-line);
}

.crumb {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  flex-shrink: 0;
  font-size: 13px;
}

.crumb-dir {
  color: var(--vt-text-3);
}

.crumb-sep {
  color: var(--vt-text-3);
}

.crumb-leaf {
  color: var(--vt-text);
  font-weight: 600;
}

.vtabs {
  display: flex;
  align-items: stretch;
  overflow-x: auto;
  scrollbar-width: none;
}

.vtabs::-webkit-scrollbar {
  display: none;
}

.vtab {
  position: relative;
  flex-shrink: 0;
  padding: 0 13px;
  font: inherit;
  font-size: 12.5px;
  color: var(--vt-text-3);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color 0.12s ease;
}

.vtab:hover {
  color: var(--vt-text-2);
}

.vtab.active {
  color: var(--vt-accent);
  border-bottom-color: var(--vt-accent);
}

.stagewrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vt-canvas);
}

.placeholder {
  margin: 0;
  font-size: 13px;
  color: var(--vt-canvas-ink-dim);
}

.panel {
  width: 300px;
  flex-shrink: 0;
  background: var(--vt-surface);
  border-left: 1px solid var(--vt-line);
}
</style>
