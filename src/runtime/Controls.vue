<script setup>
import { coerceSeed } from './controls.js'
import JsonField from './controls/JsonField.vue'
import NumberField from './controls/NumberField.vue'
import SelectField from './controls/SelectField.vue'
import TextField from './controls/TextField.vue'
import ToggleField from './controls/ToggleField.vue'
import { activeControls, activeVariant, descriptors, metaStatus } from './store.js'

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
  const { overrides, seeds } = activeControls.value
  if (descriptor.name in overrides) return overrides[descriptor.name]
  if (descriptor.name in seeds.value) {
    return coerceSeed(seeds.value[descriptor.name], descriptor.control.kind)
  }
  return undefined
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

    <div v-if="metaStatus === 'loading'" class="controls-note">
      Analyzing component...
    </div>
    <div v-else-if="metaStatus === 'error'" class="controls-note">
      Component metadata is unavailable.
    </div>
    <div v-else-if="descriptors.length === 0" class="controls-note">
      This component has no props.
    </div>

    <div v-else class="controls-list">
      <div
        v-for="descriptor in descriptors"
        :key="`${activeVariant}/${descriptor.name}`"
        class="control-row"
      >
        <div class="control-label">
          <span class="control-name">{{ descriptor.name }}</span>
          <span v-if="descriptor.required" class="control-required">required</span>
          <button
            v-if="isOverridden(descriptor)"
            type="button"
            class="control-reset"
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

        <div v-if="descriptor.description" class="control-desc">
          {{ descriptor.description }}
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
  overflow-y: auto;
}

.controls-head {
  padding: 14px 16px;
  font-weight: 600;
  font-size: 13px;
  border-bottom: 1px solid var(--vitrine-border);
}

.controls-note {
  padding: 16px;
  font-size: 13px;
  color: var(--vitrine-muted);
}

.controls-list {
  padding: 8px 16px 16px;
}

.control-row {
  padding: 12px 0;
  border-bottom: 1px solid var(--vitrine-border);
}

.control-row:last-child {
  border-bottom: none;
}

.control-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.control-name {
  font-size: 13px;
  font-weight: 600;
  font-family: var(--vitrine-mono);
}

.control-required {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--vitrine-muted);
}

.control-reset {
  margin-left: auto;
  padding: 1px 7px;
  font: inherit;
  font-size: 11px;
  color: var(--vitrine-muted);
  background: transparent;
  border: 1px solid var(--vitrine-border);
  border-radius: 4px;
  cursor: pointer;
}

.control-reset:hover {
  color: var(--vitrine-text);
}

.control-desc {
  margin-top: 6px;
  font-size: 12px;
  color: var(--vitrine-muted);
}
</style>
