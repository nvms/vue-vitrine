<script setup>
defineProps({
  modelValue: { type: String, default: '' },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <input
    class="vt-input"
    type="text"
    :value="modelValue ?? ''"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>
