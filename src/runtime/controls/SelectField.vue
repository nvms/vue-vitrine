<script setup>
defineProps({
  modelValue: { type: [String, Number], default: undefined },
  options: { type: Array, default: () => [] },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <select
    class="vt-input select"
    :value="modelValue"
    @change="$emit('update:modelValue', $event.target.value)"
  >
    <option v-for="option in options" :key="option" :value="option">
      {{ option }}
    </option>
  </select>
</template>

<style scoped>
.select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 28px;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%239a9ba1' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
}

.select option {
  color: var(--vt-text);
  background: var(--vt-surface-hi);
}
</style>
