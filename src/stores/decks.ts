import { defineStore } from 'pinia'
import axios from 'axios'

export interface Deck {
  id?: number
  title: string
  cards?: Card[]
}

export interface Card {
  id?: number
  question: string
  answer: string
  learned: boolean
  deck?: { id: number }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export const useDecksStore = defineStore('decks', {
  state: () => ({
    decks: [] as Deck[],
    currentDeck: null as Deck | null,
    loading: false,
    error: ''
  }),

  getters: {
    getDeckById: (state) => (id: number) => {
      return state.decks.find(deck => deck.id === id)
    },
    totalDecks: (state) => state.decks.length
  },

  actions: {
    async loadDecks() {
      this.loading = true
      this.error = ''

      try {
        const response = await axios.get(`${API_BASE_URL}/api/decks`)
        this.decks = response.data
      } catch (e) {
        this.error = 'Decks konnten nicht geladen werden.'
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    async loadDeckById(id: number) {
      this.loading = true
      this.error = ''

      try {
        const response = await axios.get(`${API_BASE_URL}/api/decks/${id}`)
        this.currentDeck = response.data
        return response.data
      } catch (e) {
        this.error = 'Deck konnte nicht geladen werden.'
        console.error(e)
        return null
      } finally {
        this.loading = false
      }
    },

    async createDeck(title: string) {
      this.error = ''

      try {
        const response = await axios.post(`${API_BASE_URL}/api/decks`, { title })
        this.decks.push(response.data)
        return response.data
      } catch (e) {
        this.error = 'Deck konnte nicht erstellt werden.'
        console.error(e)
        return null
      }
    },

    async updateDeck(id: number, title: string) {
      this.error = ''

      try {
        const response = await axios.put(`${API_BASE_URL}/api/decks/${id}`, { title })
        const index = this.decks.findIndex(d => d.id === id)
        if (index !== -1) {
          this.decks[index] = response.data
        }
        return response.data
      } catch (e) {
        this.error = 'Deck konnte nicht aktualisiert werden.'
        console.error(e)
        return null
      }
    },

    async deleteDeck(id: number) {
      this.error = ''

      try {
        await axios.delete(`${API_BASE_URL}/api/decks/${id}`)
        this.decks = this.decks.filter(d => d.id !== id)
        return true
      } catch (e) {
        this.error = 'Deck konnte nicht gelöscht werden.'
        console.error(e)
        return false
      }
    },

    setCurrentDeck(deck: Deck | null) {
      this.currentDeck = deck
    }
  }
})
