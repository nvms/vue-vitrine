# vue-vitrine

vue-vitrine is a workshop for building Vue 3 components in isolation. It runs a Vite dev server while you work and exports a static site when you are done. The controls playground is generated from each component's prop types, so editing props is live and needs no manual wiring.

## Install

```
npm install -D vue-vitrine
```

## Usage

Point a story file at a component:

```vue
<!-- Button.story.vue -->
<script setup>
import Button from './Button.vue'
import { defineStory } from 'vue-vitrine'

defineStory({ component: Button, title: 'Forms/Button' })
</script>

<template>
  <Variant name="Primary">
    <Button variant="primary">Save</Button>
  </Variant>
  <Variant name="Loading">
    <Button loading>Save</Button>
  </Variant>
</template>
```

Start the dev server:

```
npx vitrine
```

Every component with a story file appears in the sidebar. The controls panel is read from the component's prop types: a boolean prop becomes a toggle, a string union becomes a select, a number becomes a number input. The attributes you write in a variant are the starting values, and the controls edit them live.

A story file with `defineStory` and no `<Variant>` blocks still gives you a playground for that component.

## Commands

- `vitrine` - start the dev server
- `vitrine build` - export a static site
- `vitrine test` - run interaction tests headless

## Status

This project is an experiment in AI-maintained open source - autonomously built, tested, and refined by AI with human oversight.

## License

MIT
