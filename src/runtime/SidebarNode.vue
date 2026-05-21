<script setup>
import { computed } from 'vue'
import { activeId, selectStory } from './store.js'

const props = defineProps({
  node: { type: Object, required: true },
  depth: { type: Number, default: 0 },
})

const indent = computed(() => ({ paddingLeft: `${14 + props.depth * 12}px` }))
</script>

<template>
  <li v-if="node.type === 'folder'" class="folder">
    <div class="folder-label" :style="indent">{{ node.label }}</div>
    <ul class="list">
      <SidebarNode
        v-for="child in node.children"
        :key="child.path"
        :node="child"
        :depth="depth + 1"
      />
    </ul>
  </li>

  <li v-else>
    <button
      class="story"
      :class="{ active: node.id === activeId }"
      :style="indent"
      @click="selectStory(node.id)"
    >
      <span class="dot" />
      <span class="story-label">{{ node.label }}</span>
    </button>
  </li>
</template>

<style scoped>
.list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.folder-label {
  padding-top: 12px;
  padding-bottom: 4px;
  padding-right: 14px;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--vt-text-3);
}

.story {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding-top: 5px;
  padding-bottom: 5px;
  padding-right: 14px;
  font: inherit;
  font-size: 13px;
  text-align: left;
  color: var(--vt-text-2);
  background: transparent;
  border: none;
  cursor: pointer;
  transition:
    color 0.12s ease,
    background-color 0.12s ease;
}

.story:hover {
  color: var(--vt-text);
  background: var(--vt-surface-hi);
}

.story.active {
  color: var(--vt-accent);
  background: var(--vt-accent-soft);
  box-shadow: inset 2px 0 0 var(--vt-accent);
}

.dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  flex-shrink: 0;
  background: currentColor;
  opacity: 0.4;
}

.story.active .dot {
  opacity: 1;
}

.story-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
