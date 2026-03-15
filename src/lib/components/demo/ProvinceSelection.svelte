<script>
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  // Props
  export let province = "";
  export let showMap = false; // Option to show mini map view
  
  // Thai provinces grouped by region
  const provincesByRegion = {
    "กรุงเทพและปริมณฑล": [
      "กรุงเทพมหานคร", "นนทบุรี", "ปทุมธานี", "สมุทรปราการ", 
      "สมุทรสาคร", "สมุทรสงคราม", "นครปฐม"
    ],
    "ภาคเหนือ": [
      "เชียงใหม่", "เชียงราย", "ลำปาง", "ลำพูน", "แม่ฮ่องสอน",
      "น่าน", "พะเยา", "แพร่", "อุตรดิตถ์", "กำแพงเพชร",
      "นครสวรรค์", "พิจิตร", "พิษณุโลก", "เพชรบูรณ์", "สุโขทัย",
      "ตาก", "อุทัยธานี"
    ],
    "ภาคตะวันออกเฉียงเหนือ": [
      "นครราชสีมา", "ขอนแก่น", "อุดรธานี", "อุบลราชธานี",
      "กาฬสินธุ์", "ชัยภูมิ", "นครพนม", "บึงกาฬ", "บุรีรัมย์",
      "มหาสารคาม", "มุกดาหาร", "ยโสธร", "ร้อยเอ็ด", "เลย",
      "ศรีสะเกษ", "สกลนคร", "สุรินทร์", "หนองคาย", "หนองบัวลำภู",
      "อำนาจเจริญ"
    ],
    "ภาคกลาง": [
      "กาญจนบุรี", "ชัยนาท", "นครนายก", "ลพบุรี", "พระนครศรีอยุธยา",
      "ราชบุรี", "สระบุรี", "สิงห์บุรี", "สุพรรณบุรี", "อ่างทอง",
      "ประจวบคีรีขันธ์", "เพชรบุรี"
    ],
    "ภาคตะวันออก": [
      "ชลบุรี", "ระยอง", "จันทบุรี", "ตราด", "ฉะเชิงเทรา",
      "ปราจีนบุรี", "สระแก้ว"
    ],
    "ภาคใต้": [
      "นครศรีธรรมราช", "สงขลา", "ภูเก็ต", "สุราษฎร์ธานี",
      "กระบี่", "ชุมพร", "ตรัง", "นราธิวาส", "ปัตตานี", "พังงา",
      "พัทลุง", "ระนอง", "สตูล", "ยะลา", "จะนะ"
    ]
  };
  
  // Flattened list for search
  const allProvinces = Object.values(provincesByRegion).flat().sort();
  
  // State
  let selectedRegion = "";
  let searchQuery = "";
  let viewMode = "region"; // 'region' | 'search' | 'all'
  
  // Reactive filtered provinces
  $: filteredProvinces = searchQuery 
    ? allProvinces.filter(p => p.includes(searchQuery))
    : [];
  
  // Handle province selection
  function selectProvince(prov) {
    province = prov;
  }
  
  // Handle next button
  function handleNext() {
    if (province) {
      dispatch('next', { province });
    }
  }
  
  // Toggle region view
  function toggleRegion(region) {
    selectedRegion = selectedRegion === region ? "" : region;
  }
  
  // Switch view modes
  function setViewMode(mode) {
    viewMode = mode;
    searchQuery = "";
    selectedRegion = "";
  }
</script>

<div class="province-selection-container">
  <div class="province-selection-content">
    <!-- Header -->
    <div class="header">
      <h1 class="title">เลือกจังหวัดของคุณ</h1>
      <p class="subtitle">เพื่อดูข้อมูลคลินิกในพื้นที่ของคุณ</p>
    </div>

    <!-- Selected province display -->
    {#if province}
      <div class="selected-province">
        <div class="selected-label">จังหวัดที่เลือก:</div>
        <div class="selected-name">{province}</div>
        <button class="change-btn" on:click={() => province = ""}>
          เปลี่ยน
        </button>
      </div>
    {/if}

    <!-- View mode tabs -->
    <div class="view-tabs">
      <button 
        class="tab" 
        class:active={viewMode === 'region'}
        on:click={() => setViewMode('region')}
      >
        เลือกตามภูมิภาค
      </button>
      <button 
        class="tab" 
        class:active={viewMode === 'search'}
        on:click={() => setViewMode('search')}
      >
        ค้นหา
      </button>
      <button 
        class="tab" 
        class:active={viewMode === 'all'}
        on:click={() => setViewMode('all')}
      >
        ทั้งหมด
      </button>
    </div>

    <!-- Content area -->
    <div class="content-area">
      
      {#if viewMode === 'region'}
        <!-- Region-based selection -->
        <div class="region-grid">
          {#each Object.entries(provincesByRegion) as [region, provinces]}
            <div class="region-card" class:expanded={selectedRegion === region}>
              <button 
                class="region-header" 
                on:click={() => toggleRegion(region)}
              >
                <span class="region-name">{region}</span>
                <span class="region-count">({provinces.length} จังหวัด)</span>
                <span class="expand-icon" class:rotated={selectedRegion === region}>▼</span>
              </button>
              
              {#if selectedRegion === region}
                <div class="province-list">
                  {#each provinces as prov}
                    <button 
                      class="province-btn"
                      class:selected={province === prov}
                      on:click={() => selectProvince(prov)}
                    >
                      {prov}
                      {#if province === prov}
                        <span class="check-icon">✓</span>
                      {/if}
                    </button>
                  {/each}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      
      {:else if viewMode === 'search'}
        <!-- Search-based selection -->
        <div class="search-container">
          <input 
            type="text" 
            class="search-input"
            placeholder="พิมพ์ชื่อจังหวัด..."
            bind:value={searchQuery}
            autofocus
          />
          
          {#if searchQuery && filteredProvinces.length > 0}
            <div class="search-results">
              {#each filteredProvinces as prov}
                <button 
                  class="province-btn search-result"
                  class:selected={province === prov}
                  on:click={() => selectProvince(prov)}
                >
                  {prov}
                  {#if province === prov}
                    <span class="check-icon">✓</span>
                  {/if}
                </button>
              {/each}
            </div>
          {:else if searchQuery}
            <div class="no-results">ไม่พบจังหวัดที่ค้นหา</div>
          {/if}
        </div>
      
      {:else if viewMode === 'all'}
        <!-- All provinces list -->
        <div class="all-provinces-grid">
          {#each allProvinces as prov}
            <button 
              class="province-card"
              class:selected={province === prov}
              on:click={() => selectProvince(prov)}
            >
              {prov}
              {#if province === prov}
                <span class="check-icon">✓</span>
              {/if}
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Next button -->
    <div class="footer">
      <button 
        class="next-button"
        disabled={!province}
        on:click={handleNext}
      >
        ถัดไป
      </button>
    </div>
  </div>
</div>

<style>
  .province-selection-container {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem 1rem;
    background-color: var(--color-accent);
  }

  .province-selection-content {
    max-width: 700px;
    width: 100%;
    background: white;
    border-radius: 12px;
    padding: 40px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    animation: fadeInScale 0.5s ease-out;
  }

  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Header */
  .header {
    text-align: center;
    margin-bottom: 30px;
  }

  .title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-primary);
    margin-bottom: 10px;
  }

  .subtitle {
    font-size: 1rem;
    color: var(--color-gray);
    margin: 0;
  }

  /* Selected province */
  .selected-province {
    background: var(--color-soft-green);
    border-radius: 8px;
    padding: 15px 20px;
    margin-bottom: 25px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    animation: slideInDown 0.3s ease-out;
  }

  @keyframes slideInDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .selected-label {
    font-size: 0.9rem;
    color: var(--color-gray);
    margin-right: 10px;
  }

  .selected-name {
    flex: 1;
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--color-primary);
  }

  .change-btn {
    padding: 6px 16px;
    background: white;
    color: var(--color-secondary);
    border: 1px solid var(--color-secondary);
    border-radius: 6px;
    font-family: "Mali", cursive;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .change-btn:hover {
    background: var(--color-secondary);
    color: white;
  }

  /* View tabs */
  .view-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 25px;
    border-bottom: 2px solid #e5e7eb;
  }

  .tab {
    flex: 1;
    padding: 12px 20px;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    font-family: "Mali", cursive;
    font-size: 1rem;
    color: var(--color-gray);
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: -2px;
  }

  .tab:hover {
    color: var(--color-secondary);
  }

  .tab.active {
    color: var(--color-primary);
    border-bottom-color: var(--color-primary);
    font-weight: 600;
  }

  /* Content area */
  .content-area {
    max-height: 400px;
    overflow-y: auto;
    margin-bottom: 25px;
    padding: 10px 0;
  }

  .content-area::-webkit-scrollbar {
    width: 8px;
  }

  .content-area::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  .content-area::-webkit-scrollbar-thumb {
    background: var(--color-secondary);
    border-radius: 4px;
  }

  .content-area::-webkit-scrollbar-thumb:hover {
    background: var(--color-primary);
  }

  /* Region grid */
  .region-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .region-card {
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .region-card.expanded {
    border-color: var(--color-secondary);
  }

  .region-header {
    width: 100%;
    padding: 15px 20px;
    background: white;
    border: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: "Mali", cursive;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .region-header:hover {
    background: #f9fafb;
  }

  .region-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-primary);
  }

  .region-count {
    font-size: 0.9rem;
    color: var(--color-gray);
  }

  .expand-icon {
    color: var(--color-secondary);
    transition: transform 0.3s ease;
  }

  .expand-icon.rotated {
    transform: rotate(180deg);
  }

  .province-list {
    padding: 10px;
    background: #f9fafb;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 8px;
    animation: slideDown 0.3s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      max-height: 0;
    }
    to {
      opacity: 1;
      max-height: 500px;
    }
  }

  /* Province buttons */
  .province-btn {
    padding: 10px 15px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    font-family: "Mali", cursive;
    font-size: 0.95rem;
    color: var(--color-dark);
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    text-align: left;
  }

  .province-btn:hover {
    border-color: var(--color-secondary);
    background: #f9fafb;
    transform: translateY(-1px);
  }

  .province-btn.selected {
    background: var(--color-secondary);
    color: white;
    border-color: var(--color-secondary);
    font-weight: 600;
  }

  .check-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.2rem;
  }

  /* Search */
  .search-container {
    padding: 10px 0;
  }

  .search-input {
    width: 100%;
    padding: 14px 20px;
    font-family: "Mali", cursive;
    font-size: 1rem;
    border: 2px solid var(--color-secondary);
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(97, 45, 98, 0.1);
  }

  .search-results {
    margin-top: 15px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
  }

  .search-result {
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .no-results {
    text-align: center;
    padding: 40px 20px;
    color: var(--color-gray);
    font-style: italic;
  }

  /* All provinces grid */
  .all-provinces-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
  }

  .province-card {
    padding: 15px;
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-family: "Mali", cursive;
    font-size: 0.95rem;
    color: var(--color-dark);
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    text-align: center;
  }

  .province-card:hover {
    border-color: var(--color-secondary);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(149, 78, 153, 0.2);
  }

  .province-card.selected {
    background: var(--color-secondary);
    color: white;
    border-color: var(--color-secondary);
    font-weight: 600;
  }

  /* Footer */
  .footer {
    text-align: center;
    padding-top: 20px;
    border-top: 2px solid #e5e7eb;
  }

  .next-button {
    width: 200px;
    padding: 14px 30px;
    background: var(--color-secondary);
    color: var(--color-light);
    border: none;
    border-radius: 8px;
    font-family: "Mali", cursive;
    font-weight: 600;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(149, 78, 153, 0.3);
  }

  .next-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }

  .next-button:not(:disabled):hover {
    background: var(--color-primary);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(97, 45, 98, 0.4);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .province-selection-content {
      padding: 25px;
    }

    .title {
      font-size: 1.6rem;
    }

    .content-area {
      max-height: 350px;
    }

    .province-list,
    .search-results,
    .all-provinces-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }
  }

  @media (max-width: 480px) {
    .province-selection-content {
      padding: 20px;
    }

    .view-tabs {
      flex-direction: column;
      gap: 5px;
    }

    .tab {
      border-bottom: none;
      border-left: 3px solid transparent;
      text-align: left;
      padding: 10px 15px;
    }

    .tab.active {
      border-left-color: var(--color-primary);
      border-bottom-color: transparent;
    }

    .province-list,
    .search-results,
    .all-provinces-grid {
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .next-button {
      width: 100%;
    }
  }
</style>