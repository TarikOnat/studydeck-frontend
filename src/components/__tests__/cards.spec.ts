import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCardsStore } from '@/stores/cards'

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

describe('Cards Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should have empty cards array initially', () => {
    const store = useCardsStore()
    expect(store.cards).toEqual([])
  })

  it('should have loading as false initially', () => {
    const store = useCardsStore()
    expect(store.loading).toBe(false)
  })

  it('should have empty error string initially', () => {
    const store = useCardsStore()
    expect(store.error).toBe('')
  })

  it('learnedCards should return only learned cards', () => {
    const store = useCardsStore()
    store.cards = [
      { id: 1, question: 'Q1', answer: 'A1', learned: true },
      { id: 2, question: 'Q2', answer: 'A2', learned: false },
      { id: 3, question: 'Q3', answer: 'A3', learned: true }
    ]
    expect(store.learnedCards).toHaveLength(2)
  })

  it('unlearnedCards should return only unlearned cards', () => {
    const store = useCardsStore()
    store.cards = [
      { id: 1, question: 'Q1', answer: 'A1', learned: true },
      { id: 2, question: 'Q2', answer: 'A2', learned: false }
    ]
    expect(store.unlearnedCards).toHaveLength(1)
  })

  it('progressPercentage should calculate correctly', () => {
    const store = useCardsStore()
    store.cards = [
      { id: 1, question: 'Q1', answer: 'A1', learned: true },
      { id: 2, question: 'Q2', answer: 'A2', learned: true },
      { id: 3, question: 'Q3', answer: 'A3', learned: false },
      { id: 4, question: 'Q4', answer: 'A4', learned: false }
    ]
    expect(store.progressPercentage).toBe(50)
  })

  it('progressPercentage should return 0 when no cards', () => {
    const store = useCardsStore()
    expect(store.progressPercentage).toBe(0)
  })
})
