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

const userInput = ref('')

const submitAnswer = () => {
  if (!userInput.value.trim() || props.showResult) return
  emit('answer', userInput.value.trim())
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    submitAnswer()
  }
}
</script>

<template>
  <div class="free-text-quiz">
    <div class="question-card">
      <h2 class="question-text">{{ question.question }}</h2>
    </div>

    <div class="input-container">
      <label class="input-label">Deine Antwort:</label>
      <textarea
        v-model="userInput"
        class="text-input"
        :class="{
          correct: showResult && result?.correct,
          wrong: showResult && !result?.correct
        }"
        placeholder="Tippe hier deine Antwort..."
        rows="4"
        :disabled="showResult"
        @keydown="handleKeydown"
      ></textarea>

      <button
        v-if="!showResult"
        @click="submitAnswer"
        class="btn-submit"
        :disabled="!userInput.trim()"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 11 12 14 22 4"></polyline>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
        </svg>
        Antwort prüfen
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
.free-text-quiz {
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
  margin: 0;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-label {
  font-size: 1rem;
  font-weight: 600;
  color: #475569;
}

.text-input {
  width: 100%;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  color: #1e293b;
  resize: vertical;
  transition: all 0.2s;
}

.text-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.text-input:disabled {
  background: rgba(241, 245, 249, 0.5);
  cursor: not-allowed;
}

.text-input.correct {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

.text-input.wrong {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.btn-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
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

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
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
}
</style>
