<script setup>
import { ref } from 'vue'
import { defineStory } from 'vue-vitrine'
import Counter from './Counter.vue'

defineStory({ component: Counter, title: 'Inputs/Counter' })

const fromZero = ref(0)
const fromTen = ref(10)
const stepped = ref(0)
const bounded = ref(3)
</script>

<template>
  <Variant name="Default">
    <Counter v-model="fromZero" />
  </Variant>

  <Variant name="Starting value">
    <Counter v-model="fromTen" />
  </Variant>

  <Variant name="Large step">
    <Counter v-model="stepped" :step="25" />
  </Variant>

  <Variant name="Bounded 0 to 5">
    <Counter v-model="bounded" :min="0" :max="5" />
  </Variant>
</template>
