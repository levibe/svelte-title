# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is `svelte-title` - a SvelteKit component library for managing cascading page titles with automatic hierarchy detection. The component builds titles from specific to general (e.g., "Settings • Manage • My App") using render order to determine hierarchy levels automatically.

## Development Commands

- **Development server**: `pnpm dev`
- **Build package**: `pnpm build` (runs `vite build && npm run prepack`)
- **Package for distribution**: `pnpm prepack` (syncs, packages, and runs publint)
- **Type checking**: `pnpm check` or `pnpm check:watch`
- **Linting**: `pnpm lint` 
- **Run tests**: `pnpm test` (runs all tests once) or `pnpm test:unit` (runs vitest in watch mode)

## Architecture

### Core Components

**Title Component** (`src/lib/components/Title.svelte`)
- Main user-facing component with props: `title`, `level?`, `override?`
- Uses Svelte 5 runes (`$state`, `$effect`, `$derived`)
- Only level 0 (root) renders the actual `<title>` tag in `<svelte:head>`
- Handles cleanup on destroy via `onDestroy`

**Title Store** (`src/lib/stores/title.ts`)
- Centralized state management using Svelte writable store
- `TitlePart` interface: `{ level: number, title: string }`
- Key functions:
  - `getNextLevel()`: Auto-increment counter for hierarchy detection
  - `resetLevelCounter()`: Reset counter on route changes
  - `setTitlePart(level, title)`: Add/update title at specific level
  - `removeTitlePart(level)`: Cleanup title parts
  - `buildTitle(parts)`: Build final title string with " • " separator

### Hierarchy System

- **Level 0**: Root layout (renders actual `<title>` tag)
- **Level 1+**: Nested layouts and pages
- **Level -1**: Override mode (standalone titles)
- Titles build in reverse level order: highest to lowest (specific to general)

### Route Change Handling

The component expects `resetLevelCounter()` to be called on route changes to ensure consistent hierarchy levels across client-side navigation.

**Required Setup in Root Layout** (`src/routes/+layout.svelte`):
```svelte
<script>
    import { page } from '$app/stores'
    import { Title, resetLevelCounter } from '$lib'
    
    // Reset level counter on route changes
    $effect(() => {
        // Watch for route changes and reset counter
        page.url.pathname
        resetLevelCounter()
    })
</script>

<Title title="Your App Name" />
```

## Testing Setup

Uses Vitest with browser testing via Playwright:
- **Client tests**: `src/**/*.svelte.{test,spec}.{js,ts}` (run in browser)
- **Server tests**: `src/**/*.{test,spec}.{js,ts}` (run in Node)
- Setup file: `vitest-setup-client.ts`

## Package Configuration

- **Entry point**: `src/lib/index.ts` (exports Title component and store functions)
- **Build target**: `dist/` directory
- **Package manager**: pnpm (see `pnpm-lock.yaml`)
- **Peer dependency**: Svelte ^5.0.0
- **Export fields**: ESM with TypeScript support

## Key Implementation Details

- Uses automatic hierarchy detection based on component render order
- Only one Title component should be used per layout/page file
- Override mode bypasses cascading and shows standalone titles
- Store-based architecture allows manual control via exported functions