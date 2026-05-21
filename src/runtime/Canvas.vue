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

const emptyNote = computed(() => {
  const record = props.record
  return Boolean(
    record && !record.error && !record.synthetic && record.variants.length === 0,
  )
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
    <div class="canvas-pad">
      <div v-if="record?.error" class="notice notice-error">
        {{ record.error }}
      </div>
      <div v-else-if="renderError" class="notice notice-error">
        {{ renderError }}
      </div>
      <div v-else-if="emptyNote" class="notice">This story has no variants.</div>
      <div v-show="showStage" ref="stage" class="stage" />
    </div>
  </div>
</template>

<style scoped>
.canvas {
  flex: 1;
  min-height: 0;
  overflow: auto;
  background-color: var(--vt-canvas);
  background-image: radial-gradient(
    var(--vt-canvas-dot) 1px,
    transparent 1px
  );
  background-size: 18px 18px;
  background-position: -1px -1px;
}

.canvas-pad {
  min-width: 100%;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
}

.stage {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: center;
}

.notice {
  max-width: 420px;
  padding: 12px 16px;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--vt-canvas-ink-dim);
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid var(--vt-canvas-dot);
  border-radius: var(--vt-radius);
}

.notice-error {
  font-family: var(--vt-mono);
  font-size: 12px;
  color: #a3271c;
  background: var(--vt-danger-soft);
  border-color: rgba(226, 86, 74, 0.4);
  white-space: pre-wrap;
}
</style>
