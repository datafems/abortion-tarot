<script>
  import { createEventDispatcher } from 'svelte';
  import logo from '$lib/assets/logo.svg';

  const dispatch = createEventDispatcher();
  
  // Props
  export let userData = {
    province: '',
    cardKey: ''
  };
  
    // Handle form submission
  function handleNext() {
    dispatch('next', { userData });
  }
</script>
<div style="display: flex; justify-content: center;">
  <img 
    src={logo}
    alt="datafems-logo"
    class="logo"
    loading="lazy"
  />
</div>

<div class="intro-container">
  <div class="intro-content">
    <!-- Main heading -->
    <div class="heading-group">
      <h1 class="main-title">ดูดวงสุขภาพสิทธิของคุณ</h1>
      <h2 class="subtitle">ทำแท้งปลอดภัยตอนนี้เป็นยังไงบ้าง</h2>
      <h3 class="tagline">ทางเลือกร่างกายของฉัน</h3>
      <h3 class="tagline">ฉันหรือใครกำหนดอนาคต?</h3>
    </div>
  
    <h4 style="color: var(--color-dark);">By Purinat Payanon</h4>

    <!-- Decorative divider -->
    <div class="divider"></div>

    <!-- Next button -->
    <div class="button-group">
      <button 
        class="next-button"
        on:click={handleNext}
      >
        เริ่มต้น
      </button>
    </div>
    
  </div>
</div>


<style>
  .logo {
		max-width: 10em;
		margin: 0 auto;
		padding: 32px 0;
  }

  .intro-container {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    padding: 2rem 1rem;
    background: var(--color-accent);
    background: linear-gradient(180deg, var(--color-accent) , var(--color-light));
    position: relative;
    overflow: hidden;
  }
 
  .intro-content {
    font-family: "Niramit", sans-serif;
    max-width: 500px;
    width: 100%;
    text-align: center;
    z-index: 1;
    animation: fadeInUp 0.8s ease-out;
  }
 
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
 
  /* Headings */
  .heading-group {
    margin-bottom: 2.5rem;
  }
 
  .main-title {
    font-size: clamp(2rem, 5vw, 2.8rem);
    font-weight: 700;
    color: var(--color-red);
    margin-bottom: 1rem;    
    line-height: 1.2;       
    letter-spacing: -0.02em; 
    text-decoration: underline;
    text-decoration-thickness: 5px;
    text-decoration-color: var(--color-highlight);
    text-underline-offset: 0.3em;
  }
 
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
 
  .subtitle {
    font-size: clamp(1.25rem, 3.5vw, 1.75rem);
    font-weight: 500;
    color: var(--color-dark);
    margin-bottom: 1rem; 
    line-height: 1.35;  
    letter-spacing: -0.01em;
  }
 
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
 
  .tagline {
    font-size: clamp(1rem, 2.5vw, 1.25rem);
    font-weight: 400;
    color: var(--color-secondary);
    margin-top: 0.75rem; 
    line-height: 1.6;    
    letter-spacing: 0;
    /*animation: fadeIn 0.6s ease-out 0.2s backwards;*/
  }
 
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
 
  /* Divider */
  .divider {
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, var(--color-secondary), var(--color-primary));
    margin: 2rem auto;
    border-radius: 2px;
  }
 
  /* Button */
  .button-group {
    margin-bottom: 2rem; /* 32px */
  }
 
  .next-button {
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

  .next-button:hover {
    background: var(--color-secondary);
    color: var(--color-light);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(97, 45, 98, 0.4);
  }
 
 
  @keyframes float {
    0%, 100% {
      transform: translateY(0) rotate(0deg);
    }
    50% {
      transform: translateY(-20px) rotate(5deg);
    }
  }
 
  
  /* Responsive */
  @media (max-width: 768px) {
    .intro-container {
      padding: 1.5rem 1.25rem; 
    }
 
    .main-title {
      font-size: 1.75rem; 
    }
 
    .subtitle {
      font-size: 1.2rem;
    }
 
    .tagline {
      font-size: 1rem;    
    }
 
    .next-button {
      font-size: 1rem;
      padding: 0.875rem 1.75rem;
    }
  }
 
  @media (max-width: 480px) {
    .main-title {
      font-size: 1.75rem;  /* hold at 28px on phones — clamp handles the rest */
    }
 
    .subtitle {
      font-size: 1.2rem;
    }
 
    .tagline {
      font-size: 1rem;
    }
 
    .next-button {
      width: 100%;
      max-width: 220px;
    }
  }

</style>