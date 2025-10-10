import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { render } from 'vitest-browser-svelte'
import Title from '../../src/lib/components/Title.svelte'
import { titleParts, titleSeparator, resetLevelCounter, DEFAULT_SEPARATOR } from '../../src/lib/stores/title.js'

async function waitForTitle(expectedTitle: string, timeout = 1000) {
	const startTime = Date.now()
	while (Date.now() - startTime < timeout) {
		if (document.title === expectedTitle) {
			return
		}
		// Wait a short moment before checking again
		await new Promise(resolve => setTimeout(resolve, 10))
	}
	// If the loop finishes, the title never matched
	throw new Error(`Timeout: document.title did not become "${expectedTitle}"`)
}

describe('Title Component', () => {
	let cleanupFunctions: (() => void)[] = []

	beforeEach(() => {
		// Reset the title state before each test
		titleParts.set([])
		titleSeparator.set(DEFAULT_SEPARATOR)
		resetLevelCounter()
		cleanupFunctions = []

		// Clear any existing title elements
		const existingTitles = document.querySelectorAll('title')
		existingTitles.forEach(title => title.remove())
	})

	afterEach(() => {
		// Clean up rendered components
		cleanupFunctions.forEach(cleanup => cleanup())
		cleanupFunctions = []
	})

	it('should render title with default separator', async () => {
		const root = render(Title, { title: 'Root', level: 0 })
		const page = render(Title, { title: 'Page', level: 1 })
		
		cleanupFunctions.push(() => {
			root.unmount?.()
			page.unmount?.()
		})

		// Wait for title to update
		await waitForTitle('Page • Root')

		const titleElement = document.querySelector('title')
		expect(titleElement?.textContent).toBe('Page • Root')
	})

	it('should render title with custom separator', async () => {
		const root = render(Title, { title: 'Root', level: 0, separator: ' | ' })
		const page = render(Title, { title: 'Page', level: 1 })
		
		cleanupFunctions.push(() => {
			root.unmount?.()
			page.unmount?.()
		})

		// Wait for title to update
		await waitForTitle('Page | Root')

		const titleElement = document.querySelector('title')
		expect(titleElement?.textContent).toBe('Page | Root')
	})

	it('should render title with custom separator using multiple levels', async () => {
		const root = render(Title, { title: 'Root', level: 0, separator: ' → ' })
		const section = render(Title, { title: 'Section', level: 1 })
		const page = render(Title, { title: 'Page', level: 2 })
		
		cleanupFunctions.push(() => {
			root.unmount?.()
			section.unmount?.()
			page.unmount?.()
		})

		// Wait for title to update
		await waitForTitle('Page → Section → Root')

		const titleElement = document.querySelector('title')
		expect(titleElement?.textContent).toBe('Page → Section → Root')
	})

	it('should handle override mode ignoring separator', async () => {
		const root = render(Title, { title: 'Root', level: 0, separator: ' | ' })
		const override = render(Title, { title: 'Override Title', override: true })
		
		cleanupFunctions.push(() => {
			root.unmount?.()
			override.unmount?.()
		})

		// Wait for title to update
		await waitForTitle('Override Title')

		const titleElement = document.querySelector('title')
		expect(titleElement?.textContent).toBe('Override Title')
	})

	it('should handle automatic level assignment', async () => {
		// Render components with automatic level assignment
		const auto1 = render(Title, { title: 'Auto1' })  // Should get level 0
		const auto2 = render(Title, { title: 'Auto2' })  // Should get level 1 
		const auto3 = render(Title, { title: 'Auto3' })  // Should get level 2

		cleanupFunctions.push(() => {
			auto1.unmount?.()
			auto2.unmount?.()
			auto3.unmount?.()
		})

		// Wait for title to update
		await waitForTitle('Auto3 • Auto2 • Auto1')

		const titleElement = document.querySelector('title')
		// The title should show the automatic hierarchy
		expect(titleElement?.textContent).toBe('Auto3 • Auto2 • Auto1')
	})

	it('should handle dynamic separator changes', async () => {
		// Start with one separator
		const root = render(Title, { title: 'Root', level: 0, separator: ' • ' })
		const page = render(Title, { title: 'Page', level: 1 })
		
		await waitForTitle('Page • Root')
		
		let titleElement = document.querySelector('title')
		expect(titleElement?.textContent).toBe('Page • Root')
		
		// Change separator by re-rendering root component
		root.unmount?.()
		const newRoot = render(Title, { title: 'Root', level: 0, separator: ' 🔹 ' })
		
		cleanupFunctions.push(() => {
			newRoot.unmount?.()
			page.unmount?.()
		})
		
		await waitForTitle('Page 🔹 Root')
		
		titleElement = document.querySelector('title')
		expect(titleElement?.textContent).toBe('Page 🔹 Root')
	})

	it('should handle empty and null titles gracefully', async () => {
		const root = render(Title, { title: '', level: 0 })
		const page = render(Title, { title: 'Page', level: 1 })
		
		cleanupFunctions.push(() => {
			root.unmount?.()
			page.unmount?.()
		})

		await waitForTitle('Page')

		const titleElement = document.querySelector('title')
		// Should handle empty title gracefully
		expect(titleElement?.textContent).toBe('Page')
	})

	it('should handle component cleanup properly', async () => {
		const root = render(Title, { title: 'Root', level: 0 })
		const page = render(Title, { title: 'Page', level: 1 })
		
		await waitForTitle('Page • Root')
		
		// Verify initial state
		let titleElement = document.querySelector('title')
		expect(titleElement?.textContent).toBe('Page • Root')
		
		// Unmount page component
		page.unmount?.()
		await waitForTitle('Root')
		
		// Should only show root now
		titleElement = document.querySelector('title')
		expect(titleElement?.textContent).toBe('Root')
		
		cleanupFunctions.push(() => {
			root.unmount?.()
		})
	})

	it('should ignore separator prop on non-root components', async () => {
		const root = render(Title, { title: 'Root', level: 0, separator: ' • ' })
		// Try to set separator on level 1 - should be ignored
		const page = render(Title, { title: 'Page', level: 1, separator: ' | ' })
		
		cleanupFunctions.push(() => {
			root.unmount?.()
			page.unmount?.()
		})

		await waitForTitle('Page • Root')

		const titleElement = document.querySelector('title')
		// Should use root separator, not page separator
		expect(titleElement?.textContent).toBe('Page • Root')
	})

	it('should handle multiple root components gracefully', async () => {
		// This is an edge case - multiple level 0 components
		const root1 = render(Title, { title: 'Root1', level: 0, separator: ' • ' })
		const root2 = render(Title, { title: 'Root2', level: 0, separator: ' | ' }) // Later one should win
		const page = render(Title, { title: 'Page', level: 1 })
		
		cleanupFunctions.push(() => {
			root1.unmount?.()
			root2.unmount?.()
			page.unmount?.()
		})

		// Wait for title to update - this is a complex case with multiple roots
		await new Promise(resolve => setTimeout(resolve, 200))

		const titleElement = document.querySelector('title')
		// Last rendered root should control separator and be present
		expect(titleElement?.textContent).toContain('Root2')
		expect(titleElement?.textContent).toContain('|') // Should use second separator
	})

	it('should revert title after override is removed', async () => {
		// Render Root + Page first to establish cascaded title
		const root = render(Title, { title: 'Root', level: 0 })
		const page = render(Title, { title: 'Page', level: 1 })
		
		// Verify initial cascaded title
		await waitForTitle('Page • Root')
		let titleElement = document.querySelector('title')
		expect(titleElement?.textContent).toBe('Page • Root')
		
		// Add override component - should take precedence
		const override = render(Title, { title: 'Override Title', override: true })
		
		// Should show override title
		await waitForTitle('Override Title')
		titleElement = document.querySelector('title')
		expect(titleElement?.textContent).toBe('Override Title')
		
		// Remove override component - should restore cascaded title
		override.unmount?.()
		
		// Should revert to original cascaded title
		await waitForTitle('Page • Root')
		titleElement = document.querySelector('title')
		expect(titleElement?.textContent).toBe('Page • Root')
		
		cleanupFunctions.push(() => {
			root.unmount?.()
			page.unmount?.()
		})
	})

	it('should update title reactively when prop changes', async () => {
		// Render initial component
		const component = render(Title, { title: 'Initial Title', level: 0 })
		
		// Verify initial title
		await waitForTitle('Initial Title')
		let titleElement = document.querySelector('title')
		expect(titleElement?.textContent).toBe('Initial Title')
		
		// Update props using rerender method - test true reactivity
		await component.rerender({ title: 'Updated Title' })
		
		// Verify title updates reactively
		await waitForTitle('Updated Title')
		titleElement = document.querySelector('title')
		expect(titleElement?.textContent).toBe('Updated Title')
		
		cleanupFunctions.push(() => {
			component.unmount?.()
		})
	})

	it('should handle route navigation with level counter reset', async () => {
		// Simulate Route A: render components with automatic levels
		const routeA_root = render(Title, { title: 'Home' })     // Should get level 0
		const routeA_page = render(Title, { title: 'Dashboard' }) // Should get level 1

		await waitForTitle('Dashboard • Home')

		let titleElement = document.querySelector('title')
		expect(titleElement?.textContent).toBe('Dashboard • Home')

		// Clean up Route A components (simulate navigation away)
		routeA_root.unmount?.()
		routeA_page.unmount?.()

		// Reset level counter (as would happen in root layout on route change)
		resetLevelCounter()

		// Simulate Route B: render different components
		const routeB_root = render(Title, { title: 'Settings' })  // Should get level 0 again
		const routeB_page = render(Title, { title: 'Profile' })   // Should get level 1 again

		await waitForTitle('Profile • Settings')

		titleElement = document.querySelector('title')
		expect(titleElement?.textContent).toBe('Profile • Settings')

		// Clean up Route B
		routeB_root.unmount?.()
		routeB_page.unmount?.()

		// Reset counter again
		resetLevelCounter()

		// Simulate back to Route A: levels should reset properly
		const backA_root = render(Title, { title: 'Home' })      // Should get level 0 again
		const backA_page = render(Title, { title: 'Dashboard' }) // Should get level 1 again

		cleanupFunctions.push(() => {
			backA_root.unmount?.()
			backA_page.unmount?.()
		})

		await waitForTitle('Dashboard • Home')

		titleElement = document.querySelector('title')
		// Should be identical to original Route A
		expect(titleElement?.textContent).toBe('Dashboard • Home')
	})

	it('should handle toggling override prop on same component instance', async () => {
		// Render root and page components
		const root = render(Title, { title: 'Root', level: 0 })
		const page = render(Title, { title: 'Page', level: 1 })

		// Verify initial cascaded title
		await waitForTitle('Page • Root')
		let titleElement = document.querySelector('title')
		expect(titleElement?.textContent).toBe('Page • Root')

		// Toggle override to true
		await page.rerender({ title: 'Override Title', override: true })

		// Should show override title only
		await waitForTitle('Override Title')
		titleElement = document.querySelector('title')
		expect(titleElement?.textContent).toBe('Override Title')

		// Toggle override back to false
		await page.rerender({ title: 'Page', override: false })

		// Should restore cascaded title
		await waitForTitle('Page • Root')
		titleElement = document.querySelector('title')
		expect(titleElement?.textContent).toBe('Page • Root')

		// Toggle override again to verify it works multiple times
		await page.rerender({ title: 'Another Override', override: true })
		await waitForTitle('Another Override')
		titleElement = document.querySelector('title')
		expect(titleElement?.textContent).toBe('Another Override')

		cleanupFunctions.push(() => {
			root.unmount?.()
			page.unmount?.()
		})
	})

	it('should handle updating title to empty string', async () => {
		// Render root and page with initial titles
		const root = render(Title, { title: 'Root', level: 0 })
		const page = render(Title, { title: 'Dashboard', level: 1 })

		// Verify initial title
		await waitForTitle('Dashboard • Root')
		let titleElement = document.querySelector('title')
		expect(titleElement?.textContent).toBe('Dashboard • Root')

		// Update page title to empty string
		await page.rerender({ title: '' })

		// Should show only root title (empty string removes the page level)
		await waitForTitle('Root')
		titleElement = document.querySelector('title')
		expect(titleElement?.textContent).toBe('Root')

		// Update back to non-empty
		await page.rerender({ title: 'Settings' })
		await waitForTitle('Settings • Root')
		titleElement = document.querySelector('title')
		expect(titleElement?.textContent).toBe('Settings • Root')

		cleanupFunctions.push(() => {
			root.unmount?.()
			page.unmount?.()
		})
	})

	it('should handle mixed explicit and auto-assigned levels without collision', async () => {
		// Explicitly set level 0 for root
		const root = render(Title, { title: 'Root', level: 0 })

		// Auto-assign level for page (should get level 1, not 0)
		const page = render(Title, { title: 'Page' })

		// Auto-assign level for section (should get level 2)
		const section = render(Title, { title: 'Section' })

		// Verify hierarchical title with no collisions
		await waitForTitle('Section • Page • Root')

		const titleElement = document.querySelector('title')
		expect(titleElement?.textContent).toBe('Section • Page • Root')

		cleanupFunctions.push(() => {
			root.unmount?.()
			page.unmount?.()
			section.unmount?.()
		})
	})
})