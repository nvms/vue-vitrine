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
  width: 38px;
  height: 22px;
  padding: 2px;
  border: 1px solid var(--vitrine-border);
  border-radius: 999px;
  background: var(--vitrine-panel);
  cursor: pointer;
  transition: background 0.12s;
}

.toggle.on {
  background: var(--vitrine-accent);
  border-color: var(--vitrine-accent);
}

.knob {
  display: block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
  transition: transform 0.12s;
}

.toggle.on .knob {
  transform: translateX(16px);
}
</style>
