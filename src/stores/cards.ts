import { defineStore } from 'pinia'

export interface Card {
  id?: number
  question: string
  answer: string
}

export const useCardsStore = defineStore('cards', {
  state: () => ({
    cards: [
      { question: 'Was ist Vue?', answer: 'Ein Frontend Framework.' },
      { question: 'Was ist Spring Boot?', answer: 'Ein Java Backend Framework.' }
    ] as Card[]
  })
})

