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
  <div>
    <textarea
      class="json"
      :class="{ invalid: error }"
      rows="3"
      spellcheck="false"
      :value="text"
      @input="onInput"
      @focus="focused = true"
      @blur="focused = false"
    />
    <p v-if="error" class="json-error">{{ error }}</p>
  </div>
</template>

<style scoped>
.json {
  display: block;
  width: 100%;
  min-height: 62px;
  padding: 8px 9px;
  font-family: var(--vt-mono);
  font-size: 12px;
  line-height: 1.5;
  color: var(--vt-ink);
  background: var(--vt-field);
  border: 1px solid var(--vt-line-2);
  border-radius: var(--vt-radius-sm);
  resize: vertical;
  transition:
    border-color 0.12s ease,
    box-shadow 0.12s ease;
}

.json:focus {
  outline: none;
  border-color: var(--vt-blue);
  box-shadow: 0 0 0 3px var(--vt-blue-soft);
}

.json.invalid {
  border-color: var(--vt-danger);
}

.json-error {
  margin: 5px 0 0;
  font-size: 11px;
  color: var(--vt-danger);
}
</style>
