<script>
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  // Props
  export let userData = {
    province: '',
    cardKey: ''
  };

  // Thai provinces list
  const provinces = [
    'กระบี่','กรุงเทพมหานคร','กาญจนบุรี','กาฬสินธุ์','กำแพงเพชร','ขอนแก่น','จันทบุรี',
    'ฉะเชิงเทรา','ชลบุรี','ชัยนาท','ชัยภูมิ','ชุมพร','ตรัง','ตราด',
    'ตาก','นครนายก','นครปฐม','นครพนม','นครราชสีมา','นครศรีธรรมราช','นครสวรรค์',
    'นนทบุรี','นราธิวาส','น่าน','บึงกาฬ','บุรีรัมย์','ปทุมธานี','ประจวบคีรีขันธ์',
    'ปราจีนบุรี','ปัตตานี','พระนครศรีอยุธยา','พะเยา','พังงา','พัทลุง','พิจิตร',
    'พิษณุโลก','ภูเก็ต','มหาสารคาม','มุกดาหาร','ยะลา','ยโสธร','ระนอง',
    'ระยอง','ราชบุรี','ร้อยเอ็ด','ลพบุรี','ลำปาง','ลำพูน','ศรีสะเกษ',
    'สกลนคร','สงขลา','สตูล','สมุทรปราการ','สมุทรสงคราม','สมุทรสาคร','สระบุรี',
    'สระแก้ว','สิงห์บุรี','สุพรรณบุรี','สุราษฎร์ธานี','สุรินทร์','สุโขทัย','หนองคาย','หนองบัวลำภู',
    'อำนาจเจริญ','อุดรธานี','อุตรดิตถ์','อุทัยธานี','อุบลราชธานี','อ่างทอง','เชียงราย',
    'เชียงใหม่','เพชรบุรี','เพชรบูรณ์','เลย','แพร่','แม่ฮ่องสอน'];
  
  // Reactive statement to check if province is selected
  $: isValid = userData.province !== "";
  
  // Handle form submission
  function handleNext() {
    if (isValid) {
      dispatch('next', { province: userData.province });
    }
  }
  
  // Handle province change
  function handleProvinceChange(event) {
    userData.province = event.target.value;
    console.log("Selected province:", userData.province);
  }

</script>
    <!-- Instructions -->
<div class="province-selection-container">
  <div class="province-selection-content">
    <!-- Header -->
    <div class="header">
      <div class="title">เลือกจังหวัดที่คุณอาศัยอยู่</div>
        <p class="subtitle">จังหวัดที่คุณอาศัยอยู่จะช่วยให้เราทำนายดวงชะตาได้ตรงกับตำแหน่งที่ดาวเคลื่อนผ่าน</p>
    </div>
  
    <!-- Province selection -->
    <div class="form-group">
      <label for="province-select" class="sr-only">เลือกจังหวัด</label>
      <select 
        id="province-select" 
        bind:value={userData.province}
        on:change={handleProvinceChange}
        class="province-select"
      >
        <option value="" disabled>-- เลือกจังหวัด --</option>
        {#each provinces as prov}
          <option value={prov}>{prov}</option>
        {/each}
      </select>
    </div>

    <!-- Next button -->
    <div class="button-group">
      <button 
        class="next-button"
        disabled={!isValid}
        on:click={handleNext}
      >
        ถัดไป
      </button>
    </div>

    <!-- Scroll indicator -->
    {#if !isValid}
      <div class="scroll-hint">
        <div class="scroll-icon"></div>
        <p class="scroll-text">ข้อมูลจังหวัดที่คุณเลือก ใช้เฉพาะการดูดวงเท่านั้น</p>
      </div>
    {/if}
</div> 
</div>

<style>
  .province-selection-container {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    /*align-items: center;*/
    padding: 5rem 1rem;
    background: var(--color-accent);
    background: linear-gradient(180deg, var(--color-accent) , var(--color-light));
    position: relative;
    overflow-x: hidden;
  }

  .province-selection-content {
    max-width: 1200px;
    width: 100%;
    animation: fadeIn 0.6s ease-out;
  }

  .header {
    text-align: center;
    margin-bottom: 40px;
  }

  .title {
    font-size: clamp(2rem, 5vw, 2.8rem);
    font-weight: 700;
    color: var(--color-primary);
    margin-bottom: 1rem;
    line-height: 1.2; 
    letter-spacing: -0.02em; 
    margin-top: 20px;
    margin-bottom: 20px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  }

  .subtitle {
    /*font-size: 1.1rem;*/
    font-size: clamp(1.25rem, 3.5vw, 1.75rem);
    color: var(--color-dark);
    margin-bottom: 1rem;
    line-height: 1.35; 
    letter-spacing: -0.01em;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .scroll-hint{
    display: grid;
    justify-content: center;
    align-items: center;
  }

  .button-group {
    display: grid;
    margin-bottom: 30px;
    justify-content: center;
    align-items: center;
  }

  .next-button {
    /*
    width: 180px;
    padding: 14px 30px;
    background: var(--color-secondary);
    color: var(--color-light);
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(149, 78, 153, 0.3);
    */
    min-width: 160px;
    padding: 0.875rem 2rem; 
    background: var(--color-light);
    color: var(--color-secondary);
    border: 2px solid var(--color-secondary);
    border-radius: 100px;
    font-weight: 600;
    font-size: 1rem;   
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: all 0.25s ease;
    box-shadow: 0 4px 12px rgba(149, 78, 153, 0.25);
  }

  .next-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }

  .next-button:not(:disabled):hover {
    background: var(--color-secondary);
    color: var(--color-light);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(97, 45, 98, 0.4);
  }

  .next-button:not(:disabled):active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(97, 45, 98, 0.3);
  }

  /* Form */
  .form-group {
    display: grid;
    margin-bottom: 30px;
    justify-content: center;
    align-items: center;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  .province-select {
    width: 100%;
    max-width: 350px;
    padding: 14px 20px;
    font-size: 1rem;
    color: var(--color-dark);
    background-color: var(--color-light);
    border: 2px solid var(--color-secondary);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23954e99' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 15px center;
    padding-right: 45px;
  }

  .province-select:hover {
    border-color: var(--color-primary);
    box-shadow: 0 2px 8px rgba(97, 45, 98, 0.15);
  }

  .province-select:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(97, 45, 98, 0.1);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .title {
      font-size: 1.75rem; 
    }

    .subtitle {
      font-size: 1.2rem;
    }

    .province-select {
      max-width: 100%;
      font-size: 0.95rem;
    }

    .next-button {
      width: 160px;
      font-size: 1rem;
      padding: 12px 25px;
    }
  }

  @media (max-width: 480px) {
    .title {
      font-size: 1.75rem; 
    }
 
    .subtitle {
      font-size: 1.2rem;
    }

    .next-button {
      width: 100%;
      max-width: 200px;
    }
  }
</style>



