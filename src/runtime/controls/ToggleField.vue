<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <button
    type="button"
    class="toggle"
    :class="{ on: modelValue }"
    role="switch"
    :aria-checked="modelValue"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span class="knob" />
  </button>
</template>

<style scoped>
.toggle {
  width: 34px;
  height: 20px;
  padding: 2px;
  flex-shrink: 0;
  border: 1px solid var(--vt-line-2);
  border-radius: 999px;
  background: var(--vt-field);
  cursor: pointer;
  transition:
    background-color 0.14s ease,
    border-color 0.14s ease;
}

.toggle.on {
  background: var(--vt-blue);
  border-color: var(--vt-blue);
}

.toggle:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--vt-blue-soft);
}

.knob {
  display: block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--vt-ink-3);
  transition:
    transform 0.14s ease,
    background-color 0.14s ease;
}

.toggle.on .knob {
  background: #ffffff;
  transform: translateX(14px);
}
</style>
