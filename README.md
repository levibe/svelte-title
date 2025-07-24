# svelte-title

Smart page title component for SvelteKit. Combines your titles into hierarchies like "Billing • Settings • App" based on route structure.

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

Don't put multiple `<Title>` components in the same file - use one per layout/page.

## Requirements

- SvelteKit 2.0+
- Svelte 5.0+ (uses runes)

## License

MIT
