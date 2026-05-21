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
const dims = ref({ w: 0, h: 0 })

/** @type {import('vue').App|null} */
let app = null
/** @type {ResizeObserver|null} */
let observer = null

const showFrame = computed(() => {
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

function measure() {
  if (!stage.value) return
  const rect = stage.value.getBoundingClientRect()
  dims.value = { w: Math.round(rect.width), h: Math.round(rect.height) }
}

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
  measure()
}

watch(
  () => [props.record?.id, props.record?.component, props.variant, props.controls],
  render,
)

onMounted(() => {
  render()
  observer = new ResizeObserver(measure)
  if (stage.value) observer.observe(stage.value)
})

onBeforeUnmount(() => {
  teardown()
  observer?.disconnect()
})
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

      <div v-show="showFrame" class="frame">
        <div ref="stage" class="stage" />
        <span class="corner tl" />
        <span class="corner tr" />
        <span class="corner bl" />
        <span class="corner br" />
        <span class="dims">{{ dims.w }} &times; {{ dims.h }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.canvas {
  flex: 1;
  min-height: 0;
  overflow: auto;
  background-color: var(--vt-paper);
  background-image:
    linear-gradient(var(--vt-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--vt-grid) 1px, transparent 1px),
    linear-gradient(var(--vt-grid-major) 1px, transparent 1px),
    linear-gradient(90deg, var(--vt-grid-major) 1px, transparent 1px);
  background-size:
    22px 22px,
    22px 22px,
    110px 110px,
    110px 110px;
}

.canvas-pad {
  min-width: 100%;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
}

.frame {
  position: relative;
  display: inline-block;
}

.stage {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  max-width: 100%;
}

.corner {
  position: absolute;
  width: 13px;
  height: 13px;
  pointer-events: none;
}

.corner.tl {
  top: -8px;
  left: -8px;
  border-top: 1.5px solid var(--vt-bracket);
  border-left: 1.5px solid var(--vt-bracket);
}

.corner.tr {
  top: -8px;
  right: -8px;
  border-top: 1.5px solid var(--vt-bracket);
  border-right: 1.5px solid var(--vt-bracket);
}

.corner.bl {
  bottom: -8px;
  left: -8px;
  border-bottom: 1.5px solid var(--vt-bracket);
  border-left: 1.5px solid var(--vt-bracket);
}

.corner.br {
  bottom: -8px;
  right: -8px;
  border-bottom: 1.5px solid var(--vt-bracket);
  border-right: 1.5px solid var(--vt-bracket);
}

.dims {
  position: absolute;
  top: calc(100% + 13px);
  right: -8px;
  font-family: var(--vt-mono);
  font-size: 11px;
  color: var(--vt-ink-3);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.notice {
  max-width: 440px;
  padding: 12px 15px;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--vt-ink-2);
  background: var(--vt-field);
  border: 1px solid var(--vt-line-2);
  border-radius: var(--vt-radius);
}

.notice-error {
  font-family: var(--vt-mono);
  font-size: 12px;
  color: var(--vt-danger);
  background: var(--vt-danger-soft);
  border-color: rgba(200, 55, 42, 0.3);
  white-space: pre-wrap;
}
</style>
