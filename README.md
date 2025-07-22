# svelte-title

A SvelteKit component for managing cascading page titles with automatic hierarchy detection.

## Features

- 🔄 **Automatic cascading** - Titles build from specific to general (e.g., "Settings • Manage • My App")
- 🎯 **Auto-hierarchy detection** - Components automatically determine their level based on render order
- 🎨 **Clean DX** - Single component handles all title logic and lifecycle
- 🔒 **TypeScript support** - Fully typed API
- 🎛️ **Override support** - Option to show standalone titles when needed

## Installation

```bash
npm install svelte-title
```

## Quick Start

### 1. Set up the root layout

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { page } from '$app/state'
  import { Title, resetLevelCounter } from 'svelte-title'
  
  // Reset level counter on route changes
  $effect(() => {
    page.url.pathname
    resetLevelCounter()
  })
</script>

<Title title="My App" />

<main>
  {@render children()}
</main>
```

### 2. Add titles to pages and layouts

```svelte
<!-- src/routes/+page.svelte -->
<script>
  import { Title } from 'svelte-title'
</script>

<Title title="Dashboard" />

<h1>Dashboard</h1>
<!-- Result: "Dashboard • My App" -->
```

```svelte
<!-- src/routes/admin/+layout.svelte -->
<script>
  import { Title } from 'svelte-title'
</script>

<Title title="Admin" />

{@render children()}
```

```svelte
<!-- src/routes/admin/users/+page.svelte -->
<script>
  import { Title } from 'svelte-title'
</script>

<Title title="Users" />

<h1>User Management</h1>
<!-- Result: "Users • Admin • My App" -->
```

## API Reference

### Title Component

The main component for setting page titles.

```svelte
<Title title="Page Name" />
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | *required* | The title for this hierarchy level |
| `level` | `number` | `undefined` | Explicit hierarchy level (overrides auto-detection) |
| `override` | `boolean` | `false` | If true, shows only this title (no cascading) |

#### Examples

**Basic usage:**
```svelte
<Title title="Contact" />
<!-- Result: "Contact • My App" -->
```

**Explicit level:**
```svelte
<Title title="Special Page" level={1} />
<!-- Forces this title to level 1 regardless of render order -->
```

**Override mode:**
```svelte
<Title title="Standalone Page" override={true} />
<!-- Result: "Standalone Page" (no cascading) -->
```

### Store Functions

For advanced use cases, you can access the underlying store functions:

```typescript
import { 
  titleParts, 
  setTitlePart, 
  removeTitlePart, 
  buildTitle,
  getNextLevel,
  resetLevelCounter 
} from 'svelte-title'
```

#### `titleParts`
- **Type:** `Writable<TitlePart[]>`
- **Description:** Svelte store containing all current title parts
- **Usage:** Subscribe to get reactive title updates

```typescript
titleParts.subscribe(parts => {
  console.log('Current titles:', parts)
})
```

#### `setTitlePart(level: number, title: string)`
- **Description:** Manually set a title at a specific hierarchy level
- **Usage:** Advanced cases where you need direct store control

```typescript
setTitlePart(2, "Custom Title")
```

#### `removeTitlePart(level: number)`
- **Description:** Remove a title from a specific hierarchy level
- **Usage:** Cleanup when components are destroyed

```typescript
removeTitlePart(1)
```

#### `buildTitle(parts: TitlePart[]): string`
- **Description:** Build the final title string from title parts
- **Returns:** Formatted title string with " • " separator

```typescript
const finalTitle = buildTitle([
  { level: 0, title: "My App" },
  { level: 1, title: "Dashboard" }
])
// Result: "Dashboard • My App"
```

#### `getNextLevel(): number`
- **Description:** Get the next available hierarchy level
- **Returns:** Auto-incremented level number
- **Usage:** Internal function for auto-detection

#### `resetLevelCounter()`
- **Description:** Reset the level counter to 0
- **Usage:** Call this on route changes to ensure consistent hierarchy

## How It Works

### Automatic Hierarchy Detection

The component uses render order to automatically determine hierarchy levels:

1. **Root layout renders first** → Gets level 0
2. **Section layouts render next** → Get level 1, 2, etc.
3. **Page components render last** → Get the highest level numbers

### Title Building

Titles are built in reverse level order (highest to lowest) to create "specific to general" cascading:

```
Level 3: "Settings"     →
Level 1: "Admin"        →  "Settings • Admin • My App"
Level 0: "My App"       →
```

### Route Changes

On client-side navigation:
1. Level counter resets via `resetLevelCounter()`
2. Persistent layout components re-register their titles
3. New page components get fresh level assignments
4. Title updates reactively

## Advanced Usage

### Custom Separators

You can customize the title separator by modifying the `buildTitle` function:

```typescript
import { titleParts } from 'svelte-title'

let customTitle = ''
titleParts.subscribe(parts => {
  const titles = parts
    .filter(p => p.level >= 0)
    .sort((a, b) => b.level - a.level)
    .map(p => p.title)
  
  customTitle = titles.join(' | ') // Custom separator
})
```

### Conditional Titles

```svelte
<script>
  import { Title } from 'svelte-title'
  
  let showAdmin = true
</script>

{#if showAdmin}
  <Title title="Admin Panel" />
{:else}
  <Title title="User Dashboard" />
{/if}
```

### Multiple Title Components

Only use one `Title` component per layout/page file. Multiple components in the same file will interfere with hierarchy detection.

```svelte
<!-- ❌ Don't do this -->
<Title title="First" />
<Title title="Second" />

<!-- ✅ Do this instead -->
<Title title="Combined Title" />
```

## TypeScript Support

Full TypeScript definitions are included:

```typescript
interface TitleProps {
  title: string
  level?: number
  override?: boolean
}

interface TitlePart {
  level: number
  title: string
}
```

## Requirements

- SvelteKit 2.0+
- Svelte 5.0+ (uses runes)

## License

MIT
