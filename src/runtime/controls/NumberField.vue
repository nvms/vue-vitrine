<script setup>
defineProps({
  modelValue: { type: Number, default: undefined },
})
const emit = defineEmits(['update:modelValue'])

function onInput(event) {
  const raw = event.target.value
  emit('update:modelValue', raw === '' ? undefined : Number(raw))
}
</script>

<template>
  <input
    class="vitrine-input"
    type="number"
    :value="modelValue"
    @input="onInput"
  />
</template>
