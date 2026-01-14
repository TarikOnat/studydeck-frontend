import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export enum QuizType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  FREE_TEXT = 'FREE_TEXT'
}

export interface QuizQuestion {
  cardId: number
  question: string
  type: QuizType
  options?: string[]
  displayedAnswer?: string
}

export interface QuizAnswer {
  cardId: number
  userAnswer: string
  type: QuizType
}

export interface QuizResult {
  correct: boolean
  correctAnswer: string
  explanation: string
}

export const useQuizStore = defineStore('quiz', {
  state: () => ({
    currentQuestion: null as QuizQuestion | null,
    loading: false,
    error: '',
    score: 0,
    totalQuestions: 0
  }),

  actions: {
    async fetchNextQuestion(deckId: number): Promise<QuizQuestion | null> {
      this.loading = true
      this.error = ''

      try {
        const response = await axios.get(`${API_BASE_URL}/api/quiz/deck/${deckId}/next`)
        this.currentQuestion = response.data
        return response.data
      } catch (e) {
        this.error = 'Keine weiteren Fragen verfügbar.'
        console.error(e)
        return null
      } finally {
        this.loading = false
      }
    },

    async checkAnswer(answer: QuizAnswer): Promise<QuizResult | null> {
      this.loading = true

      try {
        const response = await axios.post(`${API_BASE_URL}/api/quiz/check`, answer)
        const result: QuizResult = response.data

        if (result.correct) {
          this.score++
        }
        this.totalQuestions++

        return result
      } catch (e) {
        this.error = 'Fehler beim Prüfen der Antwort.'
        console.error(e)
        return null
      } finally {
        this.loading = false
      }
    },

    resetQuiz() {
      this.score = 0
      this.totalQuestions = 0
      this.currentQuestion = null
      this.error = ''
    }
  }
})
