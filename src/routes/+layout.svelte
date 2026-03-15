<script lang="ts">

	import favicon from '$lib/assets/favicon.png';
	// Styles
    import '$lib/styles/app.css';
	let { children } = $props();

	export const prerender = true;
	export const trailingSlash = 'always';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
