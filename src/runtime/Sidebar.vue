<script setup>
import SidebarNode from './SidebarNode.vue'
import { tree } from './store.js'
</script>

<template>
  <nav class="tree">
    <ul class="list">
      <SidebarNode v-for="node in tree" :key="node.path" :node="node" />
    </ul>
  </nav>
</template>

<style scoped>
.tree {
  padding: 8px 0;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
