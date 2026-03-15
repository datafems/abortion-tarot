<script lang="ts">
  import { onMount } from 'svelte';
  import Map from './demo/Map.svelte';
  import Scrolly from './demo/Scrolly.svelte';

  let currentStep = 0;

  function handleStep(event: CustomEvent) {
    currentStep = event.detail.index;
  }
</script>

<div class="layout">

  <!-- Sticky Map -->
  <div class="graphic">
    <Map {currentStep} />
  </div>

  <!-- Scroll Text -->
  <div class="text">
    <Scrolly on:step={handleStep}>

      <section data-step="0" class="step">
        <h2>Thailand Overview</h2>
        <p>Zoomed out national view.</p>
      </section>

      <section data-step="1" class="step">
        <h2>Bangkok</h2>
        <p>Zoom into Bangkok and show travel time.</p>
      </section>

      <section data-step="2" class="step">
        <h2>Chiang Mai</h2>
        <p>Focus on northern province.</p>
      </section>

      <section data-step="3" class="step">
        <h2>Back to National</h2>
        <p>Zoom back out smoothly.</p>
      </section>

    </Scrolly>
  </div>

</div>

<style>
.layout {
  display: flex;
  position: relative;
}

/* LEFT SIDE MAP */
.graphic {
  position: sticky;
  top: 0;
  width: 60%;
  height: 100vh;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* RIGHT SIDE TEXT */
.text {
  width: 40%;
  padding-left: 2rem;
}

/* EACH STEP */
.step {
  margin: 0 auto 80vh auto;
  max-width: 500px;
}
</style>