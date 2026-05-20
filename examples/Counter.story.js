import Counter from './Counter.vue'

export default { component: Counter, title: 'Inputs/Counter' }

export const Default = {
  props: { modelValue: 0 },
}

export const StartingValue = {
  props: { modelValue: 10 },
}

export const LargeStep = {
  props: { modelValue: 0, step: 25 },
}

export const Bounded = {
  props: { modelValue: 3, min: 0, max: 5 },
}
