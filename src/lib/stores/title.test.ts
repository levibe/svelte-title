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
} from './title.js'

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
})