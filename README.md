# svelte-title

Cascading page title manager for SvelteKit. It builds titles like "Page • Section • App" automatically as your layouts and pages render.

## Installation

```bash
npm install svelte-title
```

## Usage

First, set up your root layout:

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { page } from '$app/state'
  import { Title, resetLevelCounter } from 'svelte-title'
  
  $effect(() => {
    page.url.pathname
    resetLevelCounter()
  })
</script>

<Title title="App" />
```

Call `resetLevelCounter()` when the URL changes so new titles slot into the right spot instead of reusing an old level.

Then add titles anywhere:

```svelte
<script>
  import { Title } from 'svelte-title'
</script>

<Title title="Dashboard" />
<!-- Result: "Dashboard • App" -->
```

Nested layouts work too:

```svelte
<!-- settings/+layout.svelte -->
<Title title="Settings" />

<!-- settings/billing/+page.svelte -->
<Title title="Billing" />
<!-- Result: "Billing • Settings • App" -->
```

## Custom Separators

Want something other than the default bullet (` • `)? Pass a `separator` prop to your root layout:

```svelte
<!-- src/routes/+layout.svelte -->
<Title title="App" separator=" | " />
```

Now all your titles will use pipes:

```svelte
<Title title="Settings" />
<!-- Result: "Settings | App" -->
```

Only the layout at level 0 (your root layout) should set `separator`. Nested titles inherit whatever the root provides.

## Options

The `<Title>` component takes these props:

- `title` (required) - The title text
- `separator` (optional) - Custom separator (root layout only)
- `override` (optional) - Show only this title, no cascading
- `level` (optional) - Force a specific hierarchy level  

```svelte
<!-- Override mode - just shows "Standalone" -->
<Title title="Standalone" override={true} />
```

## How it works

The component automatically detects hierarchy based on render order. Root layouts get level 0, nested layouts get level 1+, and pages get the highest levels. Titles build from specific to general.

Don't put multiple `<Title>` components in the same file—use one per layout or page so each view renders the expected title order.

### Other exports

- `DEFAULT_SEPARATOR` - The default bullet separator, handy if you want to reuse it elsewhere
- `clearTitleState()` - Clears every title and the separator; useful for SSR hooks or test setup

## Limitations

- **When you build without SSR**: Add a fallback `<title>` in `app.html` so visitors never see just the domain while the app boots.
- **When you use SSR**: Any hard-coded `<title>` tag inside `app.html` wins over the component’s SSR output, so keep that file blank or neutral.
- **Route changes**: Keep the `resetLevelCounter()` effect in place so automatic levels keep producing the right cascade as users navigate.

## SSR Notes

- Keep `resetLevelCounter()` in your root layout effect (shown above) so every route change recalculates the title levels correctly.
- If you handle SSR manually (most apps can skip this), clear the state for every request. For example:

```ts
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit'
import { clearTitleState } from 'svelte-title'

export const handle: Handle = async ({ event, resolve }) => {
	clearTitleState()
	return resolve(event)
}
```

## Requirements

- SvelteKit 2.0+
- Svelte 5.0+ (uses runes)

## Issues & Feedback

Found a bug or have a feature request? Please [open an issue](https://github.com/levibe/svelte-title/issues) on GitHub.

## License

MIT
