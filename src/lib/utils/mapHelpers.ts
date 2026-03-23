import * as d3 from "d3";
import type * as Types from '$lib/types';

/*
List of helper functions for map interactions and animations, including: 
- clearBlankMap: Clears all map layers
- clearScrollGraphicBackground: Clears background image from scroll graphic elements.
- resetView: Resets map view to default state with smooth transitions.
- zoomToProvince: Zooms to a specific province with smooth animation and updates statistics.
- highlightProvinces: Highlights specific provinces with smooth transitions.
- highlightProvincesNonAccess: Highlights provinces with no access using different styling.
- highlightAllClinics: Highlights all clinics and resets province styling.
- showLegendGroup: Displays a legend group with color scale and clinic symbol.
- pulseAnimation: Applies a pulse animation to a D3 selection.
- fadeIn: Fades in a D3 selection with transition.
- fadeOut: Fades out a D3 selection with transition.
- smoothScale: Applies a smooth scale transition to a D3 selection.
- updateTextWithFade: Updates text content of an element with a fade transition.
- animateNumber: Animates a number counting up to a target value with optional suffix.
*/

type MapLayer =  Types.MapLayer;
type ProvincePaths = Types.ProvincePaths;
type ClinicCircles = Types.ClinicCircles;
type DistrictPaths = Types.DistrictPaths;

type TooltipData = { visible: boolean; x: number; y: number; content: string };

export function clearBlankMap(){
  d3.select("#map-container")
  .transition()
  .duration(600)
  .style("opacity", 0)
  .style("pointer-events", "ืnone");
}


/**
 * Clear background image from scroll graphic
 */
export function clearScrollGraphicBackground(mapLayer:MapLayer) {
  d3.selectAll(".scroll-graphic").style("background-image", "none");

  mapLayer.select(".patients-layer").remove();
  mapLayer.select(".legend-group").remove();
  mapLayer.selectAll(".province-labels").remove();
  

  console.log("clear patient and legend")
}

/**
 * Reset map view to default state with smooth transitions
 * @param {Object} mapLayer - D3 selection of map layer group
 * @param {Object} provincePaths - D3 selection of province paths
 * @param {Object} clinicCircles - D3 selection of clinic circles
 */

export function resetView(mapLayer: MapLayer, provincePaths: ProvincePaths, clinicCircles: ClinicCircles, districtPaths: DistrictPaths) {
  d3.select("#map-container")
  .transition()
  .duration(600)
  .style("opacity", 1)
  .style("pointer-events", "auto");
  
  if (!mapLayer) return;
  // Reset zoom with smooth transition
  mapLayer
    .transition()
    .duration(1000)
    .ease(d3.easeCubicInOut)
    .attr("transform", "translate(0,0) scale(1)");

  // Reset province colors and opacity
  provincePaths
    .transition()
    .duration(800)
    .ease(d3.easeCubicInOut)
    .attr("fill", "var(--color-dark)")
    .attr("opacity", "0.6")
    .attr("stroke-width", "0.5");

  // Reset clinic circles
  clinicCircles
    .transition()
    .duration(800)
    .ease(d3.easeCubicInOut)
    .attr("r", 3)
    .attr("opacity", "0") //0.8
    .attr("fill", "var(--color-highlight)");

  districtPaths
    .transition()
    .duration(800)
    .ease(d3.easeCubicInOut)
    .attr("opacity", "0"); //0.2
}


export function showPatientsBubble(provinceData: Record<string, number>, width: number, states: any[], path: any, mapLayer: MapLayer, onTooltip: (data: TooltipData) => void ) {  
  
  console.log(provinceData)
  const centroids = states.map((feature: any) => {
    const province = feature.properties?.pro_th?.trim();
    const value = provinceData[province];

    if (!value) return null;
    const centroid = path.centroid(feature);
    return {
      name: feature.properties.pro_th,
      patients: value,
      x: centroid[0],
      y: centroid[1],
    };
  }).filter((d: any) => d !== null);


  const radiusScale = d3
    .scaleSqrt()
    .domain([0, d3.max(centroids, (d) => d.patients) || 0])
    .range([3, 20]);

  const patientsLayer = mapLayer
    .append("g")
    .attr("class", "patients-layer");

  patientsLayer.selectAll("circle.patients")
    .data(centroids)
    .join("circle")
    .attr("class", "patients")
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("r", 0)
    .attr("fill", "var(--color-secondary)")
    .attr("stroke", "var(--color-light)")
    .attr("stroke-width", 2)
    .attr("fill-opacity", 0.0)
    .on("mouseenter", function (event: MouseEvent, d:any) {
      onTooltip({ visible: true, x: event.offsetX, y: event.offsetY, content: `${d.name}: ${d.patients} patients` });
      d3.select(this).attr("stroke-width", 3);
    })
    .on("mousemove", function (event: MouseEvent, d:any) {
      onTooltip({ visible: true, x: event.offsetX, y: event.offsetY, content: `${d.name}: ${d.patients} คน` });
    })
    .on("mouseleave", function () {
      onTooltip({ visible: false, x: 0, y: 0, content: '' });
      d3.select(this).attr("stroke-width", 2);
    })
    .on("touchstart", function (event: TouchEvent, d:any) {
      event.preventDefault();
      const touch = event.touches[0];
      const rect = (event.target as Element).closest("svg")!.getBoundingClientRect();
      onTooltip({ visible: true, x: touch.clientX - rect.left, y: touch.clientY - rect.top, content: `${d.name}: ${d.patients} คน` });
      d3.select(this).attr("stroke-width", 3);
    })
    .on("touchend", function () {
      setTimeout(() => onTooltip({ visible: false, x: 0, y: 0, content: '' }), 1500);
      d3.select(this).attr("stroke-width", 2);
    })
    .transition()
    .duration(900)
    .ease(d3.easeCubicOut)
    .attr("r", (d) => radiusScale(d.patients))
    .attr("fill-opacity", 0.8);


  // Legend Patients
  const legend = patientsLayer
    .append("g")
    .attr("transform", width < 500 ? "translate(50,50)" : "translate(600,50)");
          
  const legendPaitent = legend.append("g")
    .attr("class", "legend-patient");
          
  legendPaitent
    .append("circle")
    .attr("class", "legend-patient")
    .attr("cx", 160)
    .attr("cy", 355)
    .attr("r", 8)
    .style("fill", "var(--color-secondary)")
    .attr("stroke", "var(--color-light")
    .attr("stroke-width", "2px");

  legendPaitent.append("text")
    .attr("class", "legend-patient")
    .attr("x", 200)
    .attr("y", 360)
    .style("font-weight", "500")
    .style("font-size", "13px")
    .style("fill", "var(--color-light)")
    .selectAll("tspan")
    .data([
      "จำนวนผู้ใช้สิทธิสปสช.",
      "ทำแท้งปลอดภัย ปีงบ 2568"
    ])
    .enter()
    .append("tspan")
    .attr("x", 180)
    .attr("dy", (d, i) => i === 0 ? "0em" : "1.2em")
    .text(d => d);
}



/**
 * Zoom to a specific province with smooth animation
 * @param {string} provinceName - Name of the province in Thai
 * @param {Array} states - GeoJSON features array
 * @param {Object} path - D3 geoPath generator
 * @param {number} width - SVG width
 * @param {number} height - SVG height
 * @param {Object} mapLayer - D3 selection of map layer
 * @param {Object} provincePaths - D3 selection of province paths
 * @param {Object} clinicCircles - D3 selection of clinic circles
 * @param {Array} clinics - Array of clinic data
 */
export function zoomToProvince(
  provinceName: string,
  states: any[],
  path: any,
  width: number,
  height: number,
  mapLayer: MapLayer,
  provincePaths: ProvincePaths,
  clinicCircles: ClinicCircles,
  clinics: any[],
  onTooltip: (data: TooltipData) => void
) {
  console.log("in ZoomToProvince", provinceName)
  const feature = states.find(d => d.properties.pro_th === provinceName);
  if (!feature) return;

  // Calculate zoom bounds
  const [[x0, y0], [x1, y1]] = path.bounds(feature);
  const dx = x1 - x0;
  const dy = y1 - y0;
  const x = (x0 + x1) / 2;
  const y = (y0 + y1) / 2;
  const scale = Math.min(8, 0.9 / Math.max(dx / width, dy / height));

  // Zoom to province with smooth easing
  mapLayer
    .transition()
    .duration(1200)
    .ease(d3.easeCubicInOut)
    .attr(
      "transform",
      `translate(${width / 2 - scale * x},${height / 2 - scale * y}) scale(${scale})`
    );

  // Highlight selected province, fade others
  provincePaths
    .transition()
    .duration(800)
    //.delay((d, i) => i * 2) // Stagger animation slightly
    .ease(d3.easeCubicInOut)
    .attr("fill", d =>
      d.properties.pro_th === provinceName
        ? "var(--color-gray)"
        : "var(--color-dark)"
    )
    .attr("opacity", d =>
      d.properties.pro_th === provinceName ? 0.6 : 0.2
    )
    .attr("stroke-width", d =>
      d.properties.pro_th === provinceName ? 1.5 / scale : 0.5 / scale
    );

  // Scale and fade clinic circles
  clinicCircles
    .on("mouseenter", function (event: MouseEvent, d:any) {
      onTooltip({ visible: true, x: event.offsetX, y: event.offsetY, content: `${d.name}\nจ.${d.province_name}` });
      d3.select(this).attr("stroke-width", 3);
    })
    .on("mousemove", function (event: MouseEvent, d:any) {
      onTooltip({ visible: true, x: event.offsetX, y: event.offsetY, content: `${d.name}\nจ.${d.province_name}` });
    })
    .on("mouseleave", function () {
      onTooltip({ visible: false, x: 0, y: 0, content: '' });
      d3.select(this).attr("stroke-width", 2);
    })
    .on("touchstart", function (event: TouchEvent, d:any) {
      event.preventDefault();
      const touch = event.touches[0];
      const rect = (event.target as Element).closest("svg")!.getBoundingClientRect();
      onTooltip({ visible: true, x: touch.clientX - rect.left, y: touch.clientY - rect.top, content: `${d.name}\nจ.${d.province_name}` });
      d3.select(this).attr("stroke-width", 3);
    })
    .on("touchend", function () {
      setTimeout(() => onTooltip({ visible: false, x: 0, y: 0, content: '' }), 1500);
      d3.select(this).attr("stroke-width", 2);
    })
    .transition()
    .duration(800)
    .ease(d3.easeCubicInOut)
    .attr("r", d =>
      d.province_name === provinceName ? 8 / scale : 3 / scale
    )
    .attr("opacity", d =>
      d.province_name === provinceName ? 1 : 0.1
    )
    .attr("fill", "var(--color-highlight)");

}

/**
 * Highlight specific provinces with smooth transitions
 * @param {Array} provinceNames - Array of province names to highlight
 * @param {Object} provincePaths - D3 selection of province paths
 * @param {Object} clinicCircles - D3 selection of clinic circles
 */

export function highlightProvinces(provinceNames: string[], provincePaths: ProvincePaths, clinicCircles: ClinicCircles) {
  // Fade in highlighted provinces, fade out others
  provincePaths
    .transition()
    .duration(800)
    //.delay((d:any, i:number) => i * 2)
    .ease(d3.easeCubicInOut)
    .attr("fill", d =>
      provinceNames.includes(d.properties.pro_th) ? "#dbfdae" : "#e5e7eb"
    )
    .attr("opacity", d =>
      provinceNames.includes(d.properties.pro_th) ? 1 : 0.3
    )
    .attr("stroke-width", d =>
      provinceNames.includes(d.properties.pro_th) ? 1.2 : 0.5
    );

  // Highlight clinics in selected provinces
  clinicCircles
    .transition()
    .duration(800)
    .ease(d3.easeCubicInOut)
    .attr("opacity", d =>
      provinceNames.includes(d.province_name) ? 1 : 0.1
    )
    .attr("r", d =>
      provinceNames.includes(d.province_name) ? 5 : 3
    )
    .attr("fill", "var(--color-highlight)");
}

/**
 * Highlight provinces with no access (different styling)
 * @param {Array} provinceNames - Array of province names with no access
 * @param {Object} provincePaths - D3 selection of province paths
 * @param {Object} clinicCircles - D3 selection of clinic circles
 */

export function highlightProvincesNonAccess(provinceNames: string[], path: any, states: any[], mapLayer: MapLayer, provincePaths: ProvincePaths, clinicCircles: ClinicCircles, districtPath: DistrictPaths) {
  //const { provinceNames, provincePaths, clinicCircles } = options;
  // Black for non-access provinces, light gray for others
  provincePaths
    .transition()
    .duration(800)
    //.delay((d:any, i:number) => i * 2)
    .ease(d3.easeCubicInOut)
    .attr("fill", d =>
      provinceNames.includes(d.properties.pro_th) ? "#000000" : "var(--color-white)"
    )
    .attr("opacity", d =>
      provinceNames.includes(d.properties.pro_th) ? 0.9 : 0.3
    )
    .attr("stroke-width", d =>
      provinceNames.includes(d.properties.pro_th) ? 1.5 : 0.5
    )
    .attr("stroke", d =>
      provinceNames.includes(d.properties.pro_th) ? "var(--color-red)" : "#fff"
    );

  const selectedProvinces = states.filter((d: any) =>
    provinceNames.includes(d?.properties?.pro_th)
  );

  // Create label layer
  const labelLayer = mapLayer
    .append("g")
    .attr("class", "province-labels");

  // Bind data safely
  labelLayer
    .selectAll("text")
    .data(selectedProvinces.filter((d: any) => d?.geometry))
    .join("text")
    .attr("x", (d: any) => {
      const [x] = path.centroid(d);
      return Number.isFinite(x) ? x - 40 : 0;
    })
    .attr("y", (d: any) => {
      const [, y] = path.centroid(d);
      return Number.isFinite(y) ? y : 0;
    })
    .text(d => d?.properties?.pro_th ?? "")
    .attr("text-anchor", "start")
    .attr("font-size", d => {
      const area = path.area(d);
      return Math.max(11, area / 1200);
    })
    .attr("fill", "var(--color-primary)")
    .attr("paint-order", "stroke")
    .attr("stroke", "var(--color-accent)")
    .attr("stroke-width", "6px")
    .attr("pointer-events", "none")
    .style("opacity", 1)
    .text(d => d?.properties?.pro_th ?? "")
    .attr("text-anchor", "start")
    .attr("font-size", d => {
      const area = path.area(d);
      return Math.max(11, area / 1200);
    })
    .attr("fill", "var(--color-primary)")
    .attr("paint-order", "stroke")
    .attr("stroke", "var(--color-accent)")
    .attr("stroke-width", "6px")
    .attr("pointer-events", "none")
    .style("opacity", 0)
    .transition()
    .duration(400)
    .style("opacity", 1);

  // Dim clinics in non-access areas
  clinicCircles
    .attr("pointer-events", "none")
    .transition()
    .duration(800)
    //.delay((d:any, i:number) => 100 + i * 1)
    .ease(d3.easeCubicInOut)
    .attr("opacity", d => {
      return provinceNames.includes(d.province_name) ? 0.3 : 0.1;
    })
    .attr("r", 3)
    .attr("fill", d =>
      provinceNames.includes(d.province_name) ? "#999" : "var(--color-highlight)"
    );
  
  districtPath
    .attr("pointer-events", "none")
}

/**
 * Highlight all clinics (show everything)
 * @param {Object} provincePaths - D3 selection of province paths
 * @param {Object} clinicCircles - D3 selection of clinic circles
 */

export function highlightAllClinics(provincePaths: ProvincePaths, clinicCircles: ClinicCircles, onTooltip: (data: TooltipData) => void) {
  // Reset provinces to light gray background
  provincePaths
    .transition()
    .duration(800)
    .ease(d3.easeCubicInOut)
    .attr("fill", "var(--color-dark)")
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.5)
    .attr("opacity", 0.6);

  // Show all clinics prominently
  clinicCircles
    .on("mouseenter", function (event: MouseEvent, d:any) {
      onTooltip({ visible: true, x: event.offsetX, y: event.offsetY, content: `${d.name}\nจ.${d.province_name}` });
      d3.select(this).attr("stroke-width", 3);
    })
    .on("mousemove", function (event: MouseEvent, d:any) {
      onTooltip({ visible: true, x: event.offsetX, y: event.offsetY, content: `${d.name}\nจ.${d.province_name}` });
    })
    .on("mouseleave", function () {
      onTooltip({ visible: false, x: 0, y: 0, content: '' });
      d3.select(this).attr("stroke-width", 2);
    })
    .on("touchstart", function (event: TouchEvent, d:any) {
      event.preventDefault();
      const touch = event.touches[0];
      const rect = (event.target as Element).closest("svg")!.getBoundingClientRect();
      onTooltip({ visible: true, x: touch.clientX - rect.left, y: touch.clientY - rect.top, content: `${d.name}\nจ.${d.province_name}` });
      d3.select(this).attr("stroke-width", 3);
    })
    .on("touchend", function () {
      setTimeout(() => onTooltip({ visible: false, x: 0, y: 0, content: '' }), 1500);
      d3.select(this).attr("stroke-width", 2);
    })
    .transition()
    .duration(800)
    .ease(d3.easeCubicInOut)
    .attr("opacity", 0.9)
    .attr("r", 3)
    .attr("fill", "var(--color-highlight)");
}

export function zoomToProvinceTravel(
  provinceName: string,
  states: any[],
  path: any,
  width: number,
  height: number,
  mapLayer: MapLayer,
  provincePaths: ProvincePaths,
  clinicCircles: ClinicCircles,
  districtPaths: DistrictPaths,
  distanceByDistrict: Map<string, number>,
  onTooltip: (data: TooltipData) => void) {

  const feature = states.find(d => d.properties.pro_th === provinceName);
  if (!feature) return;

  // Calculate zoom bounds
  const [[x0, y0], [x1, y1]] = path.bounds(feature);
  const dx = x1 - x0;
  const dy = y1 - y0;
  const x = (x0 + x1) / 2;
  const y = (y0 + y1) / 2;
  const scale = Math.min(8, 0.9 / Math.max(dx / width, dy / height));

  provincePaths
    .transition()
    .duration(800)
    .ease(d3.easeCubicInOut)
    .attr("stroke", d =>
      d.properties.pro_th === provinceName
        ? "var(--color-gray)"
        : "var(--color-light)"
    )
    .attr("opacity", d =>
      d.properties.pro_th === provinceName ? 0.6 : 0.2
    )
    .attr("stroke-width", d =>
      d.properties.pro_th === provinceName ? 1 : 0.2
    );
  
  // Scale and fade clinic circles
  clinicCircles
    .transition()
    .duration(800)
    .ease(d3.easeCubicInOut)
    .attr("r", d =>
      d.province_name === provinceName ? 8 / scale : 3 / scale
    )
    .attr("opacity", d =>
      d.province_name === provinceName ? 1 : 0.1
    )
    .attr("fill", "var(--color-highlight)");

  districtPaths
  .on("mouseenter", function (event: MouseEvent) {
    const target = d3.select(event.target as Element);
    const d = target.datum() as any;
    if (!d) return;
    const key = d.properties.adm2_pcode?.trim();
    const distance = distanceByDistrict.get(key);
    onTooltip({ visible: true, x: event.offsetX, y: event.offsetY, content: `${d.properties.adm2_name1}\n${d.properties.adm1_name1}\n${distance} กม.` });
    target.attr("stroke-width", 1.2);
  })
  .on("mousemove", function (event: MouseEvent) {
    const d = d3.select(event.target as Element).datum() as any;
    if (!d) return;
    const key = d.properties.adm2_pcode?.trim();
    const distance = distanceByDistrict.get(key);
    onTooltip({ visible: true, x: event.offsetX, y: event.offsetY, content: `${d.properties.adm2_name1}\n${d.properties.adm1_name1}\n${distance} กม.` });
  })
  .on("mouseleave", function (event: MouseEvent) {
    const target = d3.select(event.target as Element);
    onTooltip({ visible: false, x: 0, y: 0, content: '' });
    target.attr("stroke-width", 1);
  })
  .on("touchstart", function (event: TouchEvent) {
    event.preventDefault();
    const d = d3.select(event.target as Element).datum() as any;
    if (!d) return;
    const key = d.properties.adm2_pcode?.trim();
    const distance = distanceByDistrict.get(key);
    const touch = event.touches[0];
    const rect = (event.target as Element).closest("svg")!.getBoundingClientRect();
    onTooltip({ visible: true, x: touch.clientX - rect.left, y: touch.clientY - rect.top, content: `${d.properties.adm2_name1}\n${d.properties.adm1_name1}\n${distance} กม.` });
  })
  .on("touchend", function () {
    setTimeout(() => onTooltip({ visible: false, x: 0, y: 0, content: '' }), 1500);
  })
    .transition()
    .duration(800)
    .ease(d3.easeCubicInOut)
    .attr("opacity", (d: any) =>
        d.properties.adm1_name1 === provinceName ? "0.8" : "0");
}

export function resetViewTravel(
  mapLayer: MapLayer,
  provincePaths: ProvincePaths,
  clinicCircles: ClinicCircles,
  districtPaths: DistrictPaths,
  distanceByDistrict: Map<string, number>,
  onTooltip: (data: TooltipData) => void) {

  // Reset zoom with smooth transition
  mapLayer
    .transition()
    .duration(1000)
    .ease(d3.easeCubicInOut)
    .attr("transform", "translate(0,0) scale(1)");

  // Reset province colors and opacity
  provincePaths
    .transition()
    .duration(800)
    .ease(d3.easeCubicInOut)
    .attr("pointer-events", "none")
    .attr("fill", "var(--color-dark)")
    .attr("fill-opacity", "0")
    .attr("stroke", "var(--color-light)")
    .attr("stroke-width", "0.5")
    .attr("opacity", "1");

  d3.selectAll(".provinces").raise(); 

  // Show all clinics prominently
  clinicCircles
    .transition()
    .duration(800)
    .ease(d3.easeCubicInOut)
    .attr("opacity", 0.9)
    .attr("r", 3)
    .attr("fill", "var(--color-highlight)");

  districtPaths
    .on("mouseenter", function (event: MouseEvent) {
      const target = d3.select(event.target as Element);
      const d = target.datum() as any;
      if (!d) return;
      const key = d.properties.adm2_pcode?.trim();
      const distance = distanceByDistrict.get(key);
      onTooltip({ visible: true, x: event.offsetX, y: event.offsetY, content: `${d.properties.adm2_name1}\n${d.properties.adm1_name1}\n${distance} กม.` });
      target.attr("stroke-width", 3);
    })
    .on("mousemove", function (event: MouseEvent) {
      const d = d3.select(event.target as Element).datum() as any;
      if (!d) return;
      const key = d.properties.adm2_pcode?.trim();
      const distance = distanceByDistrict.get(key);
      onTooltip({ visible: true, x: event.offsetX, y: event.offsetY, content: `${d.properties.adm2_name1}\n${d.properties.adm1_name1}\n${distance} กม.` });
    })
    .on("mouseleave", function (event: MouseEvent) {
      const target = d3.select(event.target as Element);
      onTooltip({ visible: false, x: 0, y: 0, content: '' });
      target.attr("stroke-width", 1);
    })
    .on("touchstart", function (event: TouchEvent) {
      event.preventDefault();
      const d = d3.select(event.target as Element).datum() as any;
      if (!d) return;
      const key = d.properties.adm2_pcode?.trim();
      const distance = distanceByDistrict.get(key);
      const touch = event.touches[0];
      const rect = (event.target as Element).closest("svg")!.getBoundingClientRect();
      onTooltip({ visible: true, x: touch.clientX - rect.left, y: touch.clientY - rect.top, content: `${d.properties.adm2_name1}\n${d.properties.adm1_name1}\n${distance} กม.` });
    })
    .on("touchend", function () {
      setTimeout(() => onTooltip({ visible: false, x: 0, y: 0, content: '' }), 1500);
    })
    .transition()
    .duration(800)
    .ease(d3.easeCubicInOut)
    .attr("opacity", "0.8");
}

export function showLegendGroup(
  provinceName: string,
  states: any[],
  path: any,
  width: number,
  height: number,
  mapLayer: MapLayer,
  isProvince:Boolean) {

  const feature = states.find(d => d.properties.pro_th === provinceName);
  if (!feature) return;

  // Calculate zoom bounds
  const [[x0, y0], [x1, y1]] = path.bounds(feature);
  const dx = x1 - x0;
  const dy = y1 - y0;
  const x = (x0 + x1) / 2;
  const y = (y0 + y1) / 2;

  const legendX = width - 120;
  const legendY = height - 80;


  //Legend
  let legend = mapLayer.append("g");
  if (isProvince) {
    const padding = 5; // distance from edge
    legend.attr("transform", `translate(${x0}, ${y1+padding}) scale(0.15)`);
  } else {
    legend.attr("transform", width < 500 ? "translate(190,400) scale(0.85)" : "translate(750,400) scale(0.85)");
  }


 const colorScale = d3.scaleSequential()
    .domain([0, 240])
    .interpolator(d3.interpolateRgb("var(--color-secondary)", "var(--color-light)"));
  
    
  const legendData = [
  { color: "var(--color-secondary)", value: 0 },
  { color: "var(--color-light)", value: 240 }
]  

  /*
  const steps = 5
  const legendData = d3.range(steps).map(i => {
  const t = i / (steps-1);
  const value = colorScale.domain()[0] + t * (colorScale.domain()[1] - colorScale.domain()[0]);

  return {
    color: colorScale(value),
    value: Math.round(value)
    }
  })
  */

          const legendGroup = legend.append("g")
            .attr("class", "legend-group");
          
          legendGroup.append("text")
            .attr("x", "0")
            .attr("y", "-8")
            .text("ระยะทางถึงหน่วยบริการ (กิโลเมตร)")
            .style("font-size", "13px")
            .style("font-weight", "600")
            .style("fill", "var(--color-light)")
            .style("text-decoration", "underline")
            .style("text-decoration-thickness", "5px")
            .style("text-decoration-color", "var(--color-highlight)");

          /*
          legendGroup.selectAll("rect")
            .data(legendData)
            .join("rect")
            .attr("x", (d: any, i: number) => i * 30)
            .attr("width", "30")
            .attr("height", "18")
            .attr("fill", (d: { color: any; }) => d.color);
          */
          const grad = legendGroup.append("linearGradient").attr("id", "legend-gradient")
         
          grad.append("stop").attr("offset", "0%").attr("stop-color", "var(--color-secondary)")
          grad.append("stop").attr("offset", "100%").attr("stop-color", "var(--color-light)")

          legendGroup.append("rect")
            .attr("x", "15")
            .attr("y", "0")
            .attr("width", "165")
            .attr("height", "18")
            .style("fill", "url(#legend-gradient)")

          legendGroup.append("circle")
            .attr("class", "clinic-symbol")
            .attr("cx", "15")
            .attr("cy", "60")
            .attr("r", "8")
            .attr("fill", "var(--color-highlight)");

          legendGroup.append("text")
            .attr("class", "clinic-label")
            .attr("x", "30")
            .attr("y", "55")
            .selectAll("tspan")
            .data([
              "หน่วยบริการทำแท้งปลอดภัย"
            ])
            .enter()
            .append("tspan")
            .attr("x", 30)
            .attr("dy", (d, i) => i === 0 ? "0em" : "1.2em")
            .text(d => d)
            .attr("dy", "1.1em")
            .style("font-weight", "500")
            .style("font-size", "13px")
            .style("fill", "var(--color-light)");
          
          /*
          legendGroup.selectAll("text.legend-label")
            .data(legendData)
            .join("text")
            .attr("class", "legend-label")
            .attr("x", (d: any, i: number) => i * 30 + 8)
            .attr("y", "34")
            .text(d => `${d.value}`)
            .style("font-size", "11px")
            .style("font-weight", "400")
            .style("fill", "var(--color-light)");
          */
          legendGroup.append("text")
            .attr("class", "legend-label")
            .attr("x", 15)
            .attr("y", 34)
            .text("0")
            .style("font-size", "11px")
            .style("font-weight", "400")
            .style("fill", "var(--color-light)");

          legendGroup.append("text")
            .attr("class", "legend-label")
            .attr("x", 180) 
            .attr("y", 34)
            .attr("text-anchor", "end")
            .text("240")
            .style("font-size", "11px")
            .style("font-weight", "400")
            .style("fill", "var(--color-light)");
        }

/**
 * Pulse animation for highlighted elements
 * @param {Object} selection - D3 selection to pulse
 * @param {number} duration - Pulse duration in ms
 */
interface PulseAnimationOptions {
    selection: any;
    duration?: number;
}
export function pulseAnimation(options: PulseAnimationOptions) {
  const { selection, duration = 2000 } = options;
  function pulse() {
    selection
      .transition()
      .duration(duration / 2)
      .ease(d3.easeSinInOut)
      .attr("opacity", 0.5)
      .transition()
      .duration(duration / 2)
      .ease(d3.easeSinInOut)
      .attr("opacity", 1)
      .on("end", pulse);
  }
  pulse();
}

/**
 * Fade in animation for new elements
 * @param {Object} selection - D3 selection to fade in
 * @param {number} duration - Fade duration in ms
 */
interface FadeInOptions {
    selection: any;
    duration?: number;
}
export function fadeIn(options: FadeInOptions) {
  const { selection, duration = 500 } = options;
  selection
    .style("opacity", 0)
    .transition()
    .duration(duration)
    .ease(d3.easeCubicInOut)
    .style("opacity", 1);
}

/**
 * Fade out animation
 * @param {Object} selection - D3 selection to fade out
 * @param {number} duration - Fade duration in ms
 */
interface FadeOutOptions {
    selection: any;
    duration?: number;
}
export function fadeOut(options: FadeOutOptions) {
  const { selection, duration = 500 } = options;
  return selection
    .transition()
    .duration(duration)
    .ease(d3.easeCubicInOut)
    .style("opacity", 0);
}

/**
 * Smooth scale transition for elements
 * @param {Object} selection - D3 selection to scale
 * @param {number} targetScale - Target scale value
 * @param {number} duration - Animation duration in ms
 */
interface SmoothScaleOptions {
    selection: any;
    targetScale: number;
    duration?: number;
}

export function smoothScale(options: SmoothScaleOptions) {
  const { selection, targetScale, duration = 600 } = options;
  selection
    .transition()
    .duration(duration)
    .ease(d3.easeCubicInOut)
    .attr("transform", `scale(${targetScale})`);
}

/**
 * Update text content with fade transition
 * @param {string} selector - CSS selector for element
 * @param {string} newText - New text content
 * @param {number} duration - Fade duration in ms
 */
interface UpdateTextOptions {
    selector: string;
    newText: string;
    duration?: number;
}

export function updateTextWithFade(options: UpdateTextOptions) {
  const { selector, newText, duration = 300 } = options;
  const element = d3.select(selector);
  
  element
    .transition()
    .duration(duration)
    .style("opacity", 0)
    .on("end", function() {
      element.text(newText);
      element
        .transition()
        .duration(duration)
        .style("opacity", 1);
    });
}

/**
 * Animate number counting up
 * @param {string} selector - CSS selector for element
 * @param {number} targetValue - Target number
 * @param {number} duration - Animation duration in ms
 * @param {string} suffix - Suffix to append (e.g., " แห่ง")
 */

interface AnimateNumberOptions {
    selector: string;
    targetValue: number;
    duration?: number;
    suffix?: string;
}
export function animateNumber(options: AnimateNumberOptions) {
  const { selector, targetValue, duration = 1000, suffix = "" } = options;
  const element = d3.select(selector);
  
  element
    .transition()
    .duration(duration)
    .ease(d3.easeCubicOut)
    .tween("text", function() {
      const interpolate = d3.interpolateNumber(0, targetValue);
      return function(t:any) {
        element.text(Math.round(interpolate(t)) + suffix);
      };
    });
}

