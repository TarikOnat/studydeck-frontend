import { defineStore } from 'pinia'
import axios from 'axios'

export interface Card {
  id?: number
  question: string
  answer: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export const useCardsStore = defineStore('cards', {
  state: () => ({
    cards: [] as Card[],
    loading: false,
    error: ''
  }),

  actions: {
    async loadCards() {
      this.loading = true
      this.error = ''

      try {
        const response = await axios.get(`${API_BASE_URL}/api/cards`)
        this.cards = response.data
      } catch (e) {
        this.error = 'Karten konnten nicht geladen werden.'
      } finally {
        this.loading = false
      }
    },

    async addCard(question: string, answer: string) {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/cards`, {
          question,
          answer
        })
        this.cards.push(response.data)
      } catch (e) {
        this.error = 'Karte konnte nicht angelegt werden.'
      }
    }
  }
})
