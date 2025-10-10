import { describe, expect, it, beforeEach } from 'vitest'
import { get } from 'svelte/store'
import { 
	titleParts, 
	titleSeparator, 
	setTitlePart, 
	removeTitlePart, 
	buildTitle, 
	setSeparator,
	OVERRIDE_LEVEL,
	resetLevelCounter 
} from '../../src/lib/stores/title.js'

describe('Title Store', () => {
	beforeEach(() => {
		titleParts.set([])
		titleSeparator.set(' • ')
		resetLevelCounter()
	})

	describe('buildTitle', () => {
		it('should build title with default separator', () => {
			const parts = [
				{ level: 0, title: 'Root' },
				{ level: 1, title: 'Page' }
			]
			expect(buildTitle(parts)).toBe('Page • Root')
		})

		it('should build title with custom separator', () => {
			const parts = [
				{ level: 0, title: 'Root' },
				{ level: 1, title: 'Page' }
			]
			expect(buildTitle(parts, ' | ')).toBe('Page | Root')
		})

		it('should handle multiple levels with custom separator', () => {
			const parts = [
				{ level: 0, title: 'Root' },
				{ level: 1, title: 'Section' },
				{ level: 2, title: 'Page' }
			]
			expect(buildTitle(parts, ' → ')).toBe('Page → Section → Root')
		})

		it('should handle override mode', () => {
			const parts = [
				{ level: 0, title: 'Root' },
				{ level: 1, title: 'Page' },
				{ level: OVERRIDE_LEVEL, title: 'Override Title' }
			]
			expect(buildTitle(parts, ' | ')).toBe('Override Title')
		})

		it('should handle empty parts array', () => {
			expect(buildTitle([])).toBe('')
			expect(buildTitle([], ' | ')).toBe('')
		})
	})

	describe('setSeparator', () => {
		it('should update separator store', () => {
			setSeparator(' / ')
			expect(get(titleSeparator)).toBe(' / ')
		})

		it('should update separator store with complex separators', () => {
			setSeparator(' → ')
			expect(get(titleSeparator)).toBe(' → ')
			
			setSeparator(' - ')
			expect(get(titleSeparator)).toBe(' - ')
		})
	})

	describe('title parts management', () => {
		it('should set and retrieve title parts', () => {
			setTitlePart(0, 'Root')
			setTitlePart(1, 'Page')

			const parts = get(titleParts) as { level: number, title: string }[]
			expect(parts).toHaveLength(2)
			expect(parts[0]).toEqual({ level: 0, title: 'Root' })
			expect(parts[1]).toEqual({ level: 1, title: 'Page' })
		})

		it('should remove title parts', () => {
			setTitlePart(0, 'Root')
			setTitlePart(1, 'Page')

			removeTitlePart(1)

			const parts = get(titleParts) as { level: number, title: string }[]
			expect(parts).toHaveLength(1)
			expect(parts[0]).toEqual({ level: 0, title: 'Root' })
		})
	})

	describe('input validation', () => {
		it('should throw error for empty separator in setSeparator', () => {
			expect(() => setSeparator('')).toThrow('Invalid separator: empty string is not allowed.')
		})

		it('should throw error for non-array input in buildTitle', () => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			expect(() => buildTitle(null as any)).toThrow('buildTitle: parts must be an array')
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			expect(() => buildTitle(undefined as any)).toThrow('buildTitle: parts must be an array')
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			expect(() => buildTitle({} as any)).toThrow('buildTitle: parts must be an array')
		})

		it('should filter out invalid title parts in buildTitle', () => {
			const parts = [
				{ level: 0, title: 'Root' },
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				{ level: 'invalid' as any, title: 'Bad' }, // Invalid level type
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				{ level: 1, title: 123 as any }, // Invalid title type
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				{ level: 2 } as any, // Missing title
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				{ title: 'No Level' } as any, // Missing level
				{ level: 3, title: 'Valid' }
			]

			// Should only use valid parts (level 0, 3)
			const result = buildTitle(parts)
			expect(result).toBe('Valid • Root')
		})

		it('should handle very long titles', () => {
			const longTitle = 'A'.repeat(1000)
			const parts = [
				{ level: 0, title: longTitle }
			]
			expect(buildTitle(parts)).toBe(longTitle)
		})

		it('should handle special characters in titles', () => {
			const parts = [
				{ level: 0, title: 'App <script>alert("XSS")</script>' },
				{ level: 1, title: 'Page & Settings' }
			]
			expect(buildTitle(parts, ' | ')).toBe('Page & Settings | App <script>alert("XSS")</script>')
		})

		it('should handle unicode and emoji in titles', () => {
			const parts = [
				{ level: 0, title: '应用程序' },
				{ level: 1, title: '🏠 Home' }
			]
			expect(buildTitle(parts)).toBe('🏠 Home • 应用程序')
		})

		it('should handle special characters in separator', () => {
			const parts = [
				{ level: 0, title: 'Root' },
				{ level: 1, title: 'Page' }
			]
			expect(buildTitle(parts, ' <-> ')).toBe('Page <-> Root')
			expect(buildTitle(parts, ' 🔹 ')).toBe('Page 🔹 Root')
		})
	})
})