import { defineStore } from 'pinia'
import axios from 'axios'

export interface Card {
  id?: number
  question: string
  answer: string
  learned: boolean
  deck?: { id: number }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export const useCardsStore = defineStore('cards', {
  state: () => ({
    cards: [] as Card[],
    loading: false,
    error: ''
  }),

  getters: {
    learnedCards: (state) => state.cards.filter(card => card.learned),
    unlearnedCards: (state) => state.cards.filter(card => !card.learned),
    progressPercentage: (state) => {
      if (state.cards.length === 0) return 0
      return Math.round((state.cards.filter(c => c.learned).length / state.cards.length) * 100)
    }
  },

  actions: {
    async loadCards() {
      this.loading = true
      this.error = ''

      try {
        const response = await axios.get(`${API_BASE_URL}/api/cards`)
        this.cards = response.data
      } catch (e) {
        this.error = 'Karten konnten nicht geladen werden.'
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    async loadCardsByDeck(deckId: number) {
      this.loading = true
      this.error = ''

      try {
        const response = await axios.get(`${API_BASE_URL}/api/cards/deck/${deckId}`)
        this.cards = response.data
      } catch (e) {
        this.error = 'Karten konnten nicht geladen werden.'
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    async addCard(question: string, answer: string, deckId: number) {
      this.error = ''

      try {
        const response = await axios.post(`${API_BASE_URL}/api/cards`, {
          question,
          answer,
          learned: false,
          deck: { id: deckId }
        })
        this.cards.push(response.data)
        return response.data
      } catch (e) {
        this.error = 'Karte konnte nicht angelegt werden.'
        console.error(e)
        return null
      }
    },

    async updateCard(id: number, question: string, answer: string, learned: boolean) {
      this.error = ''

      try {
        const response = await axios.put(`${API_BASE_URL}/api/cards/${id}`, {
          question,
          answer,
          learned
        })
        const index = this.cards.findIndex(c => c.id === id)
        if (index !== -1) {
          this.cards[index] = response.data
        }
        return response.data
      } catch (e) {
        this.error = 'Karte konnte nicht aktualisiert werden.'
        console.error(e)
        return null
      }
    },

    async toggleLearned(id: number) {
      const card = this.cards.find(c => c.id === id)
      if (!card) return null

      return this.updateCard(id, card.question, card.answer, !card.learned)
    },

    async deleteCard(id: number) {
      this.error = ''

      try {
        await axios.delete(`${API_BASE_URL}/api/cards/${id}`)
        this.cards = this.cards.filter(c => c.id !== id)
        return true
      } catch (e) {
        this.error = 'Karte konnte nicht gelöscht werden.'
        console.error(e)
        return false
      }
    },

    resetProgress() {
      this.cards.forEach(card => {
        card.learned = false
      })
    }
  }
})
