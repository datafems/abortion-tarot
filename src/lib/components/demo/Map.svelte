<script lang="ts">
  import * as d3 from 'd3';
  import { onMount } from 'svelte';

  export let currentStep: number;

  let svg: SVGSVGElement;
  let g: SVGGElement;
  let zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;
  let geojson: any;

  const width = 800;
  const height = 600;

  const projection = d3.geoMercator();
  const path = d3.geoPath(projection);

  let lastStep = -1;

  onMount(async () => {
    geojson = await d3.json('/data/provinces.geojson');

    // 🔑 FIT PROJECTION
    projection.fitSize([width, height], geojson);

    const svgSel = d3.select(svg);
    g = svgSel.append('g').node()!;

    d3.select(g)
      .selectAll('path')
      .data(geojson.features)
      .join('path')
      .attr('d', path)
      .attr('fill', '#ddd')
      .attr('stroke', '#999');

    zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        d3.select(g).attr('transform', event.transform);
      });

    svgSel.call(zoom);
  });

  // 🔒 STEP LOCK
  $: if (g && zoom && currentStep !== lastStep) {
    lastStep = currentStep;
    updateView(currentStep);
  }

  function updateView(step: number) {
    const svgSel = d3.select(svg);

    if (step === 0 || step === 3) {
      svgSel
        .transition()
        .duration(1000)
        .ease(d3.easeCubicInOut)
        .call(zoom.transform, d3.zoomIdentity);
    }

    if (step === 1) zoomToProvince('กรุงเทพมหานคร');
    if (step === 2) zoomToProvince('เชียงใหม่');
  }

  function zoomToProvince(name: string) {
    const feature = d3.select(g)
      .selectAll<SVGPathElement, any>('path')
      .filter(d => d.properties.name === name)
      .datum();

    if (!feature) {
      console.warn('Province not found:', name);
      return;
    }

    const [[x0, y0], [x1, y1]] = path.bounds(feature);

    const scale = Math.min(
      8,
      0.9 / Math.max(
        (x1 - x0) / width,
        (y1 - y0) / height
      )
    );

    const translate = [
      width / 2 - scale * (x0 + x1) / 2,
      height / 2 - scale * (y0 + y1) / 2
    ];

    d3.select(svg)
      .transition()
      .duration(1000)
      .ease(d3.easeCubicInOut)
      .call(
        zoom.transform,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
      );
  }
</script>

<svg bind:this={svg} {width} {height} />
