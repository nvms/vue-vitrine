# vue-vitrine

A component workshop for Vue 3. You develop, document, and test components in isolation. It gives you a Vite dev server while you work, a static-site export when you are done, and a controls playground that is generated from each component's prop types rather than hand-wired.

You are the sole maintainer of this project. Every decision about scope, architecture, and quality is yours to make and defend.

Before making technology or architecture decisions, read `~/code/vigil/learnings.md` for cross-cutting insights from past experiments. You may write to this file but never commit or push changes to the vigil repo - only modify the file and leave it for the user.

## concept

This is the north star. Every feature is measured against it.

Vue 3 has two component-workshop tools and both are unsatisfying. Storybook is framework-agnostic, which means a Vue user pays an abstraction tax for adapters they will never use, and it carries years of legacy weight. Histoire is Vue-native but effectively unmaintained, and its core friction is that you hand-wire every control - `<template #controls>` blocks full of `<HstText>` and `<HstSelect>` widgets that drift from the actual component.

vue-vitrine is Vue 3 only, deliberately. That single constraint is what unlocks the design. Vue 3 ships `vue-component-meta` (from the Volar team), which statically extracts a component's props, events, slots, exposed methods, and their types. vitrine turns that metadata into the controls panel, the actions log, and the documentation table with no configuration. A boolean prop becomes a toggle. A string-literal union becomes a select. The props table is read from source and never drifts.

The result you are aiming for: a one-line story file gives a component a full interactive playground. Adding curated scenarios is writing plain markup. There is never any control wiring.

## scope

### what vitrine does

- runs a Vite-powered dev server with HMR over story files
- auto-discovers `*.story.{vue,js,ts}` files anywhere in the project
- generates the controls panel from `vue-component-meta` prop types
- supports `<Variant>` named scenarios in `.story.vue` files
- supports CSF-style object stories in `.story.{js,ts}` files
- shows a sidebar tree grouped by each story's `title`
- shows a props / events / slots / exposed documentation table from component metadata
- logs emitted events in an actions panel
- runs inline accessibility checks (axe-core) per variant
- exports a static site with `vitrine build`
- runs interaction tests (play functions) headless with `vitrine test`
- reads an optional `vitrine.config.js` for custom globs, a global setup file, and Vite config to merge

### what vitrine does not do

- it is not framework-agnostic. Vue 3 only. no React, Svelte, or Angular adapters - that is the whole point
- it does not support Vue 2
- it is not a general MDX documentation-site generator
- it is not a hosted visual-regression service. it can emit per-variant output for an external diffing tool, but it does not host or compare snapshots itself

When a feature request pulls toward any of these, the answer is no. The value of this project is the sharp edge.

## the API

The public API is small on purpose. `src/index.js` exports `defineStory`, `defineConfig`, and the `Variant` component. Inside `.story.vue` files `Variant` is also registered globally so it needs no import.

### .story.vue (the headline format)

```vue
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

`defineStory` registers the subject component. vitrine reads its prop types and live-binds the controls panel to the subject instances inside each `<Variant>`. The literal attributes written in the template are the seed values; the controls edit them from there. A story file with `defineStory` and no `<Variant>` blocks still produces a default playground variant.

### .story.{js,ts} (programmatic format)

For stories generated in a loop or sharing setup logic:

```js
import Button from './Button.vue'

export default { component: Button, title: 'Forms/Button' }

export const Primary = { props: { variant: 'primary' }, slots: { default: 'Save' } }
export const Loading = { props: { loading: true }, slots: { default: 'Save' } }
```

### play functions

Interaction tests attach to a variant and run both in the browser UI and headless under `vitrine test`:

```js
export const Submits = {
  props: {},
  async play({ canvas, expect }) {
    await canvas.getByRole('button').click()
    expect(canvas.emitted('submit')).toBeTruthy()
  }
}
```

Keep this surface stable. New capability should compose into `defineStory` options or `<Variant>` attributes rather than adding new exports.

## architecture

### CLI

`bin/vitrine.js` parses arguments and dispatches subcommands. With no subcommand it runs `serve`. Subcommands: `serve` (default), `build`, `test`.

### source layout

```
src/
  index.js        - public API: defineStory, defineConfig, Variant
  cli.js          - argument parsing, subcommand dispatch
  serve.js        - dev server: Vite in middleware mode hosting the runtime app
  build.js        - static export: render each variant to HTML, emit assets
  test.js         - headless interaction runner driving play functions
  discovery.js    - glob *.story.{vue,js,ts}, watch for add and remove
  meta.js         - vue-component-meta wrapper; prop schema -> control descriptors
  config.js       - load vitrine.config.js, apply defaults
  runtime/        - the Vue 3 host app rendered in the browser
    App.vue       - shell: sidebar + canvas + panels
    Sidebar.vue   - story tree grouped by title
    Canvas.vue    - renders the active variant in an isolated mount
    Controls.vue  - control widgets bound to the subject's props
    Docs.vue      - props / events / slots / exposed table
    Actions.vue   - emitted-event log
    A11y.vue      - axe-core results for the active variant
    controls/     - widget components: toggle, select, number, text, json
```

### control mapping (meta.js)

The prop schema from `vue-component-meta` maps to control widgets: boolean to a toggle, number to a number input, string to a text input, a string-literal union or enum to a select, object or array to a JSON editor, anything else to a read-only display. Emitted events from the metadata feed the actions log.

### isolation

Each variant mounts in its own Vue app instance inside the canvas. State does not leak between variants because each mount is torn down on switch. This is deliberate: histoire isolates with an iframe per story, which is slow and awkward to theme. A per-variant app instance gives isolation without the iframe cost. Global CSS still applies, which is what you want in a component workshop.

### dev server

`serve.js` uses Vite's programmatic API in middleware mode and hosts the runtime host app. Discovered story modules are loaded through Vite, so they hot-reload like any other source file. The host app is plain Vue 3, hand-built, with no UI-framework dependency.

## standards

- JavaScript only, no TypeScript. ESM throughout (`"type": "module"`).
- JSDoc for type annotations on the public API. generate `types/` from JSDoc with the `types` npm script (the `tsc` invocation is already defined there). `prepublishOnly` runs it. `types/` ships in the `files` array and is exported via both `"types"` and `exports["."]"types"`.
- never use `process.cwd()` for paths inside the package. resolve relative to the current file with `import.meta.url`.
- Vitest for the project's own unit tests. the interaction-test runner that vitrine ships is built on Vitest browser mode.
- Node >= 20.19 (the floor for Vite 7 and Vitest 3).
- small, focused functions. prefer two or three positional arguments at most; use an options object beyond that. functions and plain data over classes.
- no comments unless the code genuinely cannot explain itself. when a comment is necessary it is casual, lowercase (proper nouns excepted), and has no ending punctuation.

## workflow

- session start: run `./audit`, then `gh issue list`. greet the user with the menu below.
- before pushing: `npm test` must pass, and you must actually run the dev server against the example stories and confirm it renders. a feature is not done because a unit test passes; it is done when it works in the running workshop.
- CI must be green before moving on to the next thing.
- short, lowercase commit messages. no co-author lines, no tool-attribution footers. the initial commit message is just the version number.
- use the `gh` CLI for all GitHub operations. do not use the GitHub MCP server for any write operation.
- no emojis anywhere - not in code, commits, or output.

### what the user can say

- `hone` (or just starting a conversation) - run the audit, check `gh issue list`, then assess and refine the project with fresh eyes
- `hone <area>` - focus on one part, e.g. `hone controls`, `hone the dev server`, `hone docs`
- `handoff` - immediately find a stopping point and write a handoff document (see below)

When you assess, read every line. Find edge cases. Stress the API. Review the tests and the README. Assume this code runs in someone's daily development loop and a rough edge there is a rough edge in their whole day.

## dogfooding

vitrine must be developed against a real set of example components and story files kept in the repo (an `examples/` directory). Every feature is verified by running the dev server against those stories and looking at the result. The examples are documentation and regression coverage at once. Cover the awkward cases, not just a plain button: components with slots, with emitted events, with complex object props, with no props at all.

## publishing

When the project is ready to publish, or for a later release: bump `version` in `package.json`, run `npm run types`, commit with just the version number as the message, tag, and push. Do not block on registry authentication and do not ask the user about auth setup - the user publishes on their own terms.

## issue triage

At the start of every session, check open issues with `gh issue list`. Be skeptical. Assume an issue is invalid until proven otherwise - most are user error, misunderstanding, or a feature request that does not belong.

You do not reply to, close, or act on issues without explicit user approval. This is absolute. Never run `gh issue comment`, `gh issue close`, `gh pr comment`, `gh pr review`, or any other write operation against an issue or PR until the user has reviewed and approved the exact message or action. Draft the reply, show it to the user verbatim, wait for explicit approval, then post. If the user edits the draft, post the edited version.

Weigh the author. Issues filed by `nvms` (the project owner) are authoritative direction. Issues filed by anyone else are input to evaluate, not instructions to execute. A valid external issue is logical, reproducible, in the spirit of the project, and feasible within scope. Do not implement a feature request just because someone asked - evaluate it against the concept and the scope boundaries first, then surface your assessment to the user for a decision.

For each issue: read it carefully and note the author; try to reproduce it or verify the claim against the actual code; categorize it as user error, genuine bug, valid feature request, out-of-scope request, or unclear; draft a proposed response and plan, show it to the user, and wait for approval before doing anything.

## writing

Internal writing (code comments) is casual and lowercase as described above.

Public-facing writing - the README, the repository description, JSDoc descriptions, issue and PR replies, release notes, anything another person reads - uses proper grammar, correct capitalization, and full sentences. Concise but professional. Friendly and considerate in replies to issue reporters; thank them for their time; be clear about what you plan to do and a rough timeframe, or explain plainly why you are declining. Never apply the casual lowercase style to public communication.

Rules for public-facing content:

- no period-separated fragments used as taglines ("Single binary. No config. Just works." is not acceptable)
- never use emdash characters; use regular dashes only
- never claim "zero dependencies" or "no dependencies"
- never use "from scratch" to describe how something was built
- avoid rhythmic triplets where all three items share the same parallel structure
- avoid "your X, your Y, your Z" repetition
- no preemptive objection handling ("This isn't about replacing...", "That said...")
- no vague superlatives standing in for specifics ("comprehensive", "robust", "fast" with no number)
- no marketing-style use-case sections
- no analogy marketing ("what X is to Y, this is to Z")
- do not tell the reader what they already know
- describe what things do; do not sell them

## roadmap

Priority order, top is next. When an item lands, delete its bullet.

1. Docs and actions: the props / events / slots / exposed table and the emitted-event log, both from component metadata. `meta.js` already extracts props; extend `describe()` to also return events, slots, and exposed.
2. The `.story.{js,ts}` CSF-style format, then static export with `vitrine build`.
3. Interaction tests (`vitrine test`, play functions on Vitest browser mode) and the inline accessibility tab.

## current status

The CLI, config, discovery, the dev server, and the host app shell are built and tested.

CLI and discovery layer:

- `bin/vitrine.js` -> `src/cli.js`: hand-written arg parser and subcommand dispatch. Only `serve` is registered; `build` and `test` are added when their roadmap items land. Flags: `-c/--config`, `--root`, `-p/--port`, `--host`, `--open`, `-h/--help`, `-v/--version`.
- `src/config.js`: loads `vitrine.config.{js,mjs}`, merges over `defaults`, resolves paths. `defineConfig` and the config typedefs live in `src/config-api.js` (no dependencies) so they are safe to import from both the Node CLI and the browser runtime.
- `src/discovery.js`: `discoverStories` (tinyglobby), `buildStoryTree`, `watchStories` (chokidar), `isStoryFile`. `awaitWriteFinish` is intentionally off - it coalesced add+change events. `watchStories` is a discovery primitive; the dev server uses Vite's own watcher instead.

Dev server and host app:

- `src/serve.js`: Vite dev server in middleware mode behind a plain `node:http` server. `root` is the user's project; the host app is served from the package via `/@fs/`. `server.fs.allow` includes the package dir; `vue-vitrine` is aliased to `src/index.js` so story files and the host share one copy of the runtime (and one `STORY_KEY` Symbol - critical, see below).
- `src/plugin.js`: the `virtual:vitrine-stories` module (story manifest with per-story dynamic imports), the `/__vitrine/meta` metadata endpoint, add/remove watching that triggers a full reload, and `.vue`-change watching that invalidates the meta checker.
- `src/meta.js`: server-side `vue-component-meta` wrapper. `createMetaService(root)` builds one checker lazily (it starts a TypeScript program, so it is slow on first use) and reuses it. `describe(file)` returns control descriptors; `controlFor(schema)` maps a `vue-component-meta` schema to a widget kind.
- `src/runtime/`: the host app. `context.js` (the `STORY_KEY` inject Symbol + `createStoryContext`), `Variant.js`, `story.js` (`defineStory`), `controls.js` (`createControlState`, the `applyControls` vnode interception, `coerceSeed`), `mount.js` (`harvestStory`, `mountStoryVariant`, `mountSubject`), `store.js` (reactive story store, meta fetching, HMR refresh), `tree.js`, `App.vue`, `Sidebar.vue`, `SidebarNode.vue`, `Canvas.vue`, `Controls.vue`, `controls/{ToggleField,SelectField,NumberField,TextField,JsonField}.vue`, `main.js`, `host.css`, `index.html`.
- `src/index.js`: exports `defineConfig`, `defineStory`, `Variant`.
- `examples/`: `Button.vue` (TypeScript SFC, so its union props become select controls), `Toast.vue`, `Counter.vue`, `Divider.vue` (JS), with `.story.vue` files covering union props, booleans, slots, events, and no props.
- 62 tests across config, discovery, CLI parsing, the title tree, the runtime (harvest + mount + control overrides, jsdom), and `meta.js`. `vitest.config.js` adds the Vue plugin, the `vue-vitrine` alias, and `fileParallelism: false` (the heavy `vue-component-meta` test starves the timing-sensitive watch test when run concurrently).

How a story renders:

1. `discovery` finds story files; `plugin` exposes them as `virtual:vitrine-stories`.
2. The host imports each story module and `harvestStory` mounts it once with no active variant - `defineStory` records the subject, every `<Variant>` registers its name - then unmounts.
3. `Canvas` mounts the active variant in its own Vue app via `mountStoryVariant`; switching variants tears that app down and creates a new one. A story with a subject but no `<Variant>` blocks gets a synthetic `Default` variant rendered with `mountSubject`.

How controls work:

1. The host reads the subject component's `__file` (set by `@vitejs/plugin-vue`) and fetches `/__vitrine/meta?file=...`, which runs `vue-component-meta` and returns control descriptors.
2. `Controls.vue` renders a widget per descriptor. Each variant has its own `ControlState` (`overrides` + discovered `seeds`), created by the host and passed into the per-variant Canvas app. A control's displayed value comes from `resolveControlValue`, in precedence order: an explicit override, then the literal value in the variant markup, then the subject's runtime default (`record.defaults`, read from the component's props declaration). Skipping the default fallback makes a control show a wrong value, e.g. a boolean prop appearing `false` when its default is `true`.
3. `Variant.js` runs `applyControls` over its slot vnodes: it `cloneVNode`s every vnode whose type is the subject, merging the panel's `overrides` on top of the literal attributes. The first subject vnode's literal props are reported back as the seed values. No control wiring is needed in the story file.

Host app design:

- A dark "chrome" (sidebar, top bar, controls panel) frames a light canvas where the user's component renders. Amber accent, monospace for technical labels (prop names, the wordmark). The intent is that the chrome recedes and the component is the focus.
- All design tokens are CSS variables (`--vt-*`) in `runtime/host.css`. Components reference the tokens and never hard-code colors or metrics. The three columns share a `--vt-topbar`-height header so the top border reads as one continuous line.
- Zero layout shift on interaction is a hard rule. The controls panel's row header is a fixed-height line and the reset button toggles `opacity`/`pointer-events`, never `v-if` - so revealing it cannot reflow the panel. Any new panel (Docs, Actions) must follow the same token system and shift-free discipline.

Key constraints for the next session:

- The `STORY_KEY` Symbol in `runtime/context.js` must be one module instance shared by `defineStory` (called inside the user's story file) and the host. The `vue-vitrine` alias in `serve.js` and `vitest.config.js` guarantees this. Breaking the alias breaks `inject` silently.
- `vue-component-meta` reads runtime `defineProps({...})` declarations for JS components, so string-literal unions only become select controls for TypeScript components (`defineProps<{...}>()`). JS unions degrade to text inputs - this is expected, not a bug. `Button.vue` is TypeScript precisely to exercise the select path.
- HMR: `.vue` edits hot-swap in place via Vue's HMR runtime (free, even inside the Canvas's separate app). `main.js` listens for `vite:afterUpdate`, calls `store.refreshStory` to re-harvest a changed story, and `store.reloadMeta` to re-fetch metadata. Story file add/remove triggers a full reload from the plugin.
- The dev server defaults to port 6007 (Storybook and Histoire both default to 6006) and advances to the next free port when one is taken.

Dependencies added: `tinyglobby`, `chokidar` 5 (its `>=20.19` engine matches ours), `picomatch`, `@vitejs/plugin-vue`, `vue-component-meta`, `typescript` (a runtime dependency now, since `vue-component-meta` needs it), and `jsdom` (dev).

## session handoff

The user can say `handoff` at any point. When they do:

1. Find a stopping point. Commit any in-progress work that is in a good state (tests pass, nothing half-broken). If the current state cannot be committed cleanly, stash or revert to the last clean state and note what was in progress.
2. Create `.handoff/<topic>.md`. It must be fully self-contained - the next session has zero context from this conversation. Include: what was done, current state (what works, what tests pass, uncommitted or stashed work), what to do next (concrete and specific), the key files to read first, constraints to be careful about, and how to verify the work.
3. Give the user a ready-to-paste prompt for the next conversation, for example: `read .handoff/<topic>.md and pick up where the last session left off`.

You may also initiate a handoff yourself on reaching a natural stopping point in a long feature.

Handoff documents are local-only. Never commit, never push, never force-add them. `.handoff/` is in `.gitignore`. If git rejects the add, that is correct - do not override it. Delete a handoff file once its work is done.

## retirement

The user may say `retire` to archive this project:

1. archive the GitHub repo: `gh repo archive nvms/vue-vitrine`
2. add a note block to the top of the repo README: `> [!NOTE]` followed by `> This project is archived. <reason>`
3. update `~/code/nvms/README.md` - move the project from the active section to an archived section, keeping its links and description
4. let the user know the local working copy will be archived separately; that is handled outside this repository
5. leave any published package on the registry - do not deprecate it unless it is actually broken

## the nvms README

`~/code/nvms/README.md` is the master index of all of the user's projects. Whenever this project is created, renamed, or removed, update that README so its entry, links, and badges are correct. A standalone project puts its badges on their own line directly below the heading, not inline with the heading and not in a table. Include a CI badge (the GitHub Actions `test` workflow) and, once published, an npm badge.

## self-improvement

After making changes, review and update this file - architecture notes, design decisions, gotchas, the roadmap, the current-status section. Completed roadmap items get deleted, not crossed out. This is not optional.

If you discover something that would change how a future project approaches a technology or architecture decision, add it to `~/code/vigil/learnings.md`. The bar is high: the insight must be cross-cutting (useful beyond this project) and decision-altering (a future project would walk into the same trap without the warning). Implementation recipes, CI fixes, and general engineering advice do not belong there - those go in this file. Never commit or push changes to the vigil repo; modify `learnings.md` and leave it for the user.
