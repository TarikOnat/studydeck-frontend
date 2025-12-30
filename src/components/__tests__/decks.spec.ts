import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDecksStore } from '@/stores/decks'


vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

describe('Decks Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should have empty decks array initially', () => {
    const store = useDecksStore()
    expect(store.decks).toEqual([])
  })

  it('should have null currentDeck initially', () => {
    const store = useDecksStore()
    expect(store.currentDeck).toBeNull()
  })

  it('should have loading as false initially', () => {
    const store = useDecksStore()
    expect(store.loading).toBe(false)
  })

  it('getDeckById should return correct deck', () => {
    const store = useDecksStore()
    store.decks = [
      { id: 1, title: 'Deck 1' },
      { id: 2, title: 'Deck 2' }
    ]
    const deck = store.getDeckById(2)
    expect(deck?.title).toBe('Deck 2')
  })

  it('totalDecks should return correct count', () => {
    const store = useDecksStore()
    store.decks = [
      { id: 1, title: 'Deck 1' },
      { id: 2, title: 'Deck 2' }
    ]
    expect(store.totalDecks).toBe(2)
  })

  it('setCurrentDeck should set currentDeck', () => {
    const store = useDecksStore()
    const deck = { id: 1, title: 'Test Deck' }
    store.setCurrentDeck(deck)
    expect(store.currentDeck).toEqual(deck)
  })
})
