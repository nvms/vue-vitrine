<script setup>
import { defineStory } from 'vue-vitrine'
import Divider from './Divider.vue'

defineStory({ component: Divider, title: 'Layout/Divider' })
</script>

<template>
  <Variant name="Default">
    <Divider />
  </Variant>
</template>
