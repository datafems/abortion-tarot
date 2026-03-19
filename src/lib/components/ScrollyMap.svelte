<script lang='ts'>
  import { onMount, onDestroy } from 'svelte';
  import * as d3 from 'd3';
  import type { GeoProjection, GeoPath } from 'd3-geo';
  import * as mapHelpers from '$lib/utils/mapHelpers';
  import type * as Types from '$lib/types';
  import { track } from '$lib/analytics'

  // Props from parent component
  export let userData = {
    province: '',
    cardKey: ''
  };
  export let province = userData.province || ""; // Ensure province is always a string
  export let cardKey = userData.cardKey || ""; // Ensure cardKey is always a string

  // Import card themes
  import { cardThemes, actioncardThemes } from '$lib/data/cardThemes';

  // Get all cards
  const cards = Object.entries(actioncardThemes).map(([key, card]) => ({
    key,
    ...card
  }));

  type MapLayer =  Types.MapLayer;
  type ProvincePaths = Types.ProvincePaths;
  type ClinicCircles = Types.ClinicCircles;
  type DistrictPaths = Types.DistrictPaths;


  // D3 and Scrollama instances
  let scroller:any;
  let svg:SVGSVGElement, mapLayer:MapLayer, provincePaths:ProvincePaths, clinicCircles:ClinicCircles, districtPaths:DistrictPaths,
      projection:GeoProjection, path:GeoPath;
  let width:Number, height:Number;

  // Data
  let provinceData:Record<string, number> = {};
  let clinics: any[] = [];
  let states: any[] = [];
  let distanceByDistrict = new Map();

  let tooltip = { visible: false, x: 0, y: 0, content: '' };

  let abortionCount = 'ไม่พบข้อมูล';
  let totalAbortionCount: any;
  let clinicCount = 'ไม่พบข้อมูล';
  let totalClinicCount: any;
  

  let nonAccessProvince = [
    "กระบี่", "กำแพงเพชร", "ตราด", "นนทบุรี",
    "ปราจีนบุรี", "พังงา", "พิจิตร", "ระนอง", 
    "สระบุรี", "หนองบัวลำภู", "อุทัยธานี",
  ];

  let nonAccessProvinceCount = nonAccessProvince.length;
        

  // Scrollama step handlers
  function handleStepEnter(response: { index: any; }) {
    const { index } = response;
    console.log('Step entered:', index);

    switch (index) {
      case 0: // Show card meaning
        //showCardMeaning(0);
        break;
      
      case 1: // Intro
        break;

      case 2: // ดวงเมืองเปลี่ยน - ปี 2564 เกิดจุดเปลี่ยนสำคัญ
        break;

      case 3: // You're not alone - จำนวนผู้ใช้บริการ และอาจมีมากกว่านี้เพียงแต่พวกเขาเข้าไม่ถึงไม่ถึงสิทธิสปสช.
        mapHelpers.resetView(mapLayer, provincePaths, clinicCircles, districtPaths);
        mapHelpers.showPatientsBubble(provinceData, width, states, path, mapLayer, (data: { visible: boolean; x: number; y: number; content: string; }) => {tooltip = data;});
        break;

      case 4: // Show full Thailand map
        mapHelpers.clearScrollGraphicBackground(mapLayer);
        mapHelpers.resetView(mapLayer, provincePaths, clinicCircles, districtPaths);
        setTimeout(() => {
          mapHelpers.highlightAllClinics(provincePaths, clinicCircles, (data: { visible: boolean; x: number; y: number; content: string; }) => {tooltip = data;});
        }, 500);
        break;
      
      case 5: // User's province
        mapHelpers.zoomToProvince(
          province,
          states,
          path,
          width,
          height,
          mapLayer,
          provincePaths,
          clinicCircles,
          clinics,
          (data: { visible: boolean; x: number; y: number; content: string; }) => {tooltip = data;}
        );
        break;
      
      case 6: // Access Province
        mapHelpers.clearScrollGraphicBackground(mapLayer);
        mapHelpers.zoomToProvinceTravel(province,states,path,width,height,mapLayer,provincePaths,clinicCircles, districtPaths, distanceByDistrict, (data: { visible: boolean; x: number; y: number; content: string; }) => {tooltip = data;});
        mapHelpers.showLegendGroup(province, states, path, width, height, mapLayer,true);
        break;
      
      case 7: // Access Overview
        mapHelpers.clearScrollGraphicBackground(mapLayer);
        mapHelpers.resetViewTravel(mapLayer, provincePaths, clinicCircles,districtPaths, distanceByDistrict, (data: { visible: boolean; x: number; y: number; content: string; }) => {tooltip = data;});
        mapHelpers.showLegendGroup(province, states, path, width, height, mapLayer,false);
        break;
      
      case 8: // ดวงการเงิน ดวงการงาน - ค่าใช้จ่าย 
        break;
      
      case 9: // Telemed
        break;

      case 10: // ดวงความเสี่ยง - จังหวัดที่ไม่มีข้อมูลสถานบริการ สปสช.
        mapHelpers.clearScrollGraphicBackground(mapLayer);
        mapHelpers.resetView(mapLayer, provincePaths, clinicCircles, districtPaths);
        setTimeout(() => {
          mapHelpers.highlightProvincesNonAccess(
        [
        "กระบี่", "กำแพงเพชร", "ตราด", "นนทบุรี",
        "ปราจีนบุรี", "พังงา", "พิจิตร", "ระนอง", 
        "สระบุรี", "หนองบัวลำภู", "อุทัยธานี",
          ],
            path,
            states,
            mapLayer,
            provincePaths,
            clinicCircles,
            districtPaths
          );
        }, 500);
        break;

      case 11: // ดวงความเสี่ยง - จังหวัดที่ไม่มีสถานบริการ
        setTimeout(() => {
          mapHelpers.highlightProvincesNonAccess(
          [
          "กระบี่", "กำแพงเพชร", "ตราด", "นนทบุรี",
          "ปราจีนบุรี", "ระนอง", 
          "สระบุรี", "หนองบัวลำภู", "อุทัยธานี",
            
            // หยุดเบิกทั้งจังหวัด กรมอนามัย
            "น่าน", "เพชรบูรณ์", "พิจิตร","อ่างทอง", "อุบลราชธานี", "พังงา"
          ],
            path,
            states,
            mapLayer,
            provincePaths,
            clinicCircles,
            districtPaths
          );
        }, 500);
        break; 
        
      case 12: // ดวงความเสี่ยง - อคติจากบุคลากรทางการแพทย์
        mapHelpers.clearScrollGraphicBackground(mapLayer);
        setTimeout(() => {
          mapHelpers.clearBlankMap();
        }, 1000);
        break;

      case 13: // สิ่งดวงดาวกำลังสื่อสาร ไม่ใช่ความผิดของคุณ
        break;

      case 14: // Reframe
        break;

      case 15: // Reframe
        break;

      case 16: // คุณมีส่วนช่วยเปลี่ยนดวงชะตาของคนจำนวนมากได้ - เลือกไพ่ที่คุณสนใจและอยากแชร์ต่อ
        // Show Action Card
        break;
    }
  }

  function handleStepExit(response: any) {
    // Optional: handle exit animations
  }

  // Initialize D3 map and Scrollama
  onMount(async () => {
    try {
      // Load data from static folder
      const [topoData, provincePatients, clinicData, districts, districtData] = await Promise.all([
        d3.json("data/provinces.geojson"),
        d3.json("data/processed/provinces-data.json"),
        d3.csv("data/processed/clinics-abortion.csv"),
        d3.json("data/districts.geojson"),
        d3.csv("data/processed/districts-data.csv"),
      ]);

      // Process data
      clinics = clinicData.filter(d => d.status === "open");
      states = topoData.features;

      provinceData = provincePatients;
      abortionCount = provinceData[province] || 'ไม่พบข้อมูล';

      totalAbortionCount = Math.min( Object.values(provinceData || {})
      .reduce((sum, value) => sum + (Number(value) || 0), 0),39335);
      
      console.log('abortionCount', abortionCount)
      console.log('totalAbortionCount', totalAbortionCount)

      clinicCount = clinics.filter(
        (c) => c.province_name === province).length;

      totalClinicCount = clinics.length;

      console.log('clinicCount', clinicCount, totalClinicCount)
      

      // Setup D3 map
      const container = d3.select("#map-container");
      const containerNode = container.node();
      if (!containerNode) return;

      width = containerNode.getBoundingClientRect().width;
      height = 600;

      projection = d3.geoMercator()
        .center([100.5, 13.5])
        .scale(2000)
        .translate([width / 2, height / 2]);


      path = d3.geoPath().projection(projection);

      svg = container.append("svg")
        .attr("width", width)
        .attr("height", height);

      mapLayer = svg.append("g");

      // Draw provinces
      provincePaths = mapLayer.selectAll("path")
        .data(states)
        .enter()
        .append("path")
        .attr("class", "provinces")
        .attr("d", path)
        .attr("fill", "var(--color-dark)")
        .attr("stroke", "var(--color-light)")
        .attr("stroke-width", 0.5)
        .attr("opacity", 0.6);

        distanceByDistrict = new Map(
            districtData.map(d => [d.adm2_pcode.trim(), +d.distance_km])
            );

        const colorScale = d3.scaleSequential()
            .domain([0, 240])
            .interpolator(d3.interpolateRgbBasis([
"#e9d8fd", "#a9a3c1", "#66697c", "#1a202c", 
            ]));

      // Draw Districts
      districtPaths = mapLayer
        .selectAll("path.districts")
        .data(districts.features)
        .join("path")
        .attr("class", "districts")
        .attr("d", path)
        .attr("fill", d => {
          const key = d.properties.adm2_pcode;
          const value = distanceByDistrict.get(key);
          return value == null ? "var(--color-black)" : colorScale(value);
        })
        .attr("stroke", "#333")
        .attr("stroke-width", 0.5)
        .attr("opacity", 0.8);
          
      // Draw clinics
      clinicCircles = mapLayer.selectAll("circle")
        .data(clinics)
        .enter()
        .append("circle")
        .attr("cx", (d: { lon: string | number; lat: string | number; }) => projection([+d.lon, +d.lat])[0])
        .attr("cy", (d: { lon: string | number; lat: string | number; }) => projection([+d.lon, +d.lat])[1])
        .attr("r", 3)
        .attr("fill", "var(--color-highlight)")
        .attr("opacity", 0.8);

      console.log('Map rendered successfully');

      // Initialize Scrollama - wait for DOM to be fully ready
      await initScrollama();

    } catch (error) {
      console.error("Error loading data:", error);
    }
  });

  async function initScrollama() {
    // Wait for next tick to ensure DOM is ready
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check if scrollama is loaded
    if (typeof scrollama === 'undefined') {
      console.error('Scrollama not loaded! Make sure the script is in <svelte:head>');
      return;
    }

    // Check if steps exist
    const steps = document.querySelectorAll('.step');
    console.log('Found steps:', steps.length);

    if (steps.length === 0) {
      console.error('No .step elements found in DOM');
      return;
    }

    // Initialize scroller
    scroller = scrollama();
    
    console.log('Initializing scrollama...');
    
    scroller
      .setup({
        step: ".step",
        offset: 0.5,
        debug: false  // Enable debug mode to see visual indicators
      })
      .onStepEnter(handleStepEnter)
      .onStepExit(handleStepExit);

    console.log('Scrollama initialized successfully');

    // Handle resize
    window.addEventListener("resize", handleResize);
  }

  function handleResize() {
    if (scroller) {
      scroller.resize();
    }
    
    // Update map dimensions
    const container = d3.select("#map-container");
    const containerNode = container.node();
    if (containerNode && svg) {
      width = containerNode.getBoundingClientRect().width;
      svg.attr("width", width);
      
      // Update projection
      projection.translate([width / 2, height / 2]);
      
      // Redraw paths
      provincePaths.attr("d", path);
      clinicCircles
        .attr("cx", d => projection([+d.lon, +d.lat])[0])
        .attr("cy", d => projection([+d.lon, +d.lat])[1]);
    }
  }

    onDestroy(() => {
    if (scroller) {
      window.removeEventListener("resize", handleResize);
    }
  });

async function saveCard(card: { src: string; name: string; filename: string; key: string }) {
  const img = new Image()
  img.crossOrigin = 'anonymous'

  img.onload = function () {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    const width = 1080
    const height = 1350
    canvas.width = width
    canvas.height = height

    ctx.fillStyle = '#e9d8fd'
    ctx.fillRect(0, 0, width, height)

    const scale = Math.min(width / img.width, height / img.height)
    const newWidth = img.width * scale
    const newHeight = img.height * scale
    const x = (width - newWidth) / 2
    const y = (height - newHeight) / 2
    ctx.drawImage(img, x, y, newWidth, newHeight)

    canvas.toBlob((blob) => {
      if (!blob) return

      track('image_save', {
        key: card.key,
        name: card.name,
        filename: card.filename,
      })

      // then download
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${card.filename}.png`
      link.click()
      URL.revokeObjectURL(url)

    }, 'image/png')
  }

  img.onerror = () => {
    track('image_save_error', { key: card.key })
  }

  img.src = card.src
}

</script>

<svelte:head>
  <script src="https://unpkg.com/scrollama"></script>
</svelte:head>

<div id="scrolly">
  <!-- Sticky graphic container -->
  <div class="scroll-graphic">
    <div id="map-container" style="opacity: 0; pointer-events: none;"></div>
    <!-- Tooltip overlay -->
    {#if tooltip.visible}
      <div
        class="tooltip"
        style="left: {tooltip.x}px; top: {tooltip.y}px; transform: translateX(-50%);"
        role="tooltip"
      >
        {tooltip.content}
      </div>
    {/if}
  </div>

  <!-- Scroll text steps -->
  <div class="scroll-text">
    <!-- Step 0: Card Introduction -->
    <div class="step">
      <div class="step-content">
        <h2>ดวงดาวกำลังเผยให้เห็นบางสิ่ง</h2>
        <p style="text-align: center;">ไพ่ของคุณคือ {cardThemes[cardKey]?.intro || 'ไม่มีข้อมูลไพ่'}</p>
        <p style="text-align: center;">การเดินทางที่คุณไม่เคยนึกถึงมาก่อน กำลังจะเริ่มต้นขึ้น</p>
      </div>
      
      <div class="scroll-hint">
      <div class="scroll-icon"></div>
      <p class="scroll-icon-text">เลื่อนลง <br>อ่านต่อ</p>
    </div>
    </div>
    


    <!-- Step 1: Intro -->
    <div class="step">
      <div class="step-content">
        <h2>จากไพ่ถึงคุณ</h2>
        <p>ไม่ว่าคุณอยู่ในช่วงเวลาแบบไหน คุณเรียกตัวเองว่าผู้ผ่านประสบการณ์ทำแท้ง หรือกำลังอยู่ในช่วงตัดสินใจที่สำคัญ คุณจะเป็นผู้ท้องไม่พร้อมหรือได้รับฟังเรื่องของคนใกล้ชิดไหลเวียนอยู่รอบตัวคุณ</p>
        <p>ทุกคำทำนายจากไพ่จะไม่ตัดสินคุณ ไม่มีใครต้องรู้สึกผิดจากสถานการณ์ที่เจออยู่</p>
        <p><span style="background: var(--color-highlight); color: var(--color-dark);">
          ไพ่ทำหน้าที่เพียงยืนยัน ส่งเสริมอำนาจ และเคารพการตัดสินใจ เพราะทุกการตัดสินใจคือความกล้าหาญและความภาคภูมิใจ</span>
        </p>
      </div>
    </div>

    <!-- Step 2: Major Change -->
    <div class="step">
      <div class="step-content">
        <h2>จุดเปลี่ยนสำคัญ</h2>
        <p> 
          ปี 2564 แรงประทะระหว่างกฎหมายอาญาเดิมที่ให้การทำแท้งมีความผิดกับพลังการเปลี่ยนแปลงใหม่ 
        </p>
        <p>
          <span style="background: var(--color-highlight); color: var(--color-dark);">ในที่สุดการทำแท้งถูกกฎหมายแล้ว</span>
          มาตรา 305 <strong>ยกเว้นความผิด</strong>บางส่วนที่เคยกำหนดไว้ในกฎหมายอาญา
          ผู้หญิงและผู้ท้องไม่พร้อมสามารถทำแท้งภายใต้เงื่อนไข*
        </p>
        <div style="padding-left: 1.5rem; color:" class="question-highlight">
          <li>อายุครรภ์ไม่เกิน 12 สัปดาห์</li>
          <li>อายุครรภ์ 12-20 สัปดาห์ ได้รับคำปรึกษาทางเลือก</li>
          <li>มีความเสียงอันตรายทางกาย/จิตใจ ถูกการทำความผิดเกี่ยวกับเพศ มีความเสี่ยง/เหตุผลทางการแพทย์</li>
        </div>
      </div>
    </div>

    <!-- Step 3: Bubble Patients -->
    <div class="step">
      <div class="step-content">
        <h2>คุณไม่ได้เผชิญอยู่ลำพัง</h2>
        {#if abortionCount === "ไม่พบข้อมูล"}
          <!-- กรณีจังหวัดไม่พบข้อมูล -->
          <p>
            ปีที่ผ่านมา {province} <span class="stat-number">ไม่พบข้อมูล</span> แต่มีเพื่อนที่ผ่านประสบการณ์ทำแท้ง อย่างน้อย 
            <span class="stat-number">{(totalAbortionCount?? 0).toLocaleString()} คน</span> ทั่วประเทศ
            ที่เข้าถึงสิทธิสุขภาพจากรัฐและอาจมีมากกว่านี้ เพียงแต่พวกเขายังคงเข้าไม่ถึงสิทธิสุขภาพสปสช. (สิทธิบัตรทอง/ประกันสังคม/ข้าราชการ)
          </p>
        {:else}
          <!-- กรณีจังหวัดมีข้อมูล -->
          <p>
            ปีที่ผ่านมา {province} มีเพื่อนที่ผ่านประสบการณ์ทำแท้ง อย่างน้อย <span class="stat-number">{(abortionCount?? 0).toLocaleString()} คน</span>
            จาก <span class="stat-number">{(totalAbortionCount?? 0).toLocaleString()} คน</span> ทั่วประเทศ
            ที่เข้าถึงสิทธิสุขภาพจากรัฐและอาจมีมากกว่านี้ เพียงแต่พวกเขายังคงเข้าไม่ถึงสิทธิสุขภาพสปสช. (สิทธิบัตรทอง/ประกันสังคม/ข้าราชการ)
          </p>
        {/if}
        <p class="tip-hint">ลองคลิกที่จังหวัดบนแผนที่</p>  
      </div>
    </div>    

    <!-- Step 4: Thailand Clinics -->
    <div class="step">
      <div class="step-content">
        <h2>ดวงความรักหนาแน่นในพื้นที่ที่มีหน่วยบริการทำแท้งปลอดภัย</h2>
        <p>หน่วยบริการทำแท้งปลอดภัยอย่างน้อย
        <span class="stat-number">{(totalClinicCount ?? 0).toLocaleString()} แห่ง</span>
        กระจายอยู่ทั่วประเทศ ซึ่งสามารถใช้สิทธิบัตรทอง/ประกันสังคม/ข้าราชการ</p>
        <p class="tip-hint">ลองคลิกที่หน่วยบริการทำแท้งปลอดภัยบนแผนที่</p>  
      </div>
    </div>

    <!-- Step 5: User's Province -->
    <div class="step">
      <div class="step-content">
        <h2>{province}</h2>
        {#if clinicCount === 0}
        <!-- กรณีจังหวัดไม่พบข้อมูล -->
        <p>จังหวัดของคุณไม่พบข้อมูลหน่วยบริการทำแท้งปลอดภัย</p>
        <p class="description">โรงพยาบาล/คลินิกที่ให้บริการอาจไม่เข้าร่วมสิทธิสปสช. ติดต่อ 1669 เพื่อรับปรึกษา</p>
        <p class="question-highlight">โรงพยาบาล/คลินิกที่คุณใช้บริการ มีบริการทำแท้งปลอดภัยไหม?</p>
        {:else}
        <!-- กรณีจังหวัดมีข้อมูล -->
        <p>จังหวัดของคุณมีหน่วยบริการทำแท้งปลอดภัยอย่างน้อย <span class="stat-number">{clinicCount} แห่ง</span></p>
        <p class="tip-hint">ลองคลิกที่หน่วยบริการทำแท้งปลอดภัยบนแผนที่</p>  
        <p class="question-highlight">โรงพยาบาล/คลินิกที่คุณใช้บริการ มีบริการทำแท้งปลอดภัยไหม?</p>
        {/if}
      </div>
    </div>

    <!-- Step 6: Access Province -->
    <div class="step">
      <div class="step-content">
        <h2>ดวงการเดินทางช่วงนี้</h2>
        <p>การเดินทางถึงหน่วยบริการทำแท้งที่ใช้สิทธิสุขภาพได้ เพื่อเข้ารับบริการโดยวิธีเครื่องดูดสุญญากาศ (MVA) หรือการทำแท้งด้วยยา
          <span style="background: var(--color-highlight); color: var(--color-dark);">  
          อยู่ห่างไกลออกไปไม่เท่ากันแต่ละพื้นที่
          </span>
        </p>
        <p class="description">* ใช้วิธีคำนวณระยะเดินทางด้วยรถยนต์จากศูนย์กลางของพื้นที่เขต/อำเภอไปถึงหน่วยบริการที่ใกล้ที่สุด ด้วย Open Source Routing Machine (OSRM)</p>
      </div>
    </div>

    <!-- Step 7: Access Overview -->
    <div class="step">
      <div class="step-content">
        <h2>ดวงดาวเคลื่อนที่ช้าเร็วไม่เท่ากัน</h2>
        <p>ระยะทางและเวลาใช้ในการเข้าถึงหน่วยบริการทำแท้งปลอดภัย
          ไม่ใช่ความผิดของคุณ แต่เป็นเพราะอำนาจดวงดาวที่บิดเบี้ยว</p>
        <p class="description">* ถ้าอายุครรภ์มากกว่า 12 สัปดาห์ อาจต้องเดินทางไกลขึ้นอีก</p>
        <p class="question-highlight">ดวงสุขภาพสิทธิเป็นเรื่องโชคดีในบางพื้นที่หรือใครกำหนด?</p>
      </div>
    </div>

    <!-- Step 8: ดวงการเงิน ดวงการงาน - ค่าใช้จ่าย  -->
    <div class="step">
      <div class="step-content">
        <h2>ดวงการเงิน ดวงการงาน</h2>
        <p>หน่วยบริการอยู่ห่างจากคุณเท่าไหร่ คุณมีเกณฑ์จะเสียค่าเดินทาง ค่าเสียเวลา ค่าที่พัก หรือค่าใช้จ่ายอื่นๆ เพิ่มมากขึ้นกว่าคนอื่น ดวงการงานอาจมีสะดุดชั่วคราว</p>
      </div>
    </div>

    <!-- Step 9: Telemed  -->
    <div class="step">
      <div class="step-content">
        <h2>บริการสาธารณสุขระบบทางไกล</h2>
        <p>กรณีโรงพยาบาลใกล้บ้านไม่รับบริการ คุณต้องไปอัลตร้าซาวด์ที่หน่วยบริการใกล้บ้าน รับยาและคำแนะนำออนไลน์จากหน่วยบริการที่ทำแท้งด้วยยา
          เพื่อลดภาระและเหตุจำเป็นต่างๆ
        </p>
      </div>
    </div>

    <!-- Step 10: ดวงความเสี่ยง - จังหวัดที่ไม่มีสถานบริการ  -->
    <div class="step">
      <div class="step-content">
        <h2>ดวงความเสี่ยงจากหน่วยบริการมีไม่ครบทุกจังหวัด</h2>
        <p class="stat-number"><span class="stat-number">{nonAccessProvinceCount} จังหวัด</span></p>
        <p>ไม่มีประวัติเบิกงบสปสช.บริการทำแท้งปลอดภัยเมื่อปี 2568 ที่ผ่านมา และอาจไม่มีหน่วยบริการทำแท้งปลอดภัย</p>
        <p class="description">ผู้หญิงและผู้ท้องไม่พร้อมในจังหวัดเหล่านี้ต้องเดินทางไปจังหวัดใกล้เคียงหรือใช้บริการสาธารณสุขระบบทางไกล</p>
      </div>
    </div>

    <!-- Step 11: ดวงความเสี่ยง - จังหวัดที่ไม่มีหน่วยบริการ  -->
    <div class="step">
      <div class="step-content">
        <h2>ดวงความเสี่ยงจากความไม่แน่นอน</h2>
        <p>จังหวัดน่าน เพชรบูรณ์ พิจิตร อ่างทอง อุบลราชธานี และพังงา หยุดเบิกยายุติการตั้งครรภ์ทั้งจังหวัด</p>
        <p class="description">ข้อมูลจากสำนักอนามัยเจริญพันธุ์ กรมอนามัย วันที่ 5 มีนาคม 2569</p>
      </div>
    </div>

    <!-- Step 12: ดวงความเสี่ยง - อคติและการตีตรา  -->
    <div class="step">
      <div class="step-content">
        <h2>ดวงความเสี่ยงจากอคติและการตีตราให้รู้สึกผิด</h2>
        <p>อคติและความไม่รู้กฎหมายของบุคลากรทางการแพทย์อาจเป็นปัจจัยเสี่ยงที่ทำให้การเข้าถึงและรับบริการทำแท้งปลอดภัยเกิดขึ้นได้ยาก
          หรือเกิดขึ้นได้ แต่ตั้งเงื่อนไขที่ไม่จำเป็นและทิ้งร่องรอยความรู้สึกผิดไปยังผู้รับบริการ</p>
      </div>
    </div>

    <!-- Step 13: สิ่งดวงดาวกำลังสื่อสาร ไม่ใช่ความผิดของคุณ  -->
    <div class="step">
      <div class="step-content">
        <h2>สิ่งที่ดวงดาวกำลังสื่อสาร ไม่ใช่ความผิดของคุณ</h2>
        <p>ยิ่งการเข้าถึงการทำแท้งปลอดภัยยากเท่าไหร่ โรงพยาบาลและคลินิกไม่ประกาศว่ามีบริการทำแท้งอย่างเปิดเผย
          และสิทธิสุขภาพไม่สามารถใช้ได้อย่างเต็มที่ 
          <span style="background: var(--color-highlight); color: var(--color-dark);">
            สร้างความเสี่ยงให้ผู้หญิงและผู้ท้องไม่พร้อม เผชิญกับความลำบากในการเข้ารับบริการและแบกรับภาระต้นทุนเวลา ร่างกาย จิตใจ เสี่ยงเจอยาเถื่อนส่งต่อ คลินิกเถื่อนหลอกลวง
          </span>
        </p>
      </div>
    </div>

    <!-- Step 14: Reframe  -->
    <div class="step">
      <div class="step-content">
        <h2>การทำแท้งปลอดภัย</h2>
        <h2 style="color:var(--color-highlight)">คือสุขภาพที่เข้าถึงได้</h2>
        <p>ไม่ว่าพวกเราจะเกิดหรืออาศัยอยู่ที่ไหนบนผืนแผ่นดินไทย</p>
        <p>ฐานะการเงินจะเป็นยังไง ทำอาชีพอะไร หรืออยู่ช่วงวัยไหน</p>
        <p>
          <span style="background: var(--color-highlight); color: var(--color-dark);">
          ผู้หญิงและผู้ท้องไม่พร้อม ต้องเข้าถึงบริการทำแท้งปลอดภัยด้วยสิทธิสุขภาพที่ตนเองมีอยู่ โดยไม่มีการเลือกปฏิบัติ
          </span>
          ไม่ว่าเหตุผลการตัดสินใจทำแท้งคืออะไร แต่สิ่งสำคัญคือสิทธิและสวัสดิการขั้นพื้นฐาน
        </p>
      </div>
    </div>

    <!-- Step 15: Reframe  -->
    <div class="step">
      <div class="step-content">
        <h2>การทำแท้งปลอดภัย</h2>
        <h2 style="color:var(--color-highlight)">คือทางเลือกและการตัดสินใจ</h2>
        <p>ผู้หญิงและผู้ท้องไม่พร้อมสามารถกำหนดสิ่งที่จะเกิดขึ้นกับร่างกายของตัวเองและความสัมพันธ์ในครอบครัวได้</p>
      </div>
    </div>

    <!-- Step 16 Call to Action -->
    <div class="step" style="max-width: 100%; padding: 0;">
      <div class="step-content">
        <h2>ทำความเข้าใจเส้นทางของคุณ</h2>
        <p class = "affirmation">{cardThemes[cardKey]?.affirmation || 'ไม่มีข้อมูลไพ่'}</p>
        <p class="reflection" style="color:var(--color-highlight)">{cardThemes[cardKey]?.reflect || 'ไม่มีข้อมูลไพ่'}</p>
      <!-- Card Section-Start -->
<div class="card-selection-container">
  <div class="card-selection-content">
    <!-- Header -->
    <div class="header">
      <h1 class="title">เลือกไพ่ใบที่คุณอยากให้เปลี่ยนมากที่สุด</h1>
      <p class="subtitle" style="color:var(--color-dark); line-height: 1.2;">ไพ่ใบที่คุณเลือกคือพลังที่ช่วยให้</p>
      <p class="subtitle" style="color:var(--color-dark); line-height: 1.2; padding-bottom: 1rem;">การทำแท้งปลอดภัยและเข้าถึงได้ง่าย</p>
      <p class="subtitle" style="color:var(--color-dark); line-height: 1.2;">คลิกที่รูปเพื่อบันทึกและแชร์ต่อ ส่งต่อความหวัง</p>
      <p class="subtitle" style="color:var(--color-dark); line-height: 1.2;">ช่วยเสริมดวงให้คำทำนายเกิดขึ้นจริง</p>
    </div>
  
    <!-- Card selection-->
        <!-- Card display area -->
    <div class="cards-area grid-view">
      {#each cards as card (card.key)}
      <button
      class="card-item"
      on:click={() => saveCard(card)}
      >
          <div class="card-inner">
            <div class="card-face">
              <img 
                src={card.src} 
                alt={card.name}
                class="card-image"
                loading="lazy"
              />
            </div>
            <div class="card-label">{card.name}</div>
          </div>
        </button>
      {/each}
    </div>
    <!-- End Card selection-->
  </div>
</div>
      <!-- Card Section-End -->
      </div>
    </div>
  </div>
</div>

<style>
  #scrolly {
    position: relative;
    padding: 0;
    width: 100%;
  }

  .scroll-graphic {
    position: sticky;
    top: 0;
    width: 100%;
    height: 100vh;
    background-color: var(--color-dark);
    overflow: hidden;
  }

  #map-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-dark); /* Dark background for contrast */
  }

  .scroll-text {
    position: relative;
    pointer-events: none;
  }

  /* Scroll hint */
  .scroll-hint {
    margin-top: 60px;
    margin-left: 250px;
    animation: fadeIn 0.6s ease-out 1s backwards;
  }

  .scroll-icon-text {
    color: var(--color-accent);
  }

  .scroll-icon {
    display: inline-block;
    width: 30px;
    height: 50px;
    border: 3px solid var(--color-light);
    border-radius: 20px;
    position: relative;
    margin: 0 auto 10px;
  }

  .scroll-icon::before {
    content: "";
    position: absolute;
    top: 10px;
    left: 50%;
    width: 6px;
    height: 6px;
    background: var(--color-accent);
    border-radius: 50%;
    transform: translateX(-50%);
    animation: scroll 2s infinite;
  }

  @keyframes scroll {
    0%, 20% {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    100% {
      transform: translateX(-50%) translateY(20px);
      opacity: 0;
    }
  }

  .step {
    margin: 0 auto 90vh auto;
    padding: 30px;
    max-width: 500px;
    /*background: var(--color-accent);*/
    background: #1a202c;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 8px;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
    pointer-events: auto;
  }

  .step:first-child {
    margin-top: -95vh;
  }

  .step:last-child {
    margin-bottom: 10vh;
  }

  .step-content h2 {
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--color-accent);
    text-align: center;
    margin-bottom: 20px;
    line-height: 1.3;
  }

  .step-content p {
    font-size: 1rem;
    line-height: 1.7;
    color: var(--color-light);
    margin-bottom: 15px;
  }

  .card-image {
    max-width: 200px;
    height: auto;
    margin: 20px auto;
    display: block;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .affirmation {
    padding-left: 30px; 
    padding-right: 30px; 
    text-align: center;
    font-weight: 500;
    
  }

  .reflection {
    padding-left: 30px; 
    padding-right: 30px; 
    text-align: center; 
    white-space: pre-wrap;
    font-style: italic;
    margin-top: 30px;
  }

  .stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-highlight);
    text-align: center;
    margin: 0px 0;
  }

  .description {
    font-size: 0.9rem;
    color: var(--color-gray);
    font-style: italic;
  }

  .question-highlight{
  font-style: italic;
  font-size: 0.875rem;
  color: var(--color-accent);
  background-color: color-mix(in srgb, var(--color-accent) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 30%, transparent);
  border-radius: 10px;
  padding: 14px 18px;
  margin-bottom: 15px;
  line-height: 1.7;
  }

  p.question-highlight {
  font-style: italic;
  font-size: 0.875rem;
  color: var(--color-accent);
  background-color: color-mix(in srgb, var(--color-accent) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 30%, transparent);
  border-radius: 10px;
  padding: 14px 18px;
  margin-bottom: 15px;
  line-height: 1.7;
  }

  .step-content p.tip-hint {
  font-size: 0.875rem;
  color: var(--color-light);
  background-color: color-mix(in srgb, var(--color-light) 8%, transparent);
  border: 1px dashed color-mix(in srgb, var(--color-light) 25%, transparent);
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 15px;
  line-height: 1.6;
  opacity: 0.85;
}

    /* Header */
  .header {
    text-align: center;
    /*margin-bottom: 40px;*/
  }

    .title {
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--color-primary);
    margin-bottom: 30px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  }

  .subtitle{
    font-size: 1.1rem;
    color: var(--color-dark);
    margin-bottom: 20px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

    .card-selection-container {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    /*align-items: center;*/
    /*border: 2px solid var(--color-secondary);*/
    border-radius: 25px 25px 0 0;
    margin-top: 3rem;
    padding: 2rem 1rem;
    background: linear-gradient(180deg, var(--color-accent) , var(--color-highlight));
    position: relative;
    overflow-x: hidden;
  }

  .card-selection-content {
    max-width: 1200px;
    width: 100%;
    animation: fadeIn 0.6s ease-out;
  }

    /* Cards area */
  .cards-area {
    margin-bottom: 40px;
    padding: 20px;
    transition: all 0.5s ease;
  }

  /* Grid view */
  .cards-area.grid-view {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  /* Card item */
  .card-item {
    background: var(--color-light);
    border: 3px solid transparent;
    border-radius: 12px;
    padding: 10px;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .card-item:hover {
    transform: translateY(-10px) scale(1.05);
    box-shadow: 0 12px 24px rgba(149, 78, 153, 0.3);
    border-color: var(--color-secondary);
    z-index: 10;
  }

  .card-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .card-face {
    position: relative;
    width: 100%;
    height: 100%;
    /*aspect-ratio: 2/3;*/
    /*border-radius: 8px;*/
    overflow: hidden;
  }

  .card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }

  .card-item:hover .card-image {
    transform: scale(1.1);
  }

  .card-label {
    font-size: clamp(1rem, 2.5vw, 1.25rem);
    font-weight: 400;
    color: var(--color-secondary);
    margin-top: 0.75rem; 
    line-height: 1.6;    
    letter-spacing: 0;
  }

  /* Tooltip */

  .tooltip {
    position: absolute;
    pointer-events: none; 
    background: var(--color-dark, #1a1a2e);
    color: var(--color-light, #fff);
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 0.8rem;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    z-index: 10;
    white-space: pre-line;
    /* smooth appear */
    animation: fadein 0.15s ease;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .step {
      max-width: 90%;
      padding: 20px;
    }

    .step-content h2 {
      font-size: 1.5rem;
    }

    .stat-number {
      font-size: 1.5rem;
    }

    .card-image {
      max-width: 200px;
    }
    
    .title {
      font-size: 1.3rem;
    }
  }
</style>