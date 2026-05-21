<script setup>
import { resolveControlValue } from './controls.js'
import JsonField from './controls/JsonField.vue'
import NumberField from './controls/NumberField.vue'
import SelectField from './controls/SelectField.vue'
import TextField from './controls/TextField.vue'
import ToggleField from './controls/ToggleField.vue'
import {
  activeControls,
  activeRecord,
  activeVariant,
  descriptors,
  metaStatus,
} from './store.js'

const widgets = {
  toggle: ToggleField,
  select: SelectField,
  number: NumberField,
  text: TextField,
  json: JsonField,
}

/**
 * @param {import('../meta.js').ControlDescriptor} descriptor
 * @returns {unknown}
 */
function valueFor(descriptor) {
  return resolveControlValue(
    descriptor,
    activeControls.value,
    activeRecord.value?.defaults,
  )
}

/**
 * @param {import('../meta.js').ControlDescriptor} descriptor
 * @returns {boolean}
 */
function isOverridden(descriptor) {
  return descriptor.name in activeControls.value.overrides
}

/**
 * @param {import('../meta.js').ControlDescriptor} descriptor
 * @param {unknown} value
 */
function setValue(descriptor, value) {
  activeControls.value.overrides[descriptor.name] = value
}

/**
 * @param {import('../meta.js').ControlDescriptor} descriptor
 */
function reset(descriptor) {
  delete activeControls.value.overrides[descriptor.name]
}
</script>

<template>
  <div class="controls">
    <div class="controls-head">Controls</div>

    <div class="controls-body">
      <p v-if="metaStatus === 'loading'" class="note">Analyzing component</p>
      <p v-else-if="metaStatus === 'error'" class="note">
        Component metadata is unavailable.
      </p>
      <p v-else-if="descriptors.length === 0" class="note">
        This component takes no props.
      </p>

      <div v-else class="list">
        <div
          v-for="descriptor in descriptors"
          :key="`${activeVariant}/${descriptor.name}`"
          class="control"
        >
          <div class="control-head">
            <span
              class="control-name"
              :class="{ modified: isOverridden(descriptor) }"
            >
              {{ descriptor.name }}
              <span v-if="descriptor.required" class="control-req">*</span>
            </span>
            <button
              type="button"
              class="control-reset"
              :class="{ shown: isOverridden(descriptor) }"
              @click="reset(descriptor)"
            >
              reset
            </button>
          </div>

          <component
            :is="widgets[descriptor.control.kind]"
            :model-value="valueFor(descriptor)"
            v-bind="
              descriptor.control.kind === 'select'
                ? { options: descriptor.control.options }
                : null
            "
            @update:model-value="setValue(descriptor, $event)"
          />

          <p v-if="descriptor.description" class="control-desc">
            {{ descriptor.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.controls {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.controls-head {
  display: flex;
  align-items: center;
  height: var(--vt-topbar);
  flex-shrink: 0;
  padding: 0 var(--vt-gutter);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--vt-ink-3);
  border-bottom: 1px solid var(--vt-line);
}

.controls-body {
  flex: 1;
  overflow-y: auto;
}

.note {
  margin: 0;
  padding: 16px var(--vt-gutter);
  font-size: 12.5px;
  color: var(--vt-ink-3);
}

.list {
  padding: 4px var(--vt-gutter) 18px;
}

.control {
  padding: 14px 0;
}

.control + .control {
  border-top: 1px solid var(--vt-line);
}

.control-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 20px;
  margin-bottom: 9px;
}

.control-name {
  font-family: var(--vt-mono);
  font-size: 12px;
  color: var(--vt-ink);
  transition: color 0.12s ease;
}

.control-name.modified {
  color: var(--vt-blue);
}

.control-req {
  color: var(--vt-ink-3);
}

.control-reset {
  font: inherit;
  font-size: 11px;
  color: var(--vt-ink-3);
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 0.12s ease,
    color 0.12s ease;
}

.control-reset.shown {
  opacity: 1;
  pointer-events: auto;
}

.control-reset:hover {
  color: var(--vt-blue);
}

.control-desc {
  margin: 7px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--vt-ink-2);
}
</style>
