# svelte-title

Cascading page titles for SvelteKit. Build titles like "Settings • Admin • My App" automatically.

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

<Title title="My App" />
```

Then add titles anywhere:

```svelte
<script>
  import { Title } from 'svelte-title'
</script>

<Title title="Dashboard" />
<!-- Result: "Dashboard • My App" -->
```

Nested layouts work too:

```svelte
<!-- admin/+layout.svelte -->
<Title title="Admin" />

<!-- admin/users/+page.svelte -->
<Title title="Users" />
<!-- Result: "Users • Admin • My App" -->
```

## Custom Separators

Want something other than the default bullet (` • `)? Pass a `separator` prop to your root layout:

```svelte
<!-- src/routes/+layout.svelte -->
<Title title="My App" separator=" | " />
```

Now all your titles will use pipes:

```svelte
<Title title="Settings" />
<!-- Result: "Settings | My App" -->
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
