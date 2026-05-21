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
</script>

<template>
  <div class="vitrine">
    <aside class="sidebar">
      <div class="brand">vue-vitrine</div>
      <Sidebar />
    </aside>

    <main class="main">
      <div v-if="loading" class="placeholder">Loading stories...</div>

      <div v-else-if="records.length === 0" class="placeholder">
        No story files found.
      </div>

      <template v-else-if="activeRecord">
        <header class="header">
          <div class="title">{{ activeRecord.title }}</div>
          <nav v-if="variants.length" class="variants">
            <button
              v-for="name in variants"
              :key="name"
              class="variant"
              :class="{ active: name === activeVariant }"
              @click="selectVariant(name)"
            >
              {{ name }}
            </button>
          </nav>
        </header>
        <StoryCanvas
          :record="activeRecord"
          :variant="activeVariant"
          :controls="activeControls"
        />
      </template>

      <div v-else class="placeholder">Select a story.</div>
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
  width: 248px;
  flex-shrink: 0;
  border-right: 1px solid var(--vitrine-border);
  background: var(--vitrine-panel);
  overflow-y: auto;
}

.brand {
  padding: 16px 18px;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.01em;
  border-bottom: 1px solid var(--vitrine-border);
}

.main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 14px 22px;
  border-bottom: 1px solid var(--vitrine-border);
}

.title {
  font-weight: 600;
  font-size: 15px;
}

.variants {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.variant {
  padding: 4px 12px;
  font: inherit;
  font-size: 13px;
  color: var(--vitrine-muted);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
}

.variant:hover {
  color: var(--vitrine-text);
  background: var(--vitrine-panel);
}

.variant.active {
  color: var(--vitrine-accent);
  background: var(--vitrine-accent-soft);
}

.panel {
  width: 304px;
  flex-shrink: 0;
  border-left: 1px solid var(--vitrine-border);
  background: var(--vitrine-panel);
}

.placeholder {
  margin: auto;
  color: var(--vitrine-muted);
  font-size: 14px;
}
</style>
