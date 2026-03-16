<script lang="ts">

	import favicon from '$lib/assets/favicon.png';
	// Styles
    import '$lib/styles/app.css';

	import { UmamiAnalyticsEnv } from '@lukulent/svelte-umami'

	import { dev, browser } from '$app/environment'
  	import { onMount } from 'svelte'

	onMount(() => {
		if (!dev || !browser) return

		window.umami = {
		track: (event, props) => {
			console.group(`%c[Umami] ${event}`, 'color: #7c3aed; font-weight: bold')
			console.table(props ?? {})
			console.groupEnd()
		}
		}
	})

	let { children } = $props();
</script>

<UmamiAnalyticsEnv />

<svelte:head>
	<link rel="icon" href={favicon} />
	
	<link rel="preconnect" href="https://fonts.googleapis.com" />
  	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
    href="https://fonts.googleapis.com/css2?family=Niramit:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;1,200;1,300;1,400;1,500;1,600;1,700&display=swap"
    rel="stylesheet"
	/>
</svelte:head>

{@render children()}
