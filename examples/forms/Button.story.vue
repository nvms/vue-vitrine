<script setup>
import { defineStory } from 'vue-vitrine'
import Button from './Button.vue'

defineStory({ component: Button, title: 'Forms/Button' })
</script>

<template>
  <Variant name="Primary">
    <Button variant="primary">Save changes</Button>
  </Variant>

  <Variant name="Secondary">
    <Button variant="secondary">Cancel</Button>
  </Variant>

  <Variant name="Ghost">
    <Button variant="ghost">Learn more</Button>
  </Variant>

  <Variant name="Loading">
    <Button loading>Saving</Button>
  </Variant>

  <Variant name="Disabled">
    <Button disabled>Unavailable</Button>
  </Variant>
</template>
