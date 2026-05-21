<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { default: undefined },
})
const emit = defineEmits(['update:modelValue'])

const text = ref(format(props.modelValue))
const error = ref('')
const focused = ref(false)

watch(
  () => props.modelValue,
  (value) => {
    if (!focused.value) {
      text.value = format(value)
      error.value = ''
    }
  },
)

/**
 * @param {unknown} value
 * @returns {string}
 */
function format(value) {
  return value === undefined ? '' : JSON.stringify(value, null, 2)
}

function onInput(event) {
  text.value = event.target.value
  const trimmed = text.value.trim()
  if (trimmed === '') {
    error.value = ''
    emit('update:modelValue', undefined)
    return
  }
  try {
    const parsed = JSON.parse(trimmed)
    error.value = ''
    emit('update:modelValue', parsed)
  } catch {
    error.value = 'Invalid JSON'
  }
}
</script>

<template>
  <div class="json">
    <textarea
      class="vitrine-input json-input"
      :class="{ invalid: error }"
      rows="3"
      spellcheck="false"
      :value="text"
      @input="onInput"
      @focus="focused = true"
      @blur="focused = false"
    />
    <div v-if="error" class="json-error">{{ error }}</div>
  </div>
</template>

<style scoped>
.json-input {
  font-family: var(--vitrine-mono);
  font-size: 12px;
  resize: vertical;
}

.json-input.invalid {
  border-color: var(--vitrine-danger);
}

.json-error {
  margin-top: 3px;
  font-size: 11px;
  color: var(--vitrine-danger);
}
</style>
