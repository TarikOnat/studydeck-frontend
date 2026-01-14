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
      <button @click="goBack" class="btn-back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        Zurück
      </button>
      <div class="deck-info">
        <h1>{{ decksStore.currentDeck?.title || 'Deck laden...' }}</h1>
        <p class="card-count">{{ cardsStore.cards.length }} Karten insgesamt</p>
      </div>
    </header>

    <!-- Toolbar -->
    <div class="toolbar">
      <button @click="showAddModal = true" class="btn btn-primary">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Neue Karte
      </button>
      <RouterLink
        :to="`/decks/${deckId}/learn`"
        class="btn btn-success"
        :class="{ disabled: cardsStore.cards.length === 0 }"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        Lernen starten
      </RouterLink>
      <RouterLink
        :to="`/decks/${deckId}/quiz`"
        class="btn btn-quiz"
        :class="{ disabled: cardsStore.cards.length === 0 }"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        Quiz starten
      </RouterLink>
    </div>

    <!-- Progress Bar -->
    <div v-if="cardsStore.cards.length > 0" class="progress-section">
      <div class="progress-info">
        <span>{{ cardsStore.learnedCards.length }} von {{ cardsStore.cards.length }} gelernt</span>
        <span class="progress-percentage">{{ cardsStore.progressPercentage }}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${cardsStore.progressPercentage}%` }"></div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="cardsStore.loading" class="loading">
      <div class="spinner"></div>
      <p>Karten werden geladen...</p>
    </div>

    <!-- Error -->
    <div v-else-if="cardsStore.error" class="error-message">
      <p>{{ cardsStore.error }}</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="cardsStore.cards.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
          <path d="M7 15h10"></path>
          <path d="M7 11h4"></path>
        </svg>
      </div>
      <h2>Noch keine Karten</h2>
      <p>Füge deine erste Karteikarte hinzu!</p>
      <button @click="showAddModal = true" class="btn btn-primary">
        Erste Karte erstellen
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
            <span class="label">Frage</span>
            <p>{{ card.question }}</p>
          </div>
          <div class="card-divider"></div>
          <div class="card-answer">
            <span class="label">Antwort</span>
            <p>{{ card.answer }}</p>
          </div>
        </div>

        <div class="card-actions">
          <button
            @click="toggleLearned(card.id!)"
            class="btn-status"
            :class="{ active: card.learned }"
          >
            <svg v-if="card.learned" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
            {{ card.learned ? 'Gelernt' : 'Nicht gelernt' }}
          </button>
          <button @click="openEditModal(card)" class="btn-icon" title="Bearbeiten">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button @click="deleteCard(card.id!)" class="btn-icon btn-delete" title="Löschen">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Add Card Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal">
        <h2>Neue Karte erstellen</h2>
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
            <button type="submit" class="btn btn-primary" :disabled="!newQuestion.trim() || !newAnswer.trim()">
              Erstellen
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Card Modal -->
    <div v-if="showEditModal && editingCard" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal">
        <h2>Karte bearbeiten</h2>
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
              Speichern
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

/* Header */
.page-header {
  margin-bottom: 1.5rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  transition: all 0.15s;
  margin-bottom: 1rem;
}

.btn-back:hover {
  background: white;
  color: #1e293b;
  border-color: #cbd5e1;
}

.deck-info h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.card-count {
  color: #64748b;
  margin: 0;
  font-size: 0.9rem;
}

/* Toolbar */
.toolbar {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

/* Progress Section */
.progress-section {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  padding: 1.25rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: #64748b;
}

.progress-percentage {
  font-weight: 700;
  color: #3b82f6;
}

.progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1e3a5f 0%, #3b82f6 100%);
  border-radius: 4px;
  transition: width 0.4s ease;
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;
  color: #64748b;
}

.spinner {
  width: 44px;
  height: 44px;
  border: 3px solid rgba(59, 130, 246, 0.1);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty & Error States */
.empty-state, .error-message {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.empty-icon {
  margin-bottom: 1.5rem;
  color: #94a3b8;
}

.empty-state h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #64748b;
  margin-bottom: 1.5rem;
}

.error-message {
  background: rgba(254, 242, 242, 0.8);
  color: #dc2626;
}

/* Cards List */
.cards-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card-item {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  padding: 1.5rem;
  border-left: 4px solid #e2e8f0;
  transition: all 0.25s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.card-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

.card-item.learned {
  border-left-color: #10b981;
  background: rgba(240, 253, 244, 0.8);
}

.card-content {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1.5rem;
  align-items: start;
  margin-bottom: 1rem;
}

.card-question, .card-answer {
  min-width: 0;
}

.label {
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.card-content p {
  margin: 0;
  color: #1e293b;
  word-wrap: break-word;
  line-height: 1.6;
}

.card-divider {
  width: 1px;
  background: #e2e8f0;
  align-self: stretch;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.btn-status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  background: white;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  color: #64748b;
}

.btn-status:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.btn-status.active {
  background: rgba(16, 185, 129, 0.1);
  border-color: #10b981;
  color: #059669;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.7rem 1.25rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-success {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.25);
}

.btn-success:hover:not(.disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
}

.btn-success.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.btn-quiz {
  background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(168, 85, 247, 0.25);
}

.btn-quiz:hover:not(.disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(168, 85, 247, 0.35);
}

.btn-quiz.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.8);
  color: #475569;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: white;
  border-color: #cbd5e1;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.btn-icon:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2);
}

.modal h2 {
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #1e293b;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.form-group textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s;
}

.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.form-group textarea::placeholder {
  color: #94a3b8;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 500;
  color: #475569;
}

.checkbox-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

@media (max-width: 640px) {
  .deck-detail-view {
    padding: 1rem;
  }

  .toolbar {
    flex-direction: column;
  }

  .toolbar .btn {
    width: 100%;
  }

  .card-content {
    grid-template-columns: 1fr;
  }

  .card-divider {
    width: 100%;
    height: 1px;
  }

  .card-actions {
    flex-wrap: wrap;
  }
}
</style>
