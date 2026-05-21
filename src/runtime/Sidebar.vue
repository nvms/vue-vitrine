<script setup>
import SidebarNode from './SidebarNode.vue'
import { tree } from './store.js'
</script>

<template>
  <nav class="tree">
    <ul class="list">
      <SidebarNode
        v-for="node in tree"
        :key="node.path"
        :node="node"
        :depth="0"
      />
    </ul>
  </nav>
</template>

<style scoped>
.tree {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0 16px;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
