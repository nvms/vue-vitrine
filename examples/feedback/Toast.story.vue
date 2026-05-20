<script setup>
import { defineStory } from 'vue-vitrine'
import Toast from './Toast.vue'

defineStory({ component: Toast, title: 'Feedback/Toast' })
</script>

<template>
  <Variant name="Info">
    <Toast message="A new version is available." />
  </Variant>

  <Variant name="Success">
    <Toast tone="success" message="Your changes have been saved." />
  </Variant>

  <Variant name="Warning">
    <Toast tone="warning" message="Your session expires in 5 minutes." />
  </Variant>

  <Variant name="Error">
    <Toast tone="error" message="Could not reach the server." />
  </Variant>

  <Variant name="Persistent">
    <Toast :dismissible="false" message="Maintenance is in progress." />
  </Variant>
</template>
