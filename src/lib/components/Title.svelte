<script lang="ts">
	/**
	 * @component Title
	 *
	 * Smart page title component for SvelteKit that automatically constructs
	 * hierarchical page titles based on route structure and render order.
	 *
	 * @example
	 * ```svelte
	 * <!-- Root layout -->
	 * <Title title="My App" />
	 *
	 * <!-- Nested page -->
	 * <Title title="Settings" />
	 * <!-- Result: "Settings • My App" -->
	 * ```
	 */
	import { titleParts, titleSeparator, setTitlePart, removeTitlePart, buildTitle, getNextLevel, setSeparator, OVERRIDE_LEVEL } from '../stores/title.js'
	import { onDestroy } from 'svelte'

	interface Props {
		/**
		 * The title text for this hierarchy level.
		 * @required
		 */
		title: string

		/**
		 * Optional explicit hierarchy level (0 = root, 1+ = nested).
		 * If not provided, level is auto-assigned based on render order.
		 * @default auto-assigned
		 */
		level?: number

		/**
		 * Override mode: shows only this title, bypassing cascading.
		 * Useful for standalone pages like 404 or login.
		 * @default false
		 */
		override?: boolean

		/**
		 * Custom separator for cascading titles.
		 * Only applies when set on the root-level (level 0) component.
		 * @default ' • '
		 * @example ' | ', ' → ', ' - '
		 */
		separator?: string
	}

	let { title, level, override = false, separator }: Props = $props()

	// Input validation
	if (level !== undefined && level < 0 && level !== OVERRIDE_LEVEL) {
		throw new Error(`Invalid level: ${level}. Level must be >= 0 or use override prop.`)
	}
	if (separator !== undefined && separator === '') {
		throw new Error('Invalid separator: empty string is not allowed.')
	}

	// Assign level once during initialization
	const hierarchyLevel = level !== undefined ? level : getNextLevel()

	const isRootLevel = $derived(hierarchyLevel === 0)

	// SSR: All components render titles, last wins. CSR: Root builds cascaded title
	let completeTitle = $state(title || '')
	let currentSeparator = $state(' • ')

	// Only root manages separator to avoid conflicts
	$effect(() => {
		if (isRootLevel) {
			if (separator !== undefined) {
				setSeparator(separator)
			}

			const unsubscribe = titleSeparator.subscribe((sep: string) => {
				currentSeparator = sep
			})
			return unsubscribe
		}
	})

	$effect(() => {
		if (title) {
			if (override) {
				setTitlePart(OVERRIDE_LEVEL, title)
				completeTitle = title // Override bypasses cascading
			} else {
				setTitlePart(hierarchyLevel, title)
			}
		}
	})

	// Root rebuilds cascaded title reactively
	$effect(() => {
		if (isRootLevel) {
			const unsubscribe = titleParts.subscribe((parts: { level: number, title: string }[]) => {
				completeTitle = buildTitle(parts, currentSeparator)
			})
			return unsubscribe
		}
	})

	onDestroy(() => {
		if (override) {
			removeTitlePart(OVERRIDE_LEVEL)
		} else {
			removeTitlePart(hierarchyLevel)
		}
	})
</script>

<svelte:head>
	<title>{completeTitle}</title>
</svelte:head> 