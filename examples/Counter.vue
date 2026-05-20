<script setup>
const props = defineProps({
  modelValue: { type: Number, default: 0 },
  step: { type: Number, default: 1 },
  min: { type: Number, default: Number.NEGATIVE_INFINITY },
  max: { type: Number, default: Number.POSITIVE_INFINITY },
})

const emit = defineEmits(['update:modelValue'])

function shift(direction) {
  const next = props.modelValue + direction * props.step
  emit('update:modelValue', Math.min(props.max, Math.max(props.min, next)))
}
</script>

<template>
  <div class="counter">
    <button class="counter-btn" aria-label="Decrease" @click="shift(-1)">-</button>
    <span class="counter-value">{{ modelValue }}</span>
    <button class="counter-btn" aria-label="Increase" @click="shift(1)">+</button>
  </div>
</template>

<style scoped>
.counter {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.25rem;
}
.counter-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 6px;
  background: #f3f4f6;
  font-size: 1.1rem;
  cursor: pointer;
}
.counter-value {
  min-width: 2.5rem;
  text-align: center;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}
</style>
