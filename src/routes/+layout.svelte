<script>
	import { page } from '$app/state'
	import { Title, resetLevelCounter } from '../lib/index.js'

	// Reset level counter on route changes for consistent hierarchy
	$effect(() => {
		page.url.pathname
		resetLevelCounter()
	})
</script>

<Title title="Svelte Title Demo" level={0} separator=" 🔸 " />

<main>
	<slot />
</main>