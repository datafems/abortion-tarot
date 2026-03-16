<script>
  import { onMount } from 'svelte';
  import Intro from '$lib/components/Intro.svelte';
  import ProvinceSelection from '$lib/components/ProvinceSelection.svelte';
  import CardSelection from '$lib/components/CardSelection.svelte';
  import ScrollyMap from '$lib/components/ScrollyMap.svelte';


  let title = "ดูดวงสุขภาพสิทธิของคุณ";
  let description = "สถานการณ์ทำแท้งปลอดภัยตอนนี้เป็นยังไงบ้าง ปี 2569";
  let image = "http://datafems.github.io/abortion-tarot/cover.png";
  let url = "http://datafems.github.io/abortion-tarot/";
  
  // App state
  let currentScreen = 'intro'; // 'intro' | 'province' | 'card' | 'story' | 'methodology'
  let userData = {
    province: '',
    cardKey: ''
  };

  let expanded = false;
  
  // Navigation handlers
  // from Intro to ProvinceSelection
  /**
	 * @param {any} event
	 */
  function handleIntroNext(event) {
    currentScreen = 'province';
    scrollToTop();
  }
  
  /**
	 * @param {{ detail: { province: string; }; }} event
	 */
  function handleProvinceNext(event) {
    userData.province = event.detail.province;
    currentScreen = 'card';
    scrollToTop();
  }

  /**
	 * @param {{ detail: { cardKey: string; }; }} event
	 */
  function handleCardNext(event) {
    userData.cardKey = event.detail.cardKey;
    currentScreen = 'story';
    scrollToTop();
  }
  
  // Methodology screen appears after story
  function handleStoryEnd() {
    currentScreen = 'methodology';
    scrollToTop();
  }
  
  
  // Utility functions
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  function resetApp() {
    currentScreen = 'intro';
    userData = {
      province: '',
      cardKey: ''
    };
    scrollToTop();
  }
  
  // Optional: Save state to localStorage
  function saveState() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tarotMapState', JSON.stringify({
        currentScreen,
        userData
      }));
    }
  }
  
  function loadState() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tarotMapState');
      if (saved) {
        try {
          const state = JSON.parse(saved);
          // Only restore if user has made selections
          if (state.userData.province || state.userData.cardKey) {
            currentScreen = state.currentScreen;
            userData = state.userData;
          }
        } catch (e) {
          console.error('Error loading saved state:', e);
        }
      }
    }
  }
  
  // Auto-save state when it changes
  $: if (userData.province || userData.cardKey) {
    saveState();
  }
  
</script>

<svelte:head>
  <title>ดูดวงสุขภาพสิทธิทำแท้งปลอดภัยของคุณ</title>
  <meta name="description" content="ทำแท้งปลอดภัยตอนนี้เป็นยังไงบ้าง ปี 2569" />

  <!-- Open Graph -->
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={image} />
  <meta property="og:url" content={url} />
  <meta property="og:type" content="article" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta property="twitter:domain" content="datafems.github.io">
  <meta property="twitter:url" content="https://datafems.github.io/abortion-tarot/">
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={image} />

  <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.14.0/css/all.css">
</svelte:head>

<main class="app-container">

  <!-- Screen transitions -->
  <div class="screen-container">
    {#if currentScreen === 'intro'}
      <div class="screen" in:fade={{ duration: 300 }} out:fade={{ duration: 200 }}>
        <Intro 
          bind:userData={userData}
          on:next={handleIntroNext}
        />
      </div>
    {:else if currentScreen === 'province'}
      <div class="screen" in:fade={{ duration: 300, delay: 100 }} out:fade={{ duration: 200 }}>
        <ProvinceSelection 
          bind:userData={userData}
          on:next={handleProvinceNext}
        />
      </div>
    {:else if currentScreen === 'card'}
      <div class="screen" in:fade={{ duration: 300, delay: 100 }} out:fade={{ duration: 200 }}>
        <CardSelection 
          bind:cardKey={userData.cardKey}
          on:next={handleCardNext}
        />
      </div>
    {:else if currentScreen === 'story'}
      <div class="screen" in:fade={{ duration: 300, delay: 100 }} out:fade={{ duration: 200 }}>
        <ScrollyMap 
          province={userData.province}
          cardKey={userData.cardKey}
        />
      </div>
      
    <section class="methodology-container">
      <div class="methodology-content" style="text-align:justify;">
        <h2>กระบวนการทำงาน <button class="toggle-btn" on:click={() => expanded = !expanded}>
          {expanded ? 'ซ่อน' : 'แสดง'}
        </button></h2>


        {#if expanded}
        <p>ระยะเวลา 5 ปีนับจากการแก้ไขเพิ่มเติมประมวลกฎหมายอาญา (ฉบับที่ 26) พ.ศ.2564 ข้อมูลโรงพยาบาล/คลินิกที่เปิดเผยบริการทำแท้งปลอดภัยยังคงไม่เปิดเผยทั้งหมด เนื่องจากเหตุผอคติการตรีตราของผู้ให้บริการและสังคม</p>
        <p>คำถามสำคัญคือหน่วยบริการทำแท้งอยู่ที่ไหนบ้างและแต่ละพื้นที่อยู่ห่างจากหน่วยบริการแค่ไหน</p>
        <p>ผู้เขียนเลือกใช้ข้อมูลเปิดสาธารณะจากสปสช. งบประมาณบริการสร้างเสริมสุขภาพและป้องกันโรค ประจำปีงบ 2568 เป็นจุดตั้งต้น 
          ซึ่งให้รายละเอียดรหัสหน่วยบริการ ชื่อหน่วยบริการ ประเภทบริการย่อย (ยา MVA EVA ) จำนวนผู้ใช้บริการ จำนวนครั้ง และงบประมาณ 
          ซึ่งทำให้สามารถสรุปจำนวนคนทำแท้งรายพื้นที่ และภาพรวมการใช้สิทธิสุขภาพ (บัตรทอง ประกันสังคม ข้าราชการ อปท. และอื่นๆ)</p>
        <p>แต่หน่วยบริการทำแท้งปลอดภัยจากแหล่งที่มาการใช้งบสปสช.มีข้อจำกัดไม่ครอบคลุมหน่วยบริการ อย่างน้อย 
          (1) ให้บริการและเข้าร่วมสิทธิสปสช. แต่ไม่มีผู้ใช้บริการในปีงบที่ผ่านมา (2) ให้บริการ แต่ไม่ได้เข้าร่วมสิทธิสปสช.</p>
        <p>ผู้เขียนจึงอาศัยแหล่งข้อมูลประกอบที่เผยแพร่ได้จากมูลนิธิทำทาง เครือข่าย RSA และข้อมูลหน่วยบริการที่มีศักยภาพบริการยุติการตั้งครรภ์จากสปสช. 
          แล้วพิจารณาข้อมูลที่ตรงกันหลายแหล่งเพื่อยืนยันความถูกต้องและอัพเดทเป็นปัจจุบันให้มากที่สุด</p>
        <p>การคำนวณระยะทางจากจุดศูนย์กลางขอบเขตการปกครองเขต/อำเภอ เดินทางถึงหน่วยบริการที่ใกล้ที่สุด ใช้ API Open Source Routing Machine (OSRM)</p>
        <p>ผู้เขียนและครอบครัวต่างสายพันธุ์มีความใกล้ชิดกับการเคลื่อนไหวสนับสนุนทำแท้งปลอดภัย และมีส่วนร่วมในอาสาสมัคร Tell Your Candidates ของมูลนิธิทำทาง 
          จึงนำข้อเสนอกุญแจ 3 ดอก ปลดล็อกทำแท้งในเลือกตั้ง69 มาเป็นข้อเสนอท้ายงานชิ้นนี้เพื่อให้ข้อมูลครบถ้วนมากยิ่งขึ้น</p>
        <h2>แหล่งข้อมูล</h2>
        <p>1. <a href="https://medata.nhso.go.th/me/public/dashboard/41/321">ผลงานบริการ - PP02003-ผลบริการและการเบิกจ่ายบริการสร้างเสริมสุขภาพ และป้องกันโรค ปีงบประมาณ 2568</a></p>
        <p>2. <a href="https://reghosp.nhso.go.th/hospital_search">โปรแกรมค้นหาข้อมูลสถานพยาบาล</a> ด้วยประเภทข้อมูล "ศักยภาพการบริการ" - H36 : ยุติการตั้งครรภ์ สำนักงานหลักประกันสุขภาพแห่งชาติ เวอร์ชัน 1.4.24 ( 19-06-2568 )</p>
        <p>3. <a href="https://www.ratchakitcha.soc.go.th/DATA/PDF/2564/A/010/T_0001.PDF">พระราชบัญญัติแก้ไขเพิ่มเติมประมวลกฎหมายอาญา (ฉบับที่ 26) พ.ศ.2564</a></p>
        <p>4. <a href="https://www.facebook.com/SafeAbortionThailand/posts/pfbid0ABUfwwuwpsg3nsMho4pBtNtkRAtBEyTCZ4Hmd74xoGuYtz39z7Ckv1VdB55uWFswl?locale=th_TH">มูลนิธิทำทางเสนอกุญแจ 3 ดอก ปลดล็อกการทำแท้งปลอดภัย</a></p>
        <p>5. <a href="https://youtu.be/A4LpFzbEIgc?si=oB-tJ4vFLeRIWSGp">ฉันแค่ทำแท้ง ฉันไม่ได้ทำผิด | พูดมาก Podcast EP.136</a></p>
      {/if}
      </div>
    </section>
    <section class="contact-container">
    <div class="contact-content">
        <h2>Data Fems</h2>
        <address>
            <p>Email: <a href="mailto:datafems@gmail.com">datafems@gmail.com</a></p>
        </address>

        <div class="social-links">
            <a href="https://github.com/datafems" target="_blank" aria-label="Github">
                <i class="fab fa-github"></i>
            </a>
            <a href="https://www.instagram.com/datafems" target="_blank" aria-label="Instagram">
                <i class="fab fa-instagram"></i>
            </a>
        </div>
    </div>
    </section>
    {/if}
  </div>
</main>

<style>

  :global(body) {
    margin: 0;
    padding: 0;
    font-family: "Niramit", sans-serif;
    overflow-x: hidden;
    background-color: var(--color-accent);
  }

  .app-container {
    min-height: 100vh;
    position: relative;
  }

  /* Screen container */
  .screen-container {
    position: relative;
    min-height: 100vh;
  }

  .screen {
    width: 100%;
    min-height: 100vh;
  }

/* methodology Section */
.methodology-container {
    display: flex;
    justify-content: center;
    padding: 0.25rem 1rem;
    background-color: var(--color-accent);
    
}

.methodology-content{
		max-width: 700px;
}

h2 {
  text-align: center;
  font-size: clamp(1.25rem, 3.5vw, 1.75rem);
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 1rem;
  line-height: 1.2; 
  letter-spacing: -0.02em; 
  margin-top: 20px;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-btn {
  padding: 12px 24px;
  background: var(--color-light);
  width: 60px;
  color: var(--color-secondary);
  border: 2px solid var(--color-secondary);
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(149, 78, 153, 0.2);
  padding: 0.25rem 0;
  margin-bottom: 0.5rem;
}

/* Contact Section */
.contact-container {
    display: flex;
    justify-content: center;
    padding: 0.25rem 1rem;
    text-align: center;
    background-color: var(--color-light);
}

.contact-content{
		max-width: 700px;
}

a {
    color: var(--color-dark);
    text-decoration: none;
    background-color: transparent;
    -webkit-text-decoration-skip: objects
}


.fab {
    font-family: "Font Awesome 5 Brands"
}

.fab,.fa {
    font-weight: 400
}

.fa-instagram {
  color: var(--color-primary);
  font-size: 24px;
  padding: 5px;
}

.fa-github {
  color: var(--color-primary);
  font-size: 24px;
  padding: 5px;
}

</style>

<script context="module">
  // Svelte transitions
  import { fade } from 'svelte/transition';
</script>