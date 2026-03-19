<script lang="ts">
  import favicon from '$lib/assets/favicon.png'
  import '$lib/styles/app.css'
  import { dev, browser } from '$app/environment'
  import { onMount } from 'svelte'

  onMount(() => {
    if (!browser) return

    if (dev) {
      window.umami = {
        track: (event: string, props?: object) => {
          console.group(`%c[Umami] ${event}`, 'color: #7c3aed; font-weight: bold')
          console.table(props ?? {})
          console.groupEnd()
        }
      }
    }
  })

  let { children } = $props()
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Niramit:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;1,200;1,300;1,400;1,500;1,600;1,700&display=swap"
    rel="stylesheet"
  />

  {#if !dev}
    <script
      defer
      src="https://eu.umami.is/script.js"
      data-website-id={import.meta.env.PUBLIC_UMAMI_WEBSITE_ID}
      data-domains="datafems.github.io"
    ></script>
  {/if}
</svelte:head>

{@render children()}