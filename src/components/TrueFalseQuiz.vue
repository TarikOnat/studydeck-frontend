<script setup lang="ts">
import { ref } from 'vue'
import type { QuizQuestion, QuizResult } from '@/stores/quiz'

const props = defineProps<{
  question: QuizQuestion
  showResult: boolean
  result: QuizResult | null
}>()

const emit = defineEmits<{
  answer: [userAnswer: string]
  next: []
}>()

const userAnswer = ref<string | null>(null)

const selectAnswer = (answer: 'true' | 'false') => {
  if (props.showResult) return
  userAnswer.value = answer
  emit('answer', answer)
}
</script>

<template>
  <div class="true-false-quiz">
    <div class="question-card">
      <h2 class="question-text">{{ question.question }}</h2>

      <div class="displayed-answer">
        <span class="answer-label">Ist diese Antwort richtig?</span>
        <p class="answer-text">{{ question.displayedAnswer }}</p>
      </div>
    </div>

    <div class="buttons-container">
      <button
        class="tf-button true-button"
        :class="{
          selected: userAnswer === 'true',
          correct: showResult && result?.correct && userAnswer === 'true',
          wrong: showResult && !result?.correct && userAnswer === 'true'
        }"
        @click="selectAnswer('true')"
        :disabled="showResult"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>Richtig</span>
      </button>

      <button
        class="tf-button false-button"
        :class="{
          selected: userAnswer === 'false',
          correct: showResult && result?.correct && userAnswer === 'false',
          wrong: showResult && !result?.correct && userAnswer === 'false'
        }"
        @click="selectAnswer('false')"
        :disabled="showResult"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        <span>Falsch</span>
      </button>
    </div>

    <!-- Result Feedback -->
    <div v-if="showResult && result" class="result-feedback" :class="{ correct: result.correct, wrong: !result.correct }">
      <div class="result-icon">
        <svg v-if="result.correct" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <svg v-else width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </div>
      <p class="result-text">{{ result.explanation }}</p>
      <button @click="emit('next')" class="btn-next">
        Nächste Frage
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.true-false-quiz {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex: 1;
}

.question-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.question-text {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.5;
  margin: 0 0 2rem 0;
}

.displayed-answer {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #bae6fd;
  border-radius: 16px;
  padding: 1.5rem;
}

.answer-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #0369a1;
  margin-bottom: 0.75rem;
}

.answer-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0c4a6e;
  margin: 0;
  line-height: 1.5;
}

.buttons-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.tf-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  border-radius: 16px;
  border: 2px solid;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.25rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.8);
}

.tf-button:hover:not(:disabled) {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.tf-button:disabled {
  cursor: not-allowed;
}

.true-button {
  border-color: #10b981;
  color: #059669;
}

.true-button:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.1);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.2);
}

.false-button {
  border-color: #ef4444;
  color: #dc2626;
}

.false-button:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.1);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.2);
}

.tf-button.selected {
  transform: scale(1.05);
}

.true-button.selected {
  background: rgba(16, 185, 129, 0.15);
  border-width: 3px;
}

.false-button.selected {
  background: rgba(239, 68, 68, 0.15);
  border-width: 3px;
}

.tf-button.correct {
  background: rgba(16, 185, 129, 0.2);
  border-color: #10b981;
  border-width: 3px;
}

.tf-button.wrong {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  border-width: 3px;
}

/* Result Feedback */
.result-feedback {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
}

.result-feedback.correct {
  background: rgba(16, 185, 129, 0.1);
  border: 2px solid rgba(16, 185, 129, 0.3);
}

.result-feedback.wrong {
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.3);
}

.result-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
}

.result-feedback.correct .result-icon {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.result-feedback.wrong .result-icon {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.result-text {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.result-feedback.correct .result-text {
  color: #059669;
}

.result-feedback.wrong .result-text {
  color: #dc2626;
}

.btn-next {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25);
}

.btn-next:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
}

@media (max-width: 640px) {
  .question-card {
    padding: 1.5rem;
  }

  .question-text {
    font-size: 1.25rem;
  }

  .buttons-container {
    grid-template-columns: 1fr;
  }

  .tf-button {
    padding: 1.5rem;
  }
}
</style>
