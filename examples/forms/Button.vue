<script setup>
defineProps({
  /** @type {'primary' | 'secondary' | 'ghost'} */
  variant: { type: String, default: 'primary' },
  /** @type {'sm' | 'md' | 'lg'} */
  size: { type: String, default: 'md' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

defineEmits(['click'])
</script>

<template>
  <button
    class="btn"
    :class="[`btn-${variant}`, `btn-${size}`]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="btn-spinner" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  border: 1px solid transparent;
  border-radius: 6px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.btn-sm { padding: 0.25rem 0.6rem; font-size: 0.85rem; }
.btn-md { padding: 0.45rem 0.9rem; font-size: 1rem; }
.btn-lg { padding: 0.65rem 1.3rem; font-size: 1.1rem; }
.btn-primary { background: #2563eb; color: #fff; }
.btn-secondary { background: #e5e7eb; color: #111; }
.btn-ghost { background: transparent; color: #2563eb; border-color: currentColor; }
.btn-spinner {
  width: 0.9em;
  height: 0.9em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: btn-spin 0.6s linear infinite;
}
@keyframes btn-spin {
  to { transform: rotate(360deg); }
}
</style>
