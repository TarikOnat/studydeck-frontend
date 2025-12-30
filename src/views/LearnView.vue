<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDecksStore } from '@/stores/decks'
import { useCardsStore } from '@/stores/cards'

const route = useRoute()
const router = useRouter()
const decksStore = useDecksStore()
const cardsStore = useCardsStore()

const deckId = computed(() => Number(route.params.id))
const currentIndex = ref(0)
const isFlipped = ref(false)
const hasBeenFlipped = ref(false) // Track if card was flipped at least once
const showResults = ref(false)
const sessionStats = ref({ correct: 0, incorrect: 0 })
const wrongCards = ref<number[]>([]) // Store IDs of wrong cards
const learnMode = ref<'all' | 'unlearned' | 'wrong'>('unlearned') // Current learning mode

// Get cards based on learning mode
const cardsToLearn = computed(() => {
  if (learnMode.value === 'wrong') {
    return cardsStore.cards.filter(c => wrongCards.value.includes(c.id!))
  } else if (learnMode.value === 'unlearned') {
    const unlearned = cardsStore.cards.filter(c => !c.learned)
    return unlearned.length > 0 ? unlearned : cardsStore.cards
  } else {
    return cardsStore.cards
  }
})

const currentCard = computed(() => {
  return cardsToLearn.value[currentIndex.value] || null
})

const progress = computed(() => {
  if (cardsToLearn.value.length === 0) return 0
  return Math.round(((currentIndex.value) / cardsToLearn.value.length) * 100)
})

const isLastCard = computed(() => {
  return currentIndex.value >= cardsToLearn.value.length - 1
})

onMounted(async () => {
  await decksStore.loadDeckById(deckId.value)
  await cardsStore.loadCardsByDeck(deckId.value)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const flipCard = () => {
  isFlipped.value = !isFlipped.value
  if (!hasBeenFlipped.value) {
    hasBeenFlipped.value = true
  }
}

const markAsLearned = async () => {
  if (currentCard.value && currentCard.value.id) {
    // Mark as learned in database if not already
    if (!currentCard.value.learned) {
      await cardsStore.toggleLearned(currentCard.value.id)
    }
    // Remove from wrongCards if in repeat mode
    if (learnMode.value === 'wrong') {
      wrongCards.value = wrongCards.value.filter(id => id !== currentCard.value!.id)
    }
    sessionStats.value.correct++
    nextCard()
  }
}

const markAsNotLearned = () => {
  if (currentCard.value && currentCard.value.id) {
    // Add to wrong cards list for potential repeat
    if (!wrongCards.value.includes(currentCard.value.id)) {
      wrongCards.value.push(currentCard.value.id)
    }
    sessionStats.value.incorrect++
    nextCard()
  }
}

const nextCard = () => {
  isFlipped.value = false
  hasBeenFlipped.value = false

  if (isLastCard.value) {
    showResults.value = true
  } else {
    currentIndex.value++
  }
}

const restartSession = (mode: 'all' | 'wrong') => {
  if (mode === 'wrong' && wrongCards.value.length === 0) {
    // No wrong cards, restart all
    mode = 'all'
  }

  learnMode.value = mode
  currentIndex.value = 0
  isFlipped.value = false
  hasBeenFlipped.value = false
  showResults.value = false

  // Reset stats but keep wrongCards if practicing wrong ones
  if (mode === 'all') {
    sessionStats.value = { correct: 0, incorrect: 0 }
    wrongCards.value = []
  } else {
    // Keep wrong cards, reset stats
    sessionStats.value = { correct: 0, incorrect: 0 }
  }
}

const goBack = () => {
  router.push(`/decks/${deckId.value}`)
}

const goToDecks = () => {
  router.push('/decks')
}

// Keyboard navigation
const handleKeydown = (e: KeyboardEvent) => {
  if (showResults.value) return

  switch (e.code) {
    case 'Space':
      e.preventDefault()
      flipCard()
      break
    case 'ArrowRight':
    case 'KeyD':
      if (hasBeenFlipped.value) markAsLearned()
      break
    case 'ArrowLeft':
    case 'KeyA':
      if (hasBeenFlipped.value) markAsNotLearned()
      break
  }
}
</script>

<template>
  <div class="learn-view">
    <!-- Header -->
    <header class="learn-header">
      <button @click="goBack" class="btn-back">
        ← Zurück zum Deck
      </button>
      <h1>{{ decksStore.currentDeck?.title }}</h1>
      <div class="progress-indicator">
        {{ currentIndex + 1 }} / {{ cardsToLearn.length }}
      </div>
    </header>

    <!-- Learning Mode Badge -->
    <div v-if="learnMode === 'wrong'" class="mode-badge">
      🔄 Wiederholung: Nur nicht gewusste Karten
    </div>

    <!-- Progress Bar -->
    <div class="progress-bar-container">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="cardsStore.loading" class="loading">
      <div class="spinner"></div>
      <p>Karten werden geladen...</p>
    </div>

    <!-- No Cards -->
    <div v-else-if="cardsToLearn.length === 0" class="empty-state">
      <div class="empty-icon">🎉</div>
      <h2>Keine Karten zum Lernen</h2>
      <p>Füge erst Karten zu diesem Deck hinzu!</p>
      <button @click="goBack" class="btn btn-primary">
        📝 Zum Deck
      </button>
    </div>

    <!-- Results Screen -->
    <div v-else-if="showResults" class="results-screen">
      <div class="results-card">
        <div class="results-icon">🎉</div>
        <h2>Geschafft!</h2>
        <p>Du hast alle {{ cardsToLearn.length }} Karten durchgearbeitet.</p>

        <div class="results-stats">
          <div class="stat correct">
            <span class="stat-value">{{ sessionStats.correct }}</span>
            <span class="stat-label">Gewusst ✓</span>
          </div>
          <div class="stat incorrect">
            <span class="stat-value">{{ sessionStats.incorrect }}</span>
            <span class="stat-label">Wiederholen ✗</span>
          </div>
        </div>

        <div class="results-percentage">
          <div class="percentage-ring">
            <svg viewBox="0 0 36 36" class="circular-chart">
              <path class="circle-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path class="circle"
                    :stroke-dasharray="`${cardsToLearn.length > 0 ? (sessionStats.correct / cardsToLearn.length) * 100 : 0}, 100`"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span class="percentage-text">
              {{ cardsToLearn.length > 0 ? Math.round((sessionStats.correct / cardsToLearn.length) * 100) : 0 }}%
            </span>
          </div>
        </div>

        <div class="results-actions">
          <!-- Repeat wrong cards only (if any) -->
          <button
            v-if="wrongCards.length > 0"
            @click="restartSession('wrong')"
            class="btn btn-wrong-repeat"
          >
            🔄 Nur falsche wiederholen ({{ wrongCards.length }})
          </button>

          <!-- Repeat all cards -->
          <button @click="restartSession('all')" class="btn btn-secondary">
            🔁 Alle nochmal üben
          </button>

          <!-- Back to decks -->
          <button @click="goToDecks" class="btn btn-primary">
            📚 Zu den Decks
          </button>
        </div>
      </div>
    </div>

    <!-- Flashcard -->
    <div v-else class="flashcard-container">
      <div
        class="flashcard"
        :class="{ flipped: isFlipped }"
        @click="flipCard"
      >
        <div class="flashcard-inner">
          <div class="flashcard-front">
            <span class="card-label">Frage</span>
            <p class="card-text">{{ currentCard?.question }}</p>
            <span class="flip-hint">Klicken zum Umdrehen</span>
          </div>
          <div class="flashcard-back">
            <span class="card-label">Antwort</span>
            <p class="card-text">{{ currentCard?.answer }}</p>
            <span class="flip-hint">Klicken zum Zurückdrehen</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons (shown after first flip, regardless of current side) -->
      <div class="action-buttons" :class="{ visible: hasBeenFlipped }">
        <button @click.stop="markAsNotLearned" class="btn btn-wrong">
          ✗ Nicht gewusst
        </button>
        <button @click.stop="markAsLearned" class="btn btn-correct">
          ✓ Gewusst!
        </button>
      </div>

      <!-- Keyboard Hints -->
      <div class="keyboard-hints">
        <span><kbd>Leertaste</kbd> Umdrehen</span>
        <span><kbd>←</kbd> Nicht gewusst</span>
        <span><kbd>→</kbd> Gewusst</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.learn-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 1.5rem;
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.learn-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.learn-header h1 {
  font-size: 1.25rem;
  color: #1f2937;
  margin: 0;
}

.btn-back {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #374151;
  transition: background 0.2s;
}

.btn-back:hover {
  background: #e5e7eb;
}

.progress-indicator {
  font-weight: 600;
  color: #667eea;
  background: #f0f0ff;
  padding: 0.5rem 1rem;
  border-radius: 20px;
}

/* Mode Badge */
.mode-badge {
  background: #fef3c7;
  color: #92400e;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Progress Bar */
.progress-bar-container {
  margin-bottom: 2rem;
}

.progress-bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
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

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

/* Flashcard Container */
.flashcard-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}

/* Flashcard */
.flashcard {
  width: 100%;
  max-width: 500px;
  height: 320px;
  perspective: 1000px;
  cursor: pointer;
}

.flashcard-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.flashcard.flipped .flashcard-inner {
  transform: rotateY(180deg);
}

.flashcard-front,
.flashcard-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.flashcard-front {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.flashcard-back {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  transform: rotateY(180deg);
}

.card-label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.8;
  margin-bottom: 1rem;
}

.card-text {
  font-size: 1.5rem;
  line-height: 1.5;
  margin: 0;
  word-wrap: break-word;
  max-height: 180px;
  overflow-y: auto;
}

.flip-hint {
  position: absolute;
  bottom: 1.5rem;
  font-size: 0.85rem;
  opacity: 0.7;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s;
  pointer-events: none;
}

.action-buttons.visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.btn-wrong {
  background: #fee2e2;
  color: #dc2626;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-wrong:hover {
  background: #fecaca;
  transform: translateY(-2px);
}

.btn-correct {
  background: #d1fae5;
  color: #059669;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-correct:hover {
  background: #a7f3d0;
  transform: translateY(-2px);
}

/* Keyboard Hints */
.keyboard-hints {
  display: flex;
  gap: 1.5rem;
  color: #9ca3af;
  font-size: 0.85rem;
}

kbd {
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.8rem;
  margin-right: 0.25rem;
}

/* Results Screen */
.results-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.results-card {
  background: white;
  border-radius: 24px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  max-width: 450px;
  width: 100%;
}

.results-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.results-card h2 {
  font-size: 2rem;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.results-card > p {
  color: #6b7280;
  margin-bottom: 2rem;
}

.results-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 2rem;
}

.results-stats .stat {
  text-align: center;
}

.results-stats .stat-value {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
}

.results-stats .stat-label {
  font-size: 0.9rem;
  color: #6b7280;
}

.results-stats .correct .stat-value {
  color: #10b981;
}

.results-stats .incorrect .stat-value {
  color: #ef4444;
}

/* Percentage Ring */
.results-percentage {
  margin-bottom: 2rem;
}

.percentage-ring {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  position: relative;
}

.circular-chart {
  display: block;
  width: 100%;
  height: 100%;
}

.circle-bg {
  fill: none;
  stroke: #e5e7eb;
  stroke-width: 3;
}

.circle {
  fill: none;
  stroke: #667eea;
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dasharray 0.5s;
}

.percentage-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
}

.results-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
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

.btn-wrong-repeat {
  background: #fef3c7;
  color: #92400e;
}

.btn-wrong-repeat:hover {
  background: #fde68a;
}

@media (max-width: 640px) {
  .learn-view {
    padding: 1rem;
  }

  .learn-header {
    flex-direction: column;
    text-align: center;
  }

  .flashcard {
    height: 280px;
  }

  .card-text {
    font-size: 1.25rem;
  }

  .keyboard-hints {
    display: none;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }

  .results-stats {
    gap: 2rem;
  }
}
</style>
