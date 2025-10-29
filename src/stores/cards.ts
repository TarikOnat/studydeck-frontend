import { defineStore } from 'pinia'

export interface Card {
  id?: number
  question: string
  answer: string
}

export const useCardsStore = defineStore('cards', {
  state: () => ({
    cards: [
      { question: 'Was ist 5x5?', answer: '25' },
      { question: 'Was ist die Hauptstadt von Deutschland?', answer: 'Berlin' }
    ] as Card[]
  })
})

