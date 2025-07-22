import { writable } from 'svelte/store'

// Override level constant for standalone titles
export const OVERRIDE_LEVEL = -1

interface TitlePart {
	level: number
	title: string
}

// Store for title parts, ordered by level
export const titleParts = writable<TitlePart[]>([])

// Store for the current separator
export const titleSeparator = writable<string>(' • ')

// Render order counter for auto-level assignment
let renderCounter = 0
export function getNextLevel(): number {
	return renderCounter++
}

export function resetLevelCounter() {
	renderCounter = 0
}

// Function to set a custom separator
export function setSeparator(separator: string) {
	titleSeparator.set(separator)
}

// Function to set a title part at a specific level
export function setTitlePart(level: number, title: string) {
	titleParts.update(parts => {
		// Remove any existing part at this level
		const filtered = parts.filter(p => p.level !== level)
		// Add the new part
		filtered.push({ level, title })
		// Sort by level (ascending)
		return filtered.sort((a, b) => a.level - b.level)
	})
}

// Function to remove a title part at a specific level
export function removeTitlePart(level: number) {
	titleParts.update(parts => parts.filter(p => p.level !== level))
}

// Function to build the complete title
export function buildTitle(parts: TitlePart[], separator: string = ' • '): string {
	// Check for override (OVERRIDE_LEVEL)
	const overridePart = parts.find(p => p.level === OVERRIDE_LEVEL)
	if (overridePart) {
		return overridePart.title
	}
	
	// Normal cascading mode - combine parts in reverse level order (highest to lowest)
	const normalParts = parts.filter(p => p.level >= 0)
	const sortedParts = normalParts.sort((a, b) => b.level - a.level) // Sort descending by level
	const titles = sortedParts.map(p => p.title)
	
	return titles.join(separator)
} 