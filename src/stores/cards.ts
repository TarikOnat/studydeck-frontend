import { defineStore } from 'pinia'
import axios from 'axios'

export interface Card {
  id?: number
  question: string
  answer: string
}

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
        const response = await axios.get('http://localhost:8080/api/cards')
        this.cards = response.data
      } catch (e) {
        this.error = 'Karten konnten nicht geladen werden.'
      } finally {
        this.loading = false
      }
    }
  }
})


