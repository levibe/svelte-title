import { writable } from 'svelte/store'

/**
 * Special level value for override mode.
 * When a title part has this level, it bypasses cascading and shows standalone.
 */
export const OVERRIDE_LEVEL = -1

/**
 * Represents a single part of the hierarchical title.
 */
interface TitlePart {
	/** The hierarchy level (0 = root, 1+ = nested, -1 = override) */
	level: number
	/** The title text */
	title: string
}

/**
 * Internal map for O(1) title part lookups and updates.
 * Key: level, Value: title
 */
const titlePartsMap = new Map<number, string>()

/**
 * Store containing all active title parts as an array.
 * Parts are automatically sorted by level.
 * Internally uses a Map for efficient O(1) operations.
 */
export const titleParts = writable<TitlePart[]>([])

/**
 * Store containing the current title separator.
 * Default: ' • '
 */
export const titleSeparator = writable<string>(' • ')

let renderCounter = 0

/**
 * Gets the next available hierarchy level.
 * Used for automatic level assignment based on render order.
 *
 * @returns The next level number (0, 1, 2, ...)
 *
 * @example
 * const level1 = getNextLevel() // 0
 * const level2 = getNextLevel() // 1
 */
export function getNextLevel(): number {
	return renderCounter++
}

/**
 * Resets the level counter for route changes while preserving active components.
 *
 * Finds the highest level currently in use and sets the counter to continue after it.
 * This ensures that components which persist across navigation (like root layouts)
 * retain their levels, while new page components get fresh, non-conflicting levels.
 *
 * Must be called on every route change for proper title cascading.
 *
 * @example
 * // In root layout +layout.svelte
 * import { page } from '$app/state'
 * import { resetLevelCounter } from 'svelte-title'
 *
 * $effect(() => {
 *   page.url.pathname
 *   resetLevelCounter()
 * })
 */
export function resetLevelCounter() {
	// Find the highest level currently in use (excluding override level)
	const levels = Array.from(titlePartsMap.keys()).filter(l => l !== OVERRIDE_LEVEL)
	const maxLevel = levels.length > 0 ? Math.max(...levels) : -1

	// Reset counter to continue after the highest active level
	renderCounter = maxLevel + 1
}

/**
 * Sets the title separator for cascading titles.
 * Only the root-level Title component should call this.
 *
 * @param separator - The separator string (e.g., ' • ', ' | ', ' → ')
 * @throws {Error} If separator is an empty string
 *
 * @example
 * setSeparator(' | ') // Results in "Page | Section | Root"
 */
export function setSeparator(separator: string) {
	if (separator === '') {
		throw new Error('Invalid separator: empty string is not allowed.')
	}
	titleSeparator.set(separator)
}

/**
 * Helper function to sync the Map to the store.
 * Converts Map entries to sorted array and updates the store.
 */
function syncMapToStore() {
	const parts: TitlePart[] = Array.from(titlePartsMap.entries())
		.map(([level, title]) => ({ level, title }))
		.sort((a, b) => a.level - b.level)
	titleParts.set(parts)
}

/**
 * Sets or updates a title part at a specific hierarchy level.
 * If a part already exists at that level, it will be replaced.
 *
 * @param level - The hierarchy level (0+) or OVERRIDE_LEVEL (-1)
 * @param title - The title text
 *
 * @example
 * setTitlePart(0, 'My App')
 * setTitlePart(1, 'Settings')
 */
export function setTitlePart(level: number, title: string) {
	titlePartsMap.set(level, title)
	syncMapToStore()
}

/**
 * Removes a title part at a specific hierarchy level.
 * Called automatically when a Title component is destroyed.
 *
 * @param level - The hierarchy level to remove
 *
 * @example
 * removeTitlePart(1) // Removes the level 1 title part
 */
export function removeTitlePart(level: number) {
	titlePartsMap.delete(level)
	syncMapToStore()
}

/**
 * Type guard to validate TitlePart structure.
 */
function isValidTitlePart(part: unknown): part is TitlePart {
	return (
		typeof part === 'object' &&
		part !== null &&
		'level' in part &&
		'title' in part &&
		typeof (part as TitlePart).level === 'number' &&
		typeof (part as TitlePart).title === 'string'
	)
}

/**
 * Builds the final title string from title parts.
 *
 * - If an override part exists, returns only that title
 * - Otherwise, combines parts from highest to lowest level with the separator
 * - Empty parts array returns empty string
 * - Invalid parts are filtered out
 *
 * @param parts - Array of title parts to combine
 * @param separator - The separator string (default: ' • ')
 * @returns The combined title string
 * @throws {Error} If parts is not an array
 *
 * @example
 * const parts = [
 *   { level: 0, title: 'App' },
 *   { level: 1, title: 'Settings' },
 *   { level: 2, title: 'Profile' }
 * ]
 * buildTitle(parts) // "Profile • Settings • App"
 * buildTitle(parts, ' → ') // "Profile → Settings → App"
 */
export function buildTitle(parts: TitlePart[], separator: string = ' • '): string {
	// Validate input
	if (!Array.isArray(parts)) {
		throw new Error('buildTitle: parts must be an array')
	}

	// Filter valid parts and warn about invalid ones
	const validParts = parts.filter((part) => {
		const valid = isValidTitlePart(part)
		if (!valid && typeof console !== 'undefined') {
			console.warn('buildTitle: Ignoring invalid title part:', part)
		}
		return valid
	})

	const overridePart = validParts.find(p => p.level === OVERRIDE_LEVEL)
	if (overridePart) {
		return overridePart.title
	}

	// Combine parts in reverse level order (highest to lowest)
	const normalParts = validParts.filter(p => p.level >= 0)
	const sortedParts = normalParts.sort((a, b) => b.level - a.level)
	const titles = sortedParts.map(p => p.title)

	return titles.join(separator)
} 