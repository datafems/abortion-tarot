<script>
  import { createEventDispatcher } from 'svelte';
  import { cardThemes } from '$lib/data/cardThemes.ts';
  
  const dispatch = createEventDispatcher();
  
  // Props
  export let cardKey = "";
  
  // State
  let viewMode = "grid"; // 'grid' | 'carousel' | 'spread'
  let hoveredCard = null;
  let showDescription = false;
  
  // Get all cards
  const cards = Object.entries(cardThemes).map(([key, card]) => ({
    key,
    ...card
  }));

  console.log("Available cards:", cards);
  
  // Reactive selection
  $: selectedCard = cardKey ? cardThemes[cardKey] : null;
  $: isValid = cardKey !== "";
  
  // Handle card selection
  function selectCard(key) {
    cardKey = key;
    showDescription = true;
    // Scroll to description after selection
    setTimeout(() => {
      document.getElementById('card-description')?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
      });
    }, 100);
  }
  
  // Handle next button
  function handleNext() {
    if (isValid) {
      dispatch('next', { cardKey });
    }
  }
  
  // Random card selection
  function selectRandomCard() {
    const randomIndex = Math.floor(Math.random() * cards.length);
    selectCard(cards[randomIndex].key);
  }
</script>

<div class="card-selection-container">
  <div class="card-selection-content">
    <!-- Header -->
    <div class="header">
      <h1 class="title">เลือกไพ่ของคุณ</h1>
      <p class="subtitle">เลือกไพ่หนึ่งใบในขณะที่คิดถึงการทำแท้งปลอดภัย หรือให้โชคชะตาเลือกให้คุณ</p>
      
      <button class="random-button" on:click={selectRandomCard}>
        สุ่มไพ่
      </button>
    </div>

    <!-- Card display area -->
    <div class="cards-area" class:grid-view={viewMode === 'grid'} class:spread-view={viewMode === 'spread'}>
      {#each cards as card (card.key)}
        <button
          class="card-item"
          class:selected={cardKey === card.key}
          class:hovered={hoveredCard === card.key}
          on:click={() => selectCard(card.key)}
          on:mouseenter={() => hoveredCard = card.key}
          on:mouseleave={() => hoveredCard = null}
        >
          <div class="card-inner">
            <div class="card-face">
              <img 
                src={card.back_src} 
                alt={card.name}
                class="card-image"
                loading="lazy"
              />
              {#if cardKey === card.key}
                <div class="selected-badge">✓</div>
              {/if}
            </div>
            <!--<div class="card-label">{card.name}</div>-->
          </div>
        </button>
      {/each}
    </div>

    <!-- Selected card description -->
    {#if selectedCard && showDescription}
      <div class="card-description" id="card-description">
        <div class="description-header">
          <h3>ไพ่ที่คุณเลือก</h3>
          <button class="close-description" on:click={() => showDescription = false}>×</button>
        </div>
        
        <div class="description-content">
          <div class="description-image">
            <img src={selectedCard.src} alt={selectedCard.name} />
          </div>
          
          <div class="description-text">
            <h4>{selectedCard.name}</h4>
            <p class="meaning"><strong>{selectedCard.meaning}</strong></p>
            <p class="message">{selectedCard.message}</p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Footer / Next button -->
    <div class="footer">
      <button 
        class="next-button"
        disabled={!isValid}
        on:click={handleNext}
      >
        {isValid ? 'เริ่มเรื่องราว' : 'โปรดเลือกไพ่'}
      </button>
    </div>
  </div>
</div>

<style>
  .card-selection-container {
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

  .card-selection-content {
    max-width: 1200px;
    width: 100%;
    animation: fadeIn 0.6s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Header */
  .header {
    text-align: center;
    /*margin-bottom: 40px;*/
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

  .random-button {
    padding: 12px 24px;
    background: var(--color-light);
    color: var(--color-secondary);
    border: 2px solid var(--color-secondary);
    border-radius: 25px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(149, 78, 153, 0.2);
  }

  .random-button:hover {
    background: var(--color-secondary);
    color: var(--color-light);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(149, 78, 153, 0.3);
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
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 20px;
  }

  /* Spread view (tarot spread style) */
  .cards-area.spread-view {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 15px;
  }

  .spread-view .card-item {
    transform: rotate(calc(var(--i) * 3deg - 30deg));
  }

  .spread-view .card-item:nth-child(1) { --i: 0; }
  .spread-view .card-item:nth-child(2) { --i: 1; }
  .spread-view .card-item:nth-child(3) { --i: 2; }
  .spread-view .card-item:nth-child(4) { --i: 3; }
  .spread-view .card-item:nth-child(5) { --i: 4; }
  .spread-view .card-item:nth-child(6) { --i: 5; }
  .spread-view .card-item:nth-child(7) { --i: 6; }
  .spread-view .card-item:nth-child(8) { --i: 7; }
  .spread-view .card-item:nth-child(9) { --i: 8; }
  .spread-view .card-item:nth-child(10) { --i: 9; }
  .spread-view .card-item:nth-child(11) { --i: 10; }
  .spread-view .card-item:nth-child(12) { --i: 11; }
  .spread-view .card-item:nth-child(13) { --i: 12; }
  .spread-view .card-item:nth-child(14) { --i: 13; }
  .spread-view .card-item:nth-child(15) { --i: 14; }
  .spread-view .card-item:nth-child(16) { --i: 15; }
  .spread-view .card-item:nth-child(17) { --i: 16; }
  .spread-view .card-item:nth-child(18) { --i: 17; }
  .spread-view .card-item:nth-child(19) { --i: 18; }
  .spread-view .card-item:nth-child(20) { --i: 19; }
  .spread-view .card-item:nth-child(21) { --i: 20; }
  .spread-view .card-item:nth-child(22) { --i: 21; }

  .spread-view .card-item:hover,
  .spread-view .card-item.selected {
    transform: rotate(0deg) translateY(-20px) scale(1.1);
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

  .card-item.selected {
    border-color: var(--color-red);
    box-shadow: 0 8px 20px rgba(252, 83, 72, 0.4);
    transform: translateY(-5px) scale(1.02);
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
    background: var(--color-light);
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

  .selected-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 30px;
    height: 30px;
    background: var(--color-red);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    font-weight: bold;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes popIn {
    0% {
      transform: scale(0);
    }
    100% {
      transform: scale(1);
    }
  }

  /* Card description */
  .card-description {
    background: var(--color-light);
    border-radius: 12px;
    padding: 30px;
    margin-bottom: 30px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    animation: slideUp 0.5s ease-out;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .description-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid #e5e7eb;
  }

  .description-header h3 {
    font-size: 1.5rem;
    color: var(--color-primary);
    margin: 0;
  }

  .close-description {
    width: 32px;
    height: 32px;
    background: none;
    border: 2px solid var(--color-gray);
    border-radius: 50%;
    font-size: 1.5rem;
    color: var(--color-gray);
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    line-height: 1;
  }

  .close-description:hover {
    background: var(--color-red);
    border-color: var(--color-red);
    color: var(--color-light);
    transform: rotate(90deg);
  }

  .description-content {
    display: flex;
    /*gap: 30px;*/
    align-items: flex-start;
  }

  .description-image {
    flex-shrink: 0;
    width: 200px;
    padding: 16px;
  }

  .description-image img {
    width: 100%;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .description-text {
    flex: 1;
  }

  .description-text h4 {
    font-size: 1.5rem;
    color: var(--color-secondary);
    text-align: center;
    margin-bottom: 15px;
  }

  .description-text p {
    font-size: 1rem;
    line-height: 1.7;
    color: var(--color-dark);
    margin-bottom: 15px;
  }

  .meaning {
    padding: 15px;
    border-radius: 8px;
    border-left: 4px solid var(--color-secondary);
  }

  .message {
    font-style: italic;
    white-space: pre-wrap;
    color: var(--color-gray);
    background-color: var(--color-highlight);
  }

  /* Footer */
  .footer {
    text-align: center;
    padding-top: 20px;
  }

  .next-button {
    min-width: 220px;
    padding: 16px 40px;
    background: var(--color-light);
    color: var(--color-secondary);
    border: 2px solid var(--color-secondary);
    border-radius: 25px;
    font-weight: 700;
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 6px 20px rgba(149, 78, 153, 0.3);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .next-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
    background: var(--color-gray);
  }

  .next-button:not(:disabled):hover {
    background: var(--color-secondary);
    color: var(--color-light);
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(97, 45, 98, 0.4);
  }

  .next-button:not(:disabled):active {
    transform: translateY(-1px);
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .cards-area.grid-view {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 15px;
    }
  }

  @media (max-width: 768px) {
    .title {
      font-size: 1.75rem; 
    }
 
    .subtitle {
      font-size: 1.2rem;
    }

    .cards-area.grid-view {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 12px;
    }

    .description-content {
      flex-direction: column;
      align-items: center;
    }

    .description-image {
      width: 150px;
    }

    .spread-view {
      gap: 10px;
    }

    .spread-view .card-item {
      transform: rotate(0deg) !important;
    }
  }

  @media (max-width: 480px) {
    .card-selection-content {
      padding: 1rem;
    }

    .title {
      font-size: 1.75rem; 
    }
 
    .subtitle {
      font-size: 1.2rem;
    }

    .cards-area {
      padding: 10px;
    }

    .cards-area.grid-view {
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .card-description {
      padding: 20px;
    }

    .next-button {
      width: 100%;
      min-width: auto;
    }
  }
</style>