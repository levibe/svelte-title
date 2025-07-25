import { writable } from 'svelte/store'

// Override level constant for standalone titles
export const OVERRIDE_LEVEL = -1

interface TitlePart {
	level: number
	title: string
}

export const titleParts = writable<TitlePart[]>([])

export const titleSeparator = writable<string>(' • ')

let renderCounter = 0
export function getNextLevel(): number {
	return renderCounter++
}

export function resetLevelCounter() {
	renderCounter = 0
}

export function setSeparator(separator: string) {
	titleSeparator.set(separator)
}

export function setTitlePart(level: number, title: string) {
	titleParts.update(parts => {
		const filtered = parts.filter(p => p.level !== level)
		filtered.push({ level, title })
		return filtered.sort((a, b) => a.level - b.level)
	})
}

export function removeTitlePart(level: number) {
	titleParts.update(parts => parts.filter(p => p.level !== level))
}

export function buildTitle(parts: TitlePart[], separator: string = ' • '): string {
	const overridePart = parts.find(p => p.level === OVERRIDE_LEVEL)
	if (overridePart) {
		return overridePart.title
	}
	
	// Combine parts in reverse level order (highest to lowest)
	const normalParts = parts.filter(p => p.level >= 0)
	const sortedParts = normalParts.sort((a, b) => b.level - a.level)
	const titles = sortedParts.map(p => p.title)
	
	return titles.join(separator)
} 