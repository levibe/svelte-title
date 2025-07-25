<script lang="ts">
	import { page } from '$app/state'
	import { titleParts, titleSeparator, setTitlePart, removeTitlePart, buildTitle, getNextLevel, setSeparator, OVERRIDE_LEVEL } from '../stores/title.js'
	import { onDestroy } from 'svelte'

	interface Props {
		title: string
		level?: number
		override?: boolean
		separator?: string
	}

	let { title, level, override = false, separator }: Props = $props()

	let hierarchyLevel = $state(level !== undefined ? level : getNextLevel())
	
	$effect(() => {
		// Reset level counter on route changes for consistent hierarchy
		void page.url.pathname
		if (level !== undefined) {
			hierarchyLevel = level
		}
	})

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