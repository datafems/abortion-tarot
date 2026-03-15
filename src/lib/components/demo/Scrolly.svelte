<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';

  const dispatch = createEventDispatcher();
  let container: HTMLDivElement;

  onMount(() => {
    const steps = container.querySelectorAll<HTMLElement>('section[data-step]');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            dispatch('step', {
              index: +entry.target.dataset.step!
            });
          }
        });
      },
      {
        threshold: 0.6
      }
    );

    steps.forEach((el) => observer.observe(el));
  });
</script>

<div class="scrolly" bind:this={container}>
  <slot />
</div>

<style>
.scrolly {
  position: relative;
}
</style>
