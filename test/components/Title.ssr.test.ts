import { describe, expect, it, beforeEach } from 'vitest'
import { render } from 'svelte/server'
import Title from '../../src/lib/components/Title.svelte'
import { titleParts, titleSeparator, resetLevelCounter, DEFAULT_SEPARATOR } from '../../src/lib/stores/title.js'

describe('Title Component SSR', () => {
	beforeEach(() => {
		// Reset the title state before each test
		titleParts.set([])
		titleSeparator.set(DEFAULT_SEPARATOR)
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

	it('should render title for all components during SSR', () => {
		// Simulate layout component (level 0)
		const layoutResult = render(Title, {
			props: {
				title: 'My App',
				level: 0
			}
		})

		// Simulate page component (level 1)
		const pageResult = render(Title, {
			props: {
				title: 'Dashboard',
				level: 1
			}
		})

		// Both should render title tags during SSR
		expect(layoutResult.head).toContain('<title>My App</title>')
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

	it('should render title tag for all levels during SSR', () => {
		const result = render(Title, {
			props: {
				title: 'Page Title',
				level: 1
			}
		})

		// All levels render title tags during SSR
		expect(result.head).toContain('<title>Page Title</title>')
	})

	it('should isolate state between SSR requests (no cross-request leak)', () => {
		// Simulate Request A
		const requestA_layout = render(Title, {
			props: {
				title: 'Request A App',
				level: 0
			}
		})
		const requestA_page = render(Title, {
			props: {
				title: 'Request A Page',
				level: 1
			}
		})

		// Verify Request A renders correctly
		expect(requestA_layout.head).toContain('<title>Request A App</title>')
		expect(requestA_page.head).toContain('<title>Request A Page</title>')

		// Note: In real SSR, components don't get destroyed (onDestroy doesn't run)
		// So we intentionally DON'T clean up here to simulate the SSR behavior

		// Simulate Request B starting fresh (would be a new request in production)
		// First, simulate route change which calls resetLevelCounter in SSR mode
		resetLevelCounter() // This should clear all state in SSR mode

		const requestB_layout = render(Title, {
			props: {
				title: 'Request B App',
				level: 0
			}
		})
		const requestB_page = render(Title, {
			props: {
				title: 'Request B Page',
				level: 1
			}
		})

		// Verify Request B has clean state (no data from Request A)
		expect(requestB_layout.head).toContain('<title>Request B App</title>')
		expect(requestB_page.head).toContain('<title>Request B Page</title>')

		// Verify no leaked titles from Request A
		expect(requestB_layout.head).not.toContain('Request A')
		expect(requestB_page.head).not.toContain('Request A')
	})

	it('should isolate separator between SSR requests (no separator leak)', () => {
		// Simulate Request A with custom separator
		const requestA_layout = render(Title, {
			props: {
				title: 'Request A App',
				level: 0,
				separator: ' 🔸 '
			}
		})
		const requestA_page = render(Title, {
			props: {
				title: 'Request A Page',
				level: 1
			}
		})

		// Verify Request A renders (individual components just render their own title in SSR)
		expect(requestA_layout.head).toContain('<title>Request A App</title>')
		expect(requestA_page.head).toContain('<title>Request A Page</title>')

		// In real SSR, the separator would be set in the store
		// Simulate Request B starting fresh
		resetLevelCounter() // This should clear all state including separator

		const requestB_layout = render(Title, {
			props: {
				title: 'Request B App',
				level: 0
				// Note: NO separator prop - should use default ' • '
			}
		})
		const requestB_page = render(Title, {
			props: {
				title: 'Request B Page',
				level: 1
			}
		})

		// Verify Request B renders correctly
		expect(requestB_layout.head).toContain('<title>Request B App</title>')
		expect(requestB_page.head).toContain('<title>Request B Page</title>')

		// The key assertion: verify the separator store was reset
		// We can check this by importing and subscribing to titleSeparator
		let currentSeparator = ''
		titleSeparator.subscribe(sep => currentSeparator = sep)()
		expect(currentSeparator).toBe(DEFAULT_SEPARATOR) // Should be default, not ' 🔸 '
	})
})