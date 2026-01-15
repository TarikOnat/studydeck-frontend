<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { onMounted, computed } from 'vue'
import { useDecksStore } from '@/stores/decks'

const decksStore = useDecksStore()

onMounted(() => {
  decksStore.loadDecks()
})

const hasDecks = computed(() => decksStore.decks.length > 0)
</script>

<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1>StudyDeck</h1>
        <p class="subtitle">Dein persönlicher Lernbegleiter für effektives Lernen mit Karteikarten</p>
      </div>
    </section>

    <!-- Quick Actions -->
    <section class="actions-section">
      <RouterLink to="/decks" class="action-card primary">
        <div class="action-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        </div>
        <div class="action-content">
          <h2>Meine Decks</h2>
          <p v-if="hasDecks">{{ decksStore.decks.length }} Deck(s) zum Lernen bereit</p>
          <p v-else>Starte mit deinem ersten Kartendeck</p>
        </div>
        <div class="action-arrow">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </RouterLink>

      <RouterLink to="/decks?create=true" class="action-card primary">
        <div class="action-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </div>
        <div class="action-content">
          <h2>Neues Deck erstellen</h2>
          <p>Erstelle ein neues Kartendeck</p>
        </div>
        <div class="action-arrow">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </RouterLink>
    </section>

    <!-- How it works -->
    <section class="how-section">
      <h3>So funktioniert StudyDeck</h3>
      <div class="steps-container">
        <div class="step">
          <div class="step-circle">
            <span>1</span>
          </div>
          <h4>Deck erstellen</h4>
          <p>Lege ein neues Deck für dein Thema an</p>
        </div>
        <div class="step-line"></div>
        <div class="step">
          <div class="step-circle">
            <span>2</span>
          </div>
          <h4>Karten hinzufügen</h4>
          <p>Füge Fragen und Antworten hinzu</p>
        </div>
        <div class="step-line"></div>
        <div class="step">
          <div class="step-circle">
            <span>3</span>
          </div>
          <h4>Effektiv lernen</h4>
          <p>Nutze den Lernmodus zum Üben</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  min-height: calc(100vh - 120px);
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

/* Hero */
.hero {
  text-align: center;
  padding: 3rem 1rem;
  margin-bottom: 2rem;
}

.hero h1 {
  font-size: 2.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, #1e3a5f 0%, #3b82f6 50%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 1.1rem;
  color: #64748b;
  max-width: 400px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Actions Section */
.actions-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.action-card.primary {
  background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 10px 40px rgba(37, 99, 235, 0.25);
}

.action-card.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 50px rgba(37, 99, 235, 0.35);
}

.action-card.primary .action-icon {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.action-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-content {
  flex: 1;
}

.action-content h2 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.action-content p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.action-arrow {
  opacity: 0.6;
  transition: transform 0.2s, opacity 0.2s;
}

.action-card:hover .action-arrow {
  transform: translateX(4px);
  opacity: 1;
}

/* How Section */
.how-section {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.how-section h3 {
  text-align: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 2rem;
}

.steps-container {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 1rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
  max-width: 180px;
}

.step-circle {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.step-circle span {
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
}

.step h4 {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.step p {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.step-line {
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, #cbd5e1 0%, #e2e8f0 100%);
  margin-top: 24px;
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .home {
    padding: 1rem;
  }

  .hero h1 {
    font-size: 2rem;
  }

  .steps-container {
    flex-direction: column;
    gap: 1.5rem;
  }

  .step-line {
    width: 2px;
    height: 24px;
    margin-top: 0;
  }

  .step {
    max-width: none;
  }
}
</style>
