<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { mountStoryVariant, mountSubject } from './mount.js'

const props = defineProps({
  record: { type: Object, required: true },
  variant: { type: String, default: null },
  controls: { type: Object, default: null },
})

const stage = ref(null)
const renderError = ref(null)

/** @type {import('vue').App|null} */
let app = null

const showStage = computed(() => {
  const record = props.record
  if (!record || record.error || renderError.value) return false
  return record.synthetic || record.variants.length > 0
})

function teardown() {
  if (app) {
    try {
      app.unmount()
    } catch {}
    app = null
  }
}

function render() {
  teardown()
  renderError.value = null

  const record = props.record
  if (!stage.value || !record || record.error) return

  const onError = (cause) => {
    renderError.value = cause instanceof Error ? cause.message : String(cause)
  }

  try {
    if (record.synthetic && record.subject) {
      app = mountSubject(record.subject, stage.value, {
        onError,
        controls: props.controls,
      })
    } else if (record.component && props.variant) {
      app = mountStoryVariant(record.component, props.variant, stage.value, {
        onError,
        controls: props.controls,
      })
    }
  } catch (cause) {
    onError(cause)
  }
}

watch(
  () => [props.record?.id, props.record?.component, props.variant, props.controls],
  render,
)
onMounted(render)
onBeforeUnmount(teardown)
</script>

<template>
  <div class="canvas">
    <div v-if="record?.error" class="message error">{{ record.error }}</div>
    <div v-else-if="renderError" class="message error">
      Render error: {{ renderError }}
    </div>
    <div
      v-else-if="record && !record.synthetic && record.variants.length === 0"
      class="message"
    >
      This story has no variants.
    </div>
    <div v-show="showStage" ref="stage" class="stage" />
  </div>
</template>

<style scoped>
.canvas {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 32px;
  background:
    linear-gradient(45deg, var(--vitrine-panel) 25%, transparent 25%),
    linear-gradient(-45deg, var(--vitrine-panel) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--vitrine-panel) 75%),
    linear-gradient(-45deg, transparent 75%, var(--vitrine-panel) 75%);
  background-size: 20px 20px;
  background-position:
    0 0,
    0 10px,
    10px -10px,
    -10px 0;
}

.stage {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;
  padding: 24px;
  background: var(--vitrine-bg);
  border: 1px solid var(--vitrine-border);
  border-radius: 8px;
}

.message {
  padding: 12px 16px;
  font-size: 13px;
  color: var(--vitrine-muted);
  background: var(--vitrine-bg);
  border: 1px solid var(--vitrine-border);
  border-radius: 8px;
}

.message.error {
  color: var(--vitrine-danger);
  background: var(--vitrine-danger-soft);
  border-color: var(--vitrine-danger);
  font-family: var(--vitrine-mono);
  white-space: pre-wrap;
}
</style>
