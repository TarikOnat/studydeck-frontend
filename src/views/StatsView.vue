<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useDecksStore } from '@/stores/decks'
import { useCardsStore } from '@/stores/cards'
import { RouterLink } from 'vue-router'

const decksStore = useDecksStore()
const cardsStore = useCardsStore()

onMounted(async () => {
  await decksStore.loadDecks()
  await cardsStore.loadCards()
})

const totalCards = computed(() => cardsStore.cards.length)
const learnedCards = computed(() => cardsStore.cards.filter(c => c.learned).length)
const unlearnedCards = computed(() => cardsStore.cards.filter(c => !c.learned).length)
const overallProgress = computed(() => {
  if (totalCards.value === 0) return 0
  return Math.round((learnedCards.value / totalCards.value) * 100)
})

const deckStats = computed(() => {
  return decksStore.decks.map(deck => {
    const cards = deck.cards || []
    const total = cards.length
    const learned = cards.filter((c: any) => c.learned).length
    const progress = total > 0 ? Math.round((learned / total) * 100) : 0
    return {
      id: deck.id,
      title: deck.title,
      total,
      learned,
      progress
    }
  }).sort((a, b) => b.progress - a.progress)
})
</script>

<template>
  <div class="stats-view">
    <header class="page-header">
      <h1>📊 Statistiken</h1>
      <RouterLink to="/decks" class="btn btn-secondary">
        📚 Zu den Decks
      </RouterLink>
    </header>

    <!-- Loading -->
    <div v-if="decksStore.loading || cardsStore.loading" class="loading">
      <div class="spinner"></div>
      <p>Statistiken werden geladen...</p>
    </div>

    <!-- Stats Content -->
    <div v-else class="stats-content">
      <!-- Overall Stats -->
      <div class="overall-stats">
        <h2>Gesamtübersicht</h2>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📚</div>
            <div class="stat-value">{{ decksStore.decks.length }}</div>
            <div class="stat-label">Decks</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">🃏</div>
            <div class="stat-value">{{ totalCards }}</div>
            <div class="stat-label">Karten gesamt</div>
          </div>

          <div class="stat-card highlight-green">
            <div class="stat-icon">✅</div>
            <div class="stat-value">{{ learnedCards }}</div>
            <div class="stat-label">Gelernt</div>
          </div>

          <div class="stat-card highlight-orange">
            <div class="stat-icon">📝</div>
            <div class="stat-value">{{ unlearnedCards }}</div>
            <div class="stat-label">Noch zu lernen</div>
          </div>
        </div>

        <!-- Overall Progress Ring -->
        <div class="overall-progress">
          <div class="progress-ring-large">
            <svg viewBox="0 0 36 36" class="circular-chart-large">
              <path class="circle-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path class="circle"
                    :stroke-dasharray="`${overallProgress}, 100`"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div class="progress-text">
              <span class="progress-value">{{ overallProgress }}%</span>
              <span class="progress-label">Fortschritt</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Deck Progress -->
      <div class="deck-progress">
        <h2>Fortschritt pro Deck</h2>

        <div v-if="deckStats.length === 0" class="empty-state">
          <p>Noch keine Decks vorhanden.</p>
          <RouterLink to="/decks" class="btn btn-primary">
            ➕ Erstes Deck erstellen
          </RouterLink>
        </div>

        <div v-else class="deck-list">
          <div v-for="deck in deckStats" :key="deck.id" class="deck-progress-item">
            <div class="deck-info">
              <RouterLink :to="`/decks/${deck.id}`" class="deck-title">
                {{ deck.title }}
              </RouterLink>
              <span class="deck-count">{{ deck.learned }} / {{ deck.total }} Karten</span>
            </div>

            <div class="progress-bar-wrapper">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: `${deck.progress}%` }"
                  :class="{
                    'progress-low': deck.progress < 33,
                    'progress-medium': deck.progress >= 33 && deck.progress < 66,
                    'progress-high': deck.progress >= 66
                  }"
                ></div>
              </div>
              <span class="progress-percent">{{ deck.progress }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Motivation Section -->
      <div class="motivation-section">
        <div class="motivation-card" v-if="overallProgress === 100">
          <span class="motivation-icon">🏆</span>
          <h3>Perfekt!</h3>
          <p>Du hast alle Karten gelernt. Großartige Leistung!</p>
        </div>
        <div class="motivation-card" v-else-if="overallProgress >= 75">
          <span class="motivation-icon">🌟</span>
          <h3>Fast geschafft!</h3>
          <p>Nur noch {{ unlearnedCards }} Karten bis zum Ziel!</p>
        </div>
        <div class="motivation-card" v-else-if="overallProgress >= 50">
          <span class="motivation-icon">💪</span>
          <h3>Weiter so!</h3>
          <p>Du hast schon die Hälfte geschafft!</p>
        </div>
        <div class="motivation-card" v-else-if="totalCards > 0">
          <span class="motivation-icon">🚀</span>
          <h3>Los geht's!</h3>
          <p>Starte jetzt und erreiche deine Lernziele!</p>
        </div>
        <div class="motivation-card" v-else>
          <span class="motivation-icon">📚</span>
          <h3>Bereit zum Lernen?</h3>
          <p>Erstelle dein erstes Deck und füge Karten hinzu!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-header h1 {
  font-size: 2rem;
  color: #1f2937;
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;
  color: #6b7280;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Stats Content */
.stats-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Overall Stats */
.overall-stats {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.overall-stats h2 {
  font-size: 1.25rem;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.25rem;
  text-align: center;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
}

.stat-label {
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.highlight-green {
  background: #ecfdf5;
}

.highlight-green .stat-value {
  color: #059669;
}

.highlight-orange {
  background: #fffbeb;
}

.highlight-orange .stat-value {
  color: #d97706;
}

/* Overall Progress Ring */
.overall-progress {
  display: flex;
  justify-content: center;
}

.progress-ring-large {
  width: 180px;
  height: 180px;
  position: relative;
}

.circular-chart-large {
  display: block;
  width: 100%;
  height: 100%;
}

.circular-chart-large .circle-bg {
  fill: none;
  stroke: #e5e7eb;
  stroke-width: 2.5;
}

.circular-chart-large .circle {
  fill: none;
  stroke: url(#gradient);
  stroke-width: 2.5;
  stroke-linecap: round;
  transition: stroke-dasharray 0.5s;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-value {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  color: #667eea;
}

.progress-label {
  display: block;
  font-size: 0.9rem;
  color: #6b7280;
}

/* Deck Progress */
.deck-progress {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.deck-progress h2 {
  font-size: 1.25rem;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.deck-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.deck-progress-item {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 12px;
}

.deck-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.deck-title {
  font-weight: 600;
  color: #1f2937;
  text-decoration: none;
  transition: color 0.2s;
}

.deck-title:hover {
  color: #667eea;
}

.deck-count {
  font-size: 0.85rem;
  color: #6b7280;
}

.progress-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-low {
  background: #f87171;
}

.progress-medium {
  background: #fbbf24;
}

.progress-high {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.progress-percent {
  font-size: 0.9rem;
  font-weight: 600;
  color: #6b7280;
  min-width: 45px;
  text-align: right;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

/* Motivation Section */
.motivation-section {
  display: flex;
  justify-content: center;
}

.motivation-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.motivation-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.motivation-card h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.motivation-card p {
  opacity: 0.9;
  margin: 0;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

@media (max-width: 640px) {
  .stats-view {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    text-align: center;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .deck-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
