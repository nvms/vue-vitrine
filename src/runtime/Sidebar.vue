<script setup>
import SidebarNode from './SidebarNode.vue'
import { tree } from './store.js'
</script>

<template>
  <nav class="tree">
    <SidebarNode
      v-for="node in tree"
      :key="node.path"
      :node="node"
      :depth="0"
    />
  </nav>
</template>

<style scoped>
.tree {
  flex: 1;
  overflow-y: auto;
  padding: 6px 0 18px;
}
</style>
