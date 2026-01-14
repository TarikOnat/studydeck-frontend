<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDecksStore } from '@/stores/decks'
import { useQuizStore, QuizType } from '@/stores/quiz'
import type { QuizResult } from '@/stores/quiz'

// Components
import MultipleChoiceQuiz from '@/components/MultipleChoiceQuiz.vue'
import TrueFalseQuiz from '@/components/TrueFalseQuiz.vue'
import FreeTextQuiz from '@/components/FreeTextQuiz.vue'

const route = useRoute()
const router = useRouter()
const decksStore = useDecksStore()
const quizStore = useQuizStore()

const deckId = computed(() => Number(route.params.id))
const showResult = ref(false)
const lastResult = ref<QuizResult | null>(null)
const showFinalResults = ref(false)

onMounted(async () => {
  await decksStore.loadDeckById(deckId.value)
  quizStore.resetQuiz()
  await loadNextQuestion()
})

const loadNextQuestion = async () => {
  showResult.value = false
  lastResult.value = null
  const question = await quizStore.fetchNextQuestion(deckId.value)

  if (!question) {
    showFinalResults.value = true
  }
}

const handleAnswer = async (userAnswer: string) => {
  if (!quizStore.currentQuestion) return

  const result = await quizStore.checkAnswer({
    cardId: quizStore.currentQuestion.cardId,
    userAnswer,
    type: quizStore.currentQuestion.type
  })

  if (result) {
    lastResult.value = result
    showResult.value = true
  }
}

const nextQuestion = () => {
  loadNextQuestion()
}

const restartQuiz = () => {
  quizStore.resetQuiz()
  showFinalResults.value = false
  loadNextQuestion()
}

const goBack = () => {
  router.push(`/decks/${deckId.value}`)
}

const goToDecks = () => {
  router.push('/decks')
}
</script>

<template>
  <div class="quiz-view">
    <!-- Header -->
    <header class="quiz-header">
      <button @click="goBack" class="btn-back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        Zurück
      </button>
      <h1>{{ decksStore.currentDeck?.title }} - Quiz</h1>
      <div class="score-indicator">
        {{ quizStore.score }} / {{ quizStore.totalQuestions }}
      </div>
    </header>

    <!-- Loading -->
    <div v-if="quizStore.loading && !quizStore.currentQuestion" class="loading">
      <div class="spinner"></div>
      <p>Quiz wird geladen...</p>
    </div>

    <!-- Final Results -->
    <div v-else-if="showFinalResults" class="results-screen">
      <div class="results-card">
        <div class="results-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h2>Quiz beendet!</h2>
        <p>Du hast {{ quizStore.totalQuestions }} Fragen beantwortet.</p>

        <div class="results-stats">
          <div class="stat correct">
            <span class="stat-value">{{ quizStore.score }}</span>
            <span class="stat-label">Richtig</span>
          </div>
          <div class="stat incorrect">
            <span class="stat-value">{{ quizStore.totalQuestions - quizStore.score }}</span>
            <span class="stat-label">Falsch</span>
          </div>
        </div>

        <div class="results-percentage">
          <div class="percentage-ring">
            <svg viewBox="0 0 36 36">
              <path class="circle-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path class="circle"
                    :stroke-dasharray="`${quizStore.totalQuestions > 0 ? (quizStore.score / quizStore.totalQuestions) * 100 : 0}, 100`"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span class="percentage-text">
              {{ quizStore.totalQuestions > 0 ? Math.round((quizStore.score / quizStore.totalQuestions) * 100) : 0 }}%
            </span>
          </div>
        </div>

        <div class="results-actions">
          <button @click="restartQuiz" class="btn btn-secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="1 4 1 10 7 10"></polyline>
              <polyline points="23 20 23 14 17 14"></polyline>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
            </svg>
            Nochmal starten
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

    <!-- Quiz Questions -->
    <div v-else-if="quizStore.currentQuestion" class="quiz-container">
      <!-- Mode Badge -->
      <div class="mode-badge">
        <span v-if="quizStore.currentQuestion.type === QuizType.MULTIPLE_CHOICE">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="4"></circle>
          </svg>
          Multiple Choice
        </span>
        <span v-else-if="quizStore.currentQuestion.type === QuizType.TRUE_FALSE">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11l3 3L22 4"></path>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
          Wahr / Falsch
        </span>
        <span v-else>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <polyline points="19 12 12 19 5 12"></polyline>
          </svg>
          Freitext
        </span>
      </div>

      <!-- Question Components -->
      <MultipleChoiceQuiz
        v-if="quizStore.currentQuestion.type === QuizType.MULTIPLE_CHOICE"
        :question="quizStore.currentQuestion"
        :show-result="showResult"
        :result="lastResult"
        @answer="handleAnswer"
        @next="nextQuestion"
      />

      <TrueFalseQuiz
        v-else-if="quizStore.currentQuestion.type === QuizType.TRUE_FALSE"
        :question="quizStore.currentQuestion"
        :show-result="showResult"
        :result="lastResult"
        @answer="handleAnswer"
        @next="nextQuestion"
      />

      <FreeTextQuiz
        v-else
        :question="quizStore.currentQuestion"
        :show-result="showResult"
        :result="lastResult"
        @answer="handleAnswer"
        @next="nextQuestion"
      />
    </div>
  </div>
</template>

<style scoped>
.quiz-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 1.5rem;
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

/* Header */
.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.quiz-header h1 {
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

.score-indicator {
  font-weight: 600;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

/* Mode Badge */
.mode-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: rgba(99, 102, 241, 0.1);
  color: #4f46e5;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.mode-badge span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Loading */
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

/* Quiz Container */
.quiz-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Results Screen (same as LearnView) */
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

/* Buttons */
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

@media (max-width: 640px) {
  .quiz-view {
    padding: 1rem;
  }

  .quiz-header {
    flex-direction: column;
    text-align: center;
  }

  .results-stats {
    gap: 2rem;
  }
}
</style>
