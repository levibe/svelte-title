import { describe, expect, it, beforeEach } from 'vitest'
import { render } from 'svelte/server'
import Title from '../../src/lib/components/Title.svelte'
import { titleParts, titleSeparator, resetLevelCounter } from '../../src/lib/stores/title.js'

describe('Title Component SSR', () => {
	beforeEach(() => {
		// Reset the title state before each test
		titleParts.set([])
		titleSeparator.set(' • ')
		resetLevelCounter()
	})

	it('should render meaningful title during SSR (not undefined or empty)', () => {
		// Simulate layout component (level 0)
		const layoutResult = render(Title, {
			props: {
				title: 'My App',
				level: 0
			}
		})

		// svelte:head content appears in the .head property, not .html
		expect(layoutResult.head).toContain('<title>My App</title>')
		expect(layoutResult.head).not.toContain('<title></title>')
		expect(layoutResult.head).not.toContain('<title>undefined</title>')
	})

	it('should render fallback title during SSR even with multiple components', () => {
		// Simulate layout component (level 0) - this renders first during SSR
		const layoutResult = render(Title, {
			props: {
				title: 'My App',
				level: 0
			}
		})

		// Simulate page component (level 1) - this renders after but can't update already-rendered <title>
		const pageResult = render(Title, {
			props: {
				title: 'Dashboard',
				level: 1
			}
		})

		// Layout should show its own title during SSR (meaningful fallback)
		expect(layoutResult.head).toContain('<title>My App</title>')
		
		// Page component now also renders title tag (last one wins during SSR)
		expect(pageResult.head).toContain('<title>Dashboard</title>')
	})

	it('should handle custom separator during SSR', () => {
		const result = render(Title, {
			props: {
				title: 'My App',
				level: 0,
				separator: ' 🔸 '
			}
		})

		// Should render the root title (SSR fallback behavior)
		expect(result.head).toContain('<title>My App</title>')
	})

	it('should handle override mode during SSR', () => {
		const result = render(Title, {
			props: {
				title: 'Override Title',
				override: true
			}
		})

		// Override mode at any level should render the title
		expect(result.head).toContain('<title>Override Title</title>')
	})

	it('should handle empty title gracefully during SSR', () => {
		const result = render(Title, {
			props: {
				title: '',
				level: 0
			}
		})

		// Should render empty title tag rather than undefined
		expect(result.head).toContain('<title></title>')
		expect(result.head).not.toContain('<title>undefined</title>')
	})

	it('should render title tag for all levels during SSR (last one wins)', () => {
		const result = render(Title, {
			props: {
				title: 'Page Title',
				level: 1
			}
		})

		// All levels now render title tags during SSR (last one wins)
		expect(result.head).toContain('<title>Page Title</title>')
	})
})