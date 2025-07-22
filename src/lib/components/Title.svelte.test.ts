import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { render } from 'vitest-browser-svelte'
import Title from './Title.svelte'
import { titleParts, titleSeparator, resetLevelCounter } from '../stores/title.js'

describe('Title Component', () => {
	let cleanupFunctions: (() => void)[] = []

	beforeEach(() => {
		// Reset the title state before each test
		titleParts.set([])
		titleSeparator.set(' • ')
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

		// Wait for Svelte effects to complete
		await new Promise(resolve => setTimeout(resolve, 200))

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

		// Wait for Svelte effects to complete
		await new Promise(resolve => setTimeout(resolve, 200))

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

		// Wait for Svelte effects to complete
		await new Promise(resolve => setTimeout(resolve, 200))

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

		// Wait for Svelte effects to complete  
		await new Promise(resolve => setTimeout(resolve, 200))

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

		// Wait for effects
		await new Promise(resolve => setTimeout(resolve, 200))

		const titleElement = document.querySelector('title')
		// The title should show the automatic hierarchy
		expect(titleElement?.textContent).toBe('Auto3 • Auto2 • Auto1')
	})

	it('should handle dynamic separator changes', async () => {
		// Start with one separator
		const root = render(Title, { title: 'Root', level: 0, separator: ' • ' })
		const page = render(Title, { title: 'Page', level: 1 })
		
		await new Promise(resolve => setTimeout(resolve, 200))
		
		let titleElement = document.querySelector('title')
		expect(titleElement?.textContent).toBe('Page • Root')
		
		// Change separator by re-rendering root component
		root.unmount?.()
		const newRoot = render(Title, { title: 'Root', level: 0, separator: ' 🔹 ' })
		
		cleanupFunctions.push(() => {
			newRoot.unmount?.()
			page.unmount?.()
		})
		
		await new Promise(resolve => setTimeout(resolve, 200))
		
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

		await new Promise(resolve => setTimeout(resolve, 200))

		const titleElement = document.querySelector('title')
		// Should handle empty title gracefully
		expect(titleElement?.textContent).toBe('Page')
	})

	it('should handle component cleanup properly', async () => {
		const root = render(Title, { title: 'Root', level: 0 })
		const page = render(Title, { title: 'Page', level: 1 })
		
		await new Promise(resolve => setTimeout(resolve, 200))
		
		// Verify initial state
		let titleElement = document.querySelector('title')
		expect(titleElement?.textContent).toBe('Page • Root')
		
		// Unmount page component
		page.unmount?.()
		await new Promise(resolve => setTimeout(resolve, 200))
		
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

		await new Promise(resolve => setTimeout(resolve, 200))

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

		await new Promise(resolve => setTimeout(resolve, 200))

		const titleElement = document.querySelector('title')
		// Last rendered root should control separator and be present
		expect(titleElement?.textContent).toContain('Root2')
		expect(titleElement?.textContent).toContain('|') // Should use second separator
	})

	it('should handle route navigation with level counter reset', async () => {
		// Simulate Route A: render components with automatic levels
		const routeA_root = render(Title, { title: 'Home' })     // Should get level 0
		const routeA_page = render(Title, { title: 'Dashboard' }) // Should get level 1
		
		await new Promise(resolve => setTimeout(resolve, 200))
		
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
		
		await new Promise(resolve => setTimeout(resolve, 200))
		
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
		
		await new Promise(resolve => setTimeout(resolve, 200))
		
		titleElement = document.querySelector('title')
		// Should be identical to original Route A
		expect(titleElement?.textContent).toBe('Dashboard • Home')
	})
})