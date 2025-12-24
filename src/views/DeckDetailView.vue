<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useDecksStore } from '@/stores/decks'
import { useCardsStore } from '@/stores/cards'

const route = useRoute()
const router = useRouter()
const decksStore = useDecksStore()
const cardsStore = useCardsStore()

const deckId = computed(() => Number(route.params.id))

const showAddModal = ref(false)
const showEditModal = ref(false)
const newQuestion = ref('')
const newAnswer = ref('')
const editingCard = ref<any>(null)

onMounted(async () => {
  await decksStore.loadDeckById(deckId.value)
  await cardsStore.loadCardsByDeck(deckId.value)
})

const addCard = async () => {
  if (newQuestion.value.trim() && newAnswer.value.trim()) {
    await cardsStore.addCard(newQuestion.value.trim(), newAnswer.value.trim(), deckId.value)
    newQuestion.value = ''
    newAnswer.value = ''
    showAddModal.value = false
    // Reload deck to update card count
    await decksStore.loadDeckById(deckId.value)
  }
}

const openEditModal = (card: any) => {
  editingCard.value = { ...card }
  showEditModal.value = true
}

const saveEdit = async () => {
  if (editingCard.value && editingCard.value.question.trim() && editingCard.value.answer.trim()) {
    await cardsStore.updateCard(
      editingCard.value.id,
      editingCard.value.question.trim(),
      editingCard.value.answer.trim(),
      editingCard.value.learned
    )
    showEditModal.value = false
    editingCard.value = null
  }
}

const deleteCard = async (cardId: number) => {
  if (confirm('Möchtest du diese Karte wirklich löschen?')) {
    await cardsStore.deleteCard(cardId)
    await decksStore.loadDeckById(deckId.value)
  }
}

const toggleLearned = async (cardId: number) => {
  await cardsStore.toggleLearned(cardId)
}

const goBack = () => {
  router.push('/decks')
}
</script>

<template>
  <div class="deck-detail-view">
    <!-- Header -->
    <header class="page-header">
      <div class="header-left">
        <button @click="goBack" class="btn-back">
          ← Zurück
        </button>
        <div class="deck-info">
          <h1>{{ decksStore.currentDeck?.title || 'Deck laden...' }}</h1>
          <p class="card-count">{{ cardsStore.cards.length }} Karten</p>
        </div>
      </div>
      <div class="header-actions">
        <RouterLink
          :to="`/decks/${deckId}/learn`"
          class="btn btn-learn"
          :class="{ disabled: cardsStore.cards.length === 0 }"
        >
          🎓 Lernen starten
        </RouterLink>
        <button @click="showAddModal = true" class="btn btn-primary">
          ➕ Karte hinzufügen
        </button>
      </div>
    </header>

    <!-- Progress Bar -->
    <div v-if="cardsStore.cards.length > 0" class="progress-section">
      <div class="progress-info">
        <span>Fortschritt: {{ cardsStore.learnedCards.length }} / {{ cardsStore.cards.length }} gelernt</span>
        <span class="progress-percentage">{{ cardsStore.progressPercentage }}%</span>
      </div>
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: `${cardsStore.progressPercentage}%` }"
        ></div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="cardsStore.loading" class="loading">
      <div class="spinner"></div>
      <p>Karten werden geladen...</p>
    </div>

    <!-- Error -->
    <div v-else-if="cardsStore.error" class="error-message">
      <p>❌ {{ cardsStore.error }}</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="cardsStore.cards.length === 0" class="empty-state">
      <div class="empty-icon">🃏</div>
      <h2>Noch keine Karten</h2>
      <p>Füge deine erste Karteikarte hinzu!</p>
      <button @click="showAddModal = true" class="btn btn-primary">
        ➕ Erste Karte erstellen
      </button>
    </div>

    <!-- Cards List -->
    <div v-else class="cards-list">
      <div
        v-for="card in cardsStore.cards"
        :key="card.id"
        class="card-item"
        :class="{ learned: card.learned }"
      >
        <div class="card-content">
          <div class="card-question">
            <span class="label">Frage:</span>
            <p>{{ card.question }}</p>
          </div>
          <div class="card-divider"></div>
          <div class="card-answer">
            <span class="label">Antwort:</span>
            <p>{{ card.answer }}</p>
          </div>
        </div>

        <div class="card-actions">
          <button
            @click="toggleLearned(card.id!)"
            class="btn-status"
            :class="{ active: card.learned }"
            :title="card.learned ? 'Als nicht gelernt markieren' : 'Als gelernt markieren'"
          >
            {{ card.learned ? '✓ Gelernt' : '○ Noch nicht gelernt' }}
          </button>
          <button @click="openEditModal(card)" class="btn-icon" title="Bearbeiten">
            ✏️
          </button>
          <button @click="deleteCard(card.id!)" class="btn-icon btn-delete" title="Löschen">
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- Add Card Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal">
        <h2>🃏 Neue Karte erstellen</h2>
        <form @submit.prevent="addCard">
          <div class="form-group">
            <label for="question">Frage</label>
            <textarea
              id="question"
              v-model="newQuestion"
              placeholder="Gib hier die Frage ein..."
              rows="3"
              required
            ></textarea>
          </div>
          <div class="form-group">
            <label for="answer">Antwort</label>
            <textarea
              id="answer"
              v-model="newAnswer"
              placeholder="Gib hier die Antwort ein..."
              rows="3"
              required
            ></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAddModal = false" class="btn btn-secondary">
              Abbrechen
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="!newQuestion.trim() || !newAnswer.trim()"
            >
              ➕ Erstellen
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Card Modal -->
    <div v-if="showEditModal && editingCard" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal">
        <h2>✏️ Karte bearbeiten</h2>
        <form @submit.prevent="saveEdit">
          <div class="form-group">
            <label for="editQuestion">Frage</label>
            <textarea
              id="editQuestion"
              v-model="editingCard.question"
              rows="3"
              required
            ></textarea>
          </div>
          <div class="form-group">
            <label for="editAnswer">Antwort</label>
            <textarea
              id="editAnswer"
              v-model="editingCard.answer"
              rows="3"
              required
            ></textarea>
          </div>
          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" v-model="editingCard.learned" />
              Als gelernt markieren
            </label>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showEditModal = false" class="btn btn-secondary">
              Abbrechen
            </button>
            <button type="submit" class="btn btn-primary">
              💾 Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.deck-detail-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.btn-back {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #374151;
  transition: background 0.2s;
}

.btn-back:hover {
  background: #e5e7eb;
}

.deck-info h1 {
  font-size: 1.75rem;
  color: #1f2937;
  margin: 0;
}

.card-count {
  color: #6b7280;
  margin: 0.25rem 0 0 0;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

/* Progress Section */
.progress-section {
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: #6b7280;
}

.progress-percentage {
  font-weight: 600;
  color: #667eea;
}

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;
  color: #6b7280;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty & Error States */
.empty-state, .error-message {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.error-message {
  background: #fef2f2;
  color: #dc2626;
}

/* Cards List */
.cards-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card-item {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #e5e7eb;
  transition: all 0.2s;
}

.card-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-item.learned {
  border-left-color: #10b981;
  background: #f0fdf4;
}

.card-content {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1rem;
  align-items: start;
  margin-bottom: 1rem;
}

.card-question, .card-answer {
  min-width: 0;
}

.label {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #9ca3af;
  margin-bottom: 0.25rem;
  font-weight: 600;
}

.card-content p {
  margin: 0;
  color: #1f2937;
  word-wrap: break-word;
}

.card-divider {
  width: 1px;
  background: #e5e7eb;
  align-self: stretch;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: flex-end;
  padding-top: 0.75rem;
  border-top: 1px solid #f3f4f6;
}

.btn-status {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 2px solid #e5e7eb;
  background: white;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
}

.btn-status:hover {
  border-color: #667eea;
  color: #667eea;
}

.btn-status.active {
  background: #d1fae5;
  border-color: #10b981;
  color: #059669;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-learn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-learn:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn-learn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: #f3f4f6;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #e5e7eb;
}

.btn-delete:hover {
  background: #fee2e2;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal h2 {
  margin-bottom: 1.5rem;
  color: #1f2937;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
}

.form-group textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
}

.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

@media (max-width: 640px) {
  .deck-detail-view {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-left {
    flex-direction: column;
  }

  .header-actions {
    flex-direction: column;
  }

  .card-content {
    grid-template-columns: 1fr;
  }

  .card-divider {
    width: 100%;
    height: 1px;
  }
}
</style>
