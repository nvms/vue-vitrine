<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: undefined },
})
const emit = defineEmits(['update:modelValue'])

// number inputs cannot display Infinity or NaN, so a non-finite default is
// shown as a placeholder instead of a value
const display = computed(() =>
  Number.isFinite(props.modelValue) ? props.modelValue : undefined,
)
const placeholder = computed(() => {
  const value = props.modelValue
  if (value === undefined || Number.isFinite(value)) return undefined
  return String(value)
})

function onInput(event) {
  const raw = event.target.value
  emit('update:modelValue', raw === '' ? undefined : Number(raw))
}
</script>

<template>
  <input
    class="vt-input number"
    type="number"
    :value="display"
    :placeholder="placeholder"
    @input="onInput"
  />
</template>

<style scoped>
.number {
  font-variant-numeric: tabular-nums;
}
</style>
