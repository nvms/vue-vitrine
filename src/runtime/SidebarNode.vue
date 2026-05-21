<script setup>
import { activeId, selectStory } from './store.js'

defineProps({
  node: { type: Object, required: true },
})
</script>

<template>
  <li v-if="node.type === 'folder'" class="folder">
    <div class="folder-label">{{ node.label }}</div>
    <ul class="list">
      <SidebarNode
        v-for="child in node.children"
        :key="child.path"
        :node="child"
      />
    </ul>
  </li>

  <li v-else class="leaf">
    <button
      class="story"
      :class="{ active: node.id === activeId }"
      @click="selectStory(node.id)"
    >
      {{ node.label }}
    </button>
  </li>
</template>

<style scoped>
.list {
  list-style: none;
  margin: 0;
  padding: 0 0 0 12px;
}

.folder-label {
  padding: 6px 18px 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--vitrine-muted);
}

.story {
  display: block;
  width: 100%;
  text-align: left;
  padding: 5px 18px;
  font: inherit;
  font-size: 13px;
  color: var(--vitrine-text);
  background: transparent;
  border: none;
  border-left: 2px solid transparent;
  cursor: pointer;
}

.story:hover {
  background: var(--vitrine-border);
}

.story.active {
  color: var(--vitrine-accent);
  border-left-color: var(--vitrine-accent);
  background: var(--vitrine-accent-soft);
}
</style>
