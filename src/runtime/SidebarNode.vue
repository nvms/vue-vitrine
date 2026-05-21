<script setup>
import { computed } from 'vue'
import {
  activeId,
  activeVariant,
  expanded,
  select,
  selectStory,
  toggleExpanded,
} from './store.js'

const props = defineProps({
  node: { type: Object, required: true },
  depth: { type: Number, default: 0 },
})

const indent = computed(() => ({
  paddingLeft: `${14 + props.depth * 13}px`,
}))

const isExpanded = computed(() => expanded.value.has(props.node.storyId))

const storyActive = computed(
  () => props.node.type === 'story' && activeId.value === props.node.storyId,
)

const variantActive = computed(
  () =>
    props.node.type === 'variant' &&
    activeId.value === props.node.storyId &&
    activeVariant.value === props.node.variant,
)
</script>

<template>
  <div v-if="node.type === 'folder'" class="folder">
    <div class="folder-label" :style="indent">{{ node.label }}</div>
    <SidebarNode
      v-for="child in node.children"
      :key="child.path"
      :node="child"
      :depth="depth + 1"
    />
  </div>

  <template v-else-if="node.type === 'story'">
    <button
      v-if="node.single"
      class="row leaf"
      :class="{ active: storyActive }"
      :style="indent"
      @click="selectStory(node.storyId)"
    >
      <span class="lead"><span class="bullet" /></span>
      <span class="label">{{ node.label }}</span>
    </button>

    <div v-else class="row branch" :class="{ current: storyActive }" :style="indent">
      <button
        class="lead chev"
        :class="{ open: isExpanded }"
        :aria-expanded="isExpanded"
        :aria-label="isExpanded ? 'Collapse' : 'Expand'"
        @click="toggleExpanded(node.storyId)"
      >
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path
            d="M4.5 2.5 8 6l-3.5 3.5"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <button class="name" @click="selectStory(node.storyId)">
        <span class="label">{{ node.label }}</span>
        <span class="count">{{ node.variants.length }}</span>
      </button>
    </div>

    <template v-if="!node.single && isExpanded">
      <SidebarNode
        v-for="child in node.children"
        :key="child.path"
        :node="child"
        :depth="depth + 1"
      />
    </template>
  </template>

  <button
    v-else
    class="row variant"
    :class="{ active: variantActive }"
    :style="indent"
    @click="select(node.storyId, node.variant)"
  >
    <span class="lead"><span class="tick" /></span>
    <span class="label">{{ node.label }}</span>
  </button>
</template>

<style scoped>
.folder-label {
  padding: 13px 14px 5px;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--vt-ink-3);
}

.row {
  display: flex;
  align-items: center;
  width: 100%;
  height: 27px;
  font: inherit;
  text-align: left;
  background: transparent;
  border: none;
  padding-right: 12px;
  cursor: pointer;
}

.lead {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  flex-shrink: 0;
}

.leaf,
.variant {
  color: var(--vt-ink-2);
  transition:
    color 0.12s ease,
    background-color 0.12s ease;
}

.leaf:hover,
.variant:hover {
  color: var(--vt-ink);
  background: var(--vt-panel-hi);
}

.leaf.active,
.variant.active {
  color: var(--vt-blue);
  background: var(--vt-blue-soft);
  box-shadow: inset 2px 0 0 var(--vt-blue);
}

.branch {
  padding-right: 0;
}

.branch:hover {
  background: var(--vt-panel-hi);
}

.chev {
  height: 100%;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--vt-ink-3);
  cursor: pointer;
}

.chev svg {
  width: 12px;
  height: 12px;
  transition: transform 0.14s ease;
}

.chev.open svg {
  transform: rotate(90deg);
}

.chev:hover {
  color: var(--vt-ink);
}

.name {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0 12px 0 0;
  font: inherit;
  background: transparent;
  border: none;
  text-align: left;
  color: var(--vt-ink-2);
  cursor: pointer;
  transition: color 0.12s ease;
}

.branch:hover .name,
.branch.current .name {
  color: var(--vt-ink);
}

.label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

.count {
  margin-left: auto;
  padding-left: 8px;
  font-family: var(--vt-mono);
  font-size: 11px;
  color: var(--vt-ink-3);
  font-variant-numeric: tabular-nums;
}

.bullet {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.45;
}

.leaf.active .bullet {
  opacity: 1;
}

.tick {
  width: 6px;
  height: 1px;
  background: var(--vt-line-2);
}

.variant.active .tick {
  background: var(--vt-blue);
}
</style>
