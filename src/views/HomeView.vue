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
      <h1>📚 StudyDeck</h1>
      <p class="subtitle">Lerne smarter mit digitalen Karteikarten</p>
    </section>

    <!-- Quick Actions -->
    <section class="quick-actions">
      <!-- Neues Deck Button (nur wenn keine Decks vorhanden) -->
      <RouterLink v-if="!hasDecks" to="/decks?create=true" class="action-card create">
        <span class="action-icon">➕</span>
        <div class="action-content">
          <h2>Neues Deck erstellen</h2>
          <p>Starte jetzt mit deinem ersten Deck</p>
        </div>
        <span class="action-arrow">→</span>
      </RouterLink>

      <RouterLink to="/decks" class="action-card primary">
        <span class="action-icon">📖</span>
        <div class="action-content">
          <h2>Meine Decks</h2>
          <p v-if="hasDecks">{{ decksStore.decks.length }} Deck(s) vorhanden</p>
          <p v-else>Alle Decks ansehen</p>
        </div>
        <span class="action-arrow">→</span>
      </RouterLink>

      <RouterLink to="/stats" class="action-card secondary">
        <span class="action-icon">📊</span>
        <div class="action-content">
          <h2>Statistiken</h2>
          <p>Verfolge deinen Fortschritt</p>
        </div>
        <span class="action-arrow">→</span>
      </RouterLink>
    </section>

    <!-- How it works -->
    <section class="how-it-works">
      <h3>So funktioniert's</h3>
      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <p>Deck erstellen</p>
        </div>
        <div class="step-arrow">→</div>
        <div class="step">
          <div class="step-number">2</div>
          <p>Karten hinzufügen</p>
        </div>
        <div class="step-arrow">→</div>
        <div class="step">
          <div class="step-number">3</div>
          <p>Lernen starten</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

/* Hero */
.hero {
  text-align: center;
  padding: 2rem 0 3rem;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.1rem;
  color: #6b7280;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 3rem;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.2s;
}

.action-card.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.action-card.primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.action-card.create {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.action-card.create:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

.action-card.secondary {
  background: white;
  color: #1f2937;
  border: 2px solid #e5e7eb;
}

.action-card.secondary:hover {
  border-color: #667eea;
  background: #f9fafb;
}

.action-icon {
  font-size: 2rem;
}

.action-content {
  flex: 1;
}

.action-content h2 {
  font-size: 1.25rem;
  margin: 0 0 0.25rem 0;
}

.action-content p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.action-arrow {
  font-size: 1.5rem;
  opacity: 0.7;
}

/* How it works */
.how-it-works {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.how-it-works h3 {
  font-size: 1rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1.5rem;
}

.steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.step-number {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.step p {
  margin: 0;
  font-size: 0.9rem;
  color: #374151;
}

.step-arrow {
  color: #d1d5db;
  font-size: 1.25rem;
}

@media (max-width: 640px) {
  .home {
    padding: 1rem;
  }

  .hero h1 {
    font-size: 2rem;
  }

  .steps {
    flex-direction: column;
  }

  .step-arrow {
    transform: rotate(90deg);
  }
}
</style>
