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

const selectedOption = ref<string | null>(null)

const selectOption = (option: string) => {
  if (props.showResult) return
  selectedOption.value = option
  emit('answer', option)
}

const getOptionClass = (option: string) => {
  if (!props.showResult) {
    return selectedOption.value === option ? 'selected' : ''
  }

  if (option === props.result?.correctAnswer) {
    return 'correct'
  }

  if (selectedOption.value === option && !props.result?.correct) {
    return 'wrong'
  }

  return ''
}
</script>

<template>
  <div class="multiple-choice-quiz">
    <div class="question-card">
      <h2 class="question-text">{{ question.question }}</h2>
    </div>

    <div class="options-grid">
      <button
        v-for="(option, index) in question.options"
        :key="index"
        class="option-button"
        :class="getOptionClass(option)"
        @click="selectOption(option)"
        :disabled="showResult"
      >
        <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
        <span class="option-text">{{ option }}</span>

        <!-- Checkmark for correct -->
        <svg v-if="showResult && option === result?.correctAnswer"
             class="option-icon"
             width="24" height="24"
             viewBox="0 0 24 24"
             fill="none"
             stroke="currentColor"
             stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>

        <!-- X for wrong -->
        <svg v-else-if="showResult && selectedOption === option && !result?.correct"
             class="option-icon"
             width="24" height="24"
             viewBox="0 0 24 24"
             fill="none"
             stroke="currentColor"
             stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
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
.multiple-choice-quiz {
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

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.option-button {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  font-size: 1rem;
}

.option-button:hover:not(:disabled) {
  background: white;
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.15);
}

.option-button:disabled {
  cursor: not-allowed;
}

.option-button.selected {
  background: rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
}

.option-button.correct {
  background: rgba(16, 185, 129, 0.1);
  border-color: #10b981;
  color: #059669;
}

.option-button.wrong {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #dc2626;
}

.option-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%);
  color: white;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.option-button.correct .option-letter {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
}

.option-button.wrong .option-letter {
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
}

.option-text {
  flex: 1;
  font-weight: 500;
  color: #1e293b;
}

.option-icon {
  flex-shrink: 0;
}

.option-button.correct .option-icon {
  color: #10b981;
}

.option-button.wrong .option-icon {
  color: #ef4444;
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

  .options-grid {
    grid-template-columns: 1fr;
  }
}
</style>
