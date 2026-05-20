<script setup>
defineProps({
  message: { type: String, required: true },
  /** @type {'info' | 'success' | 'warning' | 'error'} */
  tone: { type: String, default: 'info' },
  dismissible: { type: Boolean, default: true },
})

defineEmits(['dismiss'])
</script>

<template>
  <div class="toast" :class="`toast-${tone}`" role="status">
    <span class="toast-message">{{ message }}</span>
    <button
      v-if="dismissible"
      class="toast-close"
      aria-label="Dismiss"
      @click="$emit('dismiss')"
    >
      &times;
    </button>
  </div>
</template>

<style scoped>
.toast {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  border-left: 4px solid;
  font-size: 0.95rem;
}
.toast-message { flex: 1; }
.toast-close {
  border: none;
  background: none;
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
  color: inherit;
}
.toast-info { background: #eff6ff; border-color: #2563eb; color: #1e3a8a; }
.toast-success { background: #ecfdf5; border-color: #059669; color: #065f46; }
.toast-warning { background: #fffbeb; border-color: #d97706; color: #92400e; }
.toast-error { background: #fef2f2; border-color: #dc2626; color: #991b1b; }
</style>
