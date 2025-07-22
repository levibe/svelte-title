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

	// Re-assign level on route changes for automatic level assignment  
	let hierarchyLevel = $state(0)
	$effect(() => {
		// Watch route changes to trigger re-assignment
		void page.url.pathname
		hierarchyLevel = level !== undefined ? level : getNextLevel()
	})

	// Only level 0 (root layout) manages the final title rendering
	let completeTitle = $state('')
	const isRootLevel = $derived(hierarchyLevel === 0)
	let currentSeparator = $state(' • ')

	// Effect to handle separator changes (only at root level to avoid conflicts)
	$effect(() => {
		if (isRootLevel && separator !== undefined) {
			setSeparator(separator)
		}
	})

	// Subscribe to separator changes at root level
	$effect(() => {
		if (isRootLevel) {
			const unsubscribe = titleSeparator.subscribe((sep: string) => {
				currentSeparator = sep
			})
			return unsubscribe
		}
	})

	// Reactive effect to update title when title prop or override changes
	$effect(() => {
		if (title) {
			if (override) {
				// Override mode: set complete title, clear all other parts
				titleParts.set([])
				// Use override level for standalone titles
				setTitlePart(OVERRIDE_LEVEL, title)
			} else {
				// Normal cascading mode: set title at appropriate hierarchy level
				setTitlePart(hierarchyLevel, title)
			}
		}
	})

	// Only root level (level 0) subscribes to build final title
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

<!-- Only render title tag at root level, but always render when at root level -->
<svelte:head>
	{#if isRootLevel}
		<title>{completeTitle}</title>
	{/if}
</svelte:head> 