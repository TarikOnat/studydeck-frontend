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
const hasBeenFlipped = ref(false)
const showResults = ref(false)
const sessionStats = ref({ correct: 0, incorrect: 0 })
const wrongCards = ref<number[]>([])
const learnMode = ref<'all' | 'unlearned' | 'wrong'>('unlearned')

const initialCards = ref<any[]>([])

const cardsToLearn = computed(() => {
  return initialCards.value
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
  initializeCards()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const initializeCards = () => {
  if (learnMode.value === 'wrong') {
    initialCards.value = cardsStore.cards.filter(c => wrongCards.value.includes(c.id!))
  } else if (learnMode.value === 'unlearned') {
    const unlearned = cardsStore.cards.filter(c => !c.learned)
    initialCards.value = unlearned.length > 0 ? unlearned : cardsStore.cards
  } else {
    initialCards.value = [...cardsStore.cards]
  }
}

const flipCard = () => {
  isFlipped.value = !isFlipped.value
  if (!hasBeenFlipped.value) {
    hasBeenFlipped.value = true
  }
}

const markAsLearned = async () => {
  if (currentCard.value && currentCard.value.id) {
    if (!currentCard.value.learned) {
      await cardsStore.toggleLearned(currentCard.value.id)
    }
    if (learnMode.value === 'wrong') {
      wrongCards.value = wrongCards.value.filter(id => id !== currentCard.value!.id)
    }
    sessionStats.value.correct++
    nextCard()
  }
}

const markAsNotLearned = () => {
  if (currentCard.value && currentCard.value.id) {
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
    mode = 'all'
  }

  learnMode.value = mode
  currentIndex.value = 0
  isFlipped.value = false
  hasBeenFlipped.value = false
  showResults.value = false

  if (mode === 'all') {
    sessionStats.value = { correct: 0, incorrect: 0 }
    wrongCards.value = []
  } else {
    sessionStats.value = { correct: 0, incorrect: 0 }
  }

  initializeCards()
}

const goBack = () => {
  router.push(`/decks/${deckId.value}`)
}

const goToDecks = () => {
  router.push('/decks')
}

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
    <header class="learn-header">
      <button @click="goBack" class="btn-back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        Zurück
      </button>
      <h1>{{ decksStore.currentDeck?.title }}</h1>
      <div class="progress-indicator">
        {{ currentIndex + 1 }} / {{ cardsToLearn.length }}
      </div>
    </header>

    <div v-if="learnMode === 'wrong'" class="mode-badge">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="23 4 23 10 17 10"></polyline>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
      </svg>
      Wiederholung: Nur nicht gewusste Karten
    </div>

    <div class="progress-bar-container">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
      </div>
    </div>

    <div v-if="cardsStore.loading" class="loading">
      <div class="spinner"></div>
      <p>Karten werden geladen...</p>
    </div>

    <div v-else-if="cardsToLearn.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      <h2>Keine Karten zum Lernen</h2>
      <p>Füge erst Karten zu diesem Deck hinzu!</p>
      <button @click="goBack" class="btn btn-primary">
        Zum Deck
      </button>
    </div>

    <div v-else-if="showResults" class="results-screen">
      <div class="results-card">
        <div class="results-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h2>Geschafft!</h2>
        <p>Du hast alle {{ cardsToLearn.length }} Karten durchgearbeitet.</p>

        <div class="results-stats">
          <div class="stat correct">
            <span class="stat-value">{{ sessionStats.correct }}</span>
            <span class="stat-label">Gewusst</span>
          </div>
          <div class="stat incorrect">
            <span class="stat-value">{{ sessionStats.incorrect }}</span>
            <span class="stat-label">Wiederholen</span>
          </div>
        </div>

        <div class="results-percentage">
          <div class="percentage-ring">
            <svg viewBox="0 0 36 36">
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
          <button
            v-if="wrongCards.length > 0"
            @click="restartSession('wrong')"
            class="btn btn-warning"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            Falsche wiederholen ({{ wrongCards.length }})
          </button>

          <button @click="restartSession('all')" class="btn btn-secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="1 4 1 10 7 10"></polyline>
              <polyline points="23 20 23 14 17 14"></polyline>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
            </svg>
            Alle nochmal üben
          </button>

          <button @click="goToDecks" class="btn btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            Zu den Decks
          </button>
        </div>
      </div>
    </div>

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
            <span class="flip-hint">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="17 1 21 5 17 9"></polyline>
                <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                <polyline points="7 23 3 19 7 15"></polyline>
                <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
              </svg>
              Klicken zum Umdrehen
            </span>
          </div>
          <div class="flashcard-back">
            <span class="card-label">Antwort</span>
            <p class="card-text">{{ currentCard?.answer }}</p>
            <span class="flip-hint">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="17 1 21 5 17 9"></polyline>
                <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                <polyline points="7 23 3 19 7 15"></polyline>
                <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
              </svg>
              Klicken zum Zurückdrehen
            </span>
          </div>
        </div>
      </div>

      <div class="action-buttons" :class="{ visible: hasBeenFlipped }">
        <button @click.stop="markAsNotLearned" class="btn btn-wrong">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          Nicht gewusst
        </button>
        <button @click.stop="markAsLearned" class="btn btn-correct">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Gewusst
        </button>
      </div>

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
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  transition: all 0.15s;
}

.btn-back:hover {
  background: white;
  color: #1e293b;
  border-color: #cbd5e1;
}

.progress-indicator {
  font-weight: 600;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.mode-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: rgba(251, 191, 36, 0.15);
  color: #b45309;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  text-align: center;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.progress-bar-container {
  margin-bottom: 2rem;
}

.progress-bar {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1e3a5f 0%, #3b82f6 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #64748b;
}

.spinner {
  width: 44px;
  height: 44px;
  border: 3px solid rgba(59, 130, 246, 0.1);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

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
  margin-bottom: 1.5rem;
  color: #94a3b8;
}

.empty-state h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #64748b;
  margin-bottom: 1.5rem;
}

.flashcard-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}

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
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
}

.flashcard-front {
  background: linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%);
  color: white;
}

.flashcard-back {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: white;
  transform: rotateY(180deg);
}

.card-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.8;
  margin-bottom: 1rem;
  font-weight: 600;
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
  font-size: 0.8rem;
  opacity: 0.7;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

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
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  border: 1px solid rgba(239, 68, 68, 0.2);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-wrong:hover {
  background: rgba(239, 68, 68, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.2);
}

.btn-correct {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  border: 1px solid rgba(16, 185, 129, 0.2);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-correct:hover {
  background: rgba(16, 185, 129, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
}

.keyboard-hints {
  display: flex;
  gap: 1.5rem;
  color: #94a3b8;
  font-size: 0.8rem;
}

kbd {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #e2e8f0;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.75rem;
  margin-right: 0.25rem;
}

.results-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.results-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 24px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.1);
  max-width: 450px;
  width: 100%;
}

.results-icon {
  margin-bottom: 1rem;
}

.results-card h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.results-card > p {
  color: #64748b;
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
  font-size: 0.875rem;
  color: #64748b;
}

.results-stats .correct .stat-value {
  color: #10b981;
}

.results-stats .incorrect .stat-value {
  color: #ef4444;
}

.results-percentage {
  margin-bottom: 2rem;
}

.percentage-ring {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  position: relative;
}

.percentage-ring svg {
  transform: rotate(-90deg);
}

.circle-bg {
  fill: none;
  stroke: #e2e8f0;
  stroke-width: 3;
}

.circle {
  fill: none;
  stroke: #3b82f6;
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
  color: #3b82f6;
}

.results-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.btn-primary {
  background: linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.8);
  color: #475569;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: white;
  border-color: #cbd5e1;
}

.btn-warning {
  background: rgba(251, 191, 36, 0.15);
  color: #b45309;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.btn-warning:hover {
  background: rgba(251, 191, 36, 0.25);
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
