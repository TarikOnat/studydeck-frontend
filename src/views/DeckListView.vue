<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useDecksStore } from '@/stores/decks'
import { RouterLink } from 'vue-router'

const decksStore = useDecksStore()

const showCreateModal = ref(false)
const newDeckTitle = ref('')
const editingDeck = ref<number | null>(null)
const editTitle = ref('')

onMounted(() => {
  decksStore.loadDecks()
})

const createDeck = async () => {
  if (newDeckTitle.value.trim()) {
    await decksStore.createDeck(newDeckTitle.value.trim())
    newDeckTitle.value = ''
    showCreateModal.value = false
  }
}

const startEdit = (deckId: number, currentTitle: string) => {
  editingDeck.value = deckId
  editTitle.value = currentTitle
}

const saveEdit = async (deckId: number) => {
  if (editTitle.value.trim()) {
    await decksStore.updateDeck(deckId, editTitle.value.trim())
    editingDeck.value = null
    editTitle.value = ''
  }
}

const cancelEdit = () => {
  editingDeck.value = null
  editTitle.value = ''
}

const deleteDeck = async (deckId: number, title: string) => {
  if (confirm(`Möchtest du das Deck "${title}" wirklich löschen? Alle Karten werden ebenfalls gelöscht.`)) {
    await decksStore.deleteDeck(deckId)
  }
}

const getCardCount = (deck: any) => {
  return deck.cards?.length || 0
}

const getLearnedCount = (deck: any) => {
  return deck.cards?.filter((c: any) => c.learned).length || 0
}
</script>

<template>
  <div class="deck-list-view">
    <header class="page-header">
      <h1>📚 Meine Decks</h1>
      <button @click="showCreateModal = true" class="btn btn-primary">
        ➕ Neues Deck
      </button>
    </header>

    <!-- Loading State -->
    <div v-if="decksStore.loading" class="loading">
      <div class="spinner"></div>
      <p>Decks werden geladen...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="decksStore.error" class="error-message">
      <p>❌ {{ decksStore.error }}</p>
      <button @click="decksStore.loadDecks()" class="btn btn-secondary">
        🔄 Erneut versuchen
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="decksStore.decks.length === 0" class="empty-state">
      <div class="empty-icon">📭</div>
      <h2>Noch keine Decks vorhanden</h2>
      <p>Erstelle dein erstes Deck und beginne mit dem Lernen!</p>
      <button @click="showCreateModal = true" class="btn btn-primary">
        ➕ Erstes Deck erstellen
      </button>
    </div>

    <!-- Deck Grid -->
    <div v-else class="deck-grid">
      <div v-for="deck in decksStore.decks" :key="deck.id" class="deck-card">
        <div class="deck-header">
          <div v-if="editingDeck === deck.id" class="edit-form">
            <input
              v-model="editTitle"
              @keyup.enter="saveEdit(deck.id!)"
              @keyup.escape="cancelEdit"
              class="edit-input"
              autofocus
            />
            <div class="edit-actions">
              <button @click="saveEdit(deck.id!)" class="btn-icon btn-save">✓</button>
              <button @click="cancelEdit" class="btn-icon btn-cancel">✕</button>
            </div>
          </div>
          <h2 v-else class="deck-title">{{ deck.title }}</h2>
        </div>

        <div class="deck-stats">
          <div class="stat">
            <span class="stat-value">{{ getCardCount(deck) }}</span>
            <span class="stat-label">Karten</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ getLearnedCount(deck) }}</span>
            <span class="stat-label">Gelernt</span>
          </div>
          <div class="stat">
            <div class="progress-ring">
              <svg viewBox="0 0 36 36" class="circular-chart">
                <path class="circle-bg"
                      d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path class="circle"
                      :stroke-dasharray="`${getCardCount(deck) > 0 ? (getLearnedCount(deck) / getCardCount(deck)) * 100 : 0}, 100`"
                      d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
          </div>
        </div>

        <div class="deck-actions">
          <RouterLink :to="`/decks/${deck.id}`" class="btn btn-view">
            📝 Bearbeiten
          </RouterLink>
          <RouterLink
            :to="`/decks/${deck.id}/learn`"
            class="btn btn-learn"
            :class="{ disabled: getCardCount(deck) === 0 }"
          >
            🎓 Lernen
          </RouterLink>
        </div>

        <div class="deck-menu" v-if="editingDeck !== deck.id">
          <button @click="startEdit(deck.id!, deck.title)" class="btn-icon" title="Umbenennen">
            ✏️
          </button>
          <button @click="deleteDeck(deck.id!, deck.title)" class="btn-icon btn-delete" title="Löschen">
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- Create Deck Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal">
        <h2>📚 Neues Deck erstellen</h2>
        <form @submit.prevent="createDeck">
          <div class="form-group">
            <label for="deckTitle">Deck-Name</label>
            <input
              id="deckTitle"
              v-model="newDeckTitle"
              type="text"
              placeholder="z.B. Englisch Vokabeln"
              required
              autofocus
            />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showCreateModal = false" class="btn btn-secondary">
              Abbrechen
            </button>
            <button type="submit" class="btn btn-primary" :disabled="!newDeckTitle.trim()">
              ➕ Erstellen
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.deck-list-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-header h1 {
  font-size: 2rem;
  color: #1f2937;
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

/* Empty State */
.empty-state {
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

/* Error */
.error-message {
  text-align: center;
  padding: 2rem;
  background: #fef2f2;
  border-radius: 12px;
  color: #dc2626;
}

/* Deck Grid */
.deck-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.deck-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

.deck-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
}

.deck-header {
  margin-bottom: 1rem;
}

.deck-title {
  font-size: 1.25rem;
  color: #1f2937;
  margin: 0;
}

.edit-form {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.edit-input {
  flex: 1;
  padding: 0.5rem;
  border: 2px solid #667eea;
  border-radius: 8px;
  font-size: 1rem;
}

.edit-actions {
  display: flex;
  gap: 0.25rem;
}

.deck-stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 12px;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
}

/* Progress Ring */
.progress-ring {
  width: 40px;
  height: 40px;
}

.circular-chart {
  display: block;
  max-width: 100%;
}

.circle-bg {
  fill: none;
  stroke: #e5e7eb;
  stroke-width: 3.8;
}

.circle {
  fill: none;
  stroke: #667eea;
  stroke-width: 3.8;
  stroke-linecap: round;
  transition: stroke-dasharray 0.3s;
}

.deck-actions {
  display: flex;
  gap: 0.75rem;
}

.deck-actions .btn {
  flex: 1;
  justify-content: center;
}

.deck-menu {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.deck-card:hover .deck-menu {
  opacity: 1;
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

.btn-view {
  background: #f0f9ff;
  color: #0369a1;
}

.btn-view:hover {
  background: #e0f2fe;
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
  background: #fef2f2;
}

.btn-save {
  background: #d1fae5;
  color: #059669;
}

.btn-cancel {
  background: #fee2e2;
  color: #dc2626;
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
  max-width: 400px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal h2 {
  margin-bottom: 1.5rem;
  color: #1f2937;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

@media (max-width: 640px) {
  .deck-list-view {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .page-header h1 {
    text-align: center;
  }

  .deck-grid {
    grid-template-columns: 1fr;
  }

  .deck-menu {
    opacity: 1;
  }
}
</style>
