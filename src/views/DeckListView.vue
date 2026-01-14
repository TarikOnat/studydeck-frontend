<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useDecksStore } from '@/stores/decks'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const decksStore = useDecksStore()

const showCreateModal = ref(false)
const newDeckTitle = ref('')
const editingDeck = ref<number | null>(null)
const editTitle = ref('')
const sortBy = ref('newest')

onMounted(() => {
  decksStore.loadDecks()
  if (route.query.create === 'true') {
    showCreateModal.value = true
  }
})

const sortedDecks = computed(() => {
  const decks = [...decksStore.decks]
  switch (sortBy.value) {
    case 'az':
      return decks.sort((a, b) => a.title.localeCompare(b.title))
    case 'za':
      return decks.sort((a, b) => b.title.localeCompare(a.title))
    case 'oldest':
      return decks.sort((a, b) => (a.id || 0) - (b.id || 0))
    case 'newest':
    default:
      return decks.sort((a, b) => (b.id || 0) - (a.id || 0))
  }
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
  if (confirm(`Möchtest du das Deck "${title}" wirklich löschen?`)) {
    await decksStore.deleteDeck(deckId)
  }
}

const getCardCount = (deck: any) => {
  return deck.cards?.length || 0
}

const getLearnedCount = (deck: any) => {
  return deck.cards?.filter((c: any) => c.learned).length || 0
}

const getProgress = (deck: any) => {
  const total = getCardCount(deck)
  if (total === 0) return 0
  return Math.round((getLearnedCount(deck) / total) * 100)
}
</script>

<template>
  <div class="deck-list-view">
    <!-- Page Header -->
    <header class="page-header">
      <h1>Meine Decks</h1>
    </header>

    <!-- Toolbar (immer sichtbar) -->
    <div class="toolbar">
      <div class="toolbar-left">
        <button @click="showCreateModal = true" class="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Neues Deck
        </button>
      </div>
      <div class="toolbar-right" v-if="decksStore.decks.length > 0">
        <div class="sort-dropdown">
          <label for="sort">Sortieren:</label>
          <select id="sort" v-model="sortBy">
            <option value="newest">Neueste zuerst</option>
            <option value="oldest">Älteste zuerst</option>
            <option value="az">A - Z</option>
            <option value="za">Z - A</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="decksStore.loading" class="loading">
      <div class="spinner"></div>
      <p>Wird geladen...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="decksStore.error" class="error-message">
      <p>{{ decksStore.error }}</p>
      <button @click="decksStore.loadDecks()" class="btn btn-secondary">
        Erneut versuchen
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="decksStore.decks.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      </div>
      <h2>Noch keine Decks vorhanden</h2>
      <p>Erstelle dein erstes Deck und beginne mit dem Lernen.</p>
      <button @click="showCreateModal = true" class="btn btn-primary">
        Erstes Deck erstellen
      </button>
    </div>

    <!-- Deck Grid -->
    <div v-else class="deck-grid">
      <div v-for="deck in sortedDecks" :key="deck.id" class="deck-card">
        <!-- Edit/Delete Menu -->
        <div class="deck-menu" v-if="editingDeck !== deck.id">
          <button @click="startEdit(deck.id!, deck.title)" class="btn-icon" title="Umbenennen">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button @click="deleteDeck(deck.id!, deck.title)" class="btn-icon btn-delete" title="Löschen">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
            </svg>
          </button>
        </div>

        <div class="deck-content">
          <!-- Progress Circle -->
          <div class="progress-circle">
            <svg viewBox="0 0 36 36">
              <path class="circle-bg"
                    d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path class="circle"
                    :stroke-dasharray="`${getProgress(deck)}, 100`"
                    d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span class="progress-text">{{ getProgress(deck) }}%</span>
          </div>

          <!-- Deck Info -->
          <div class="deck-info">
            <div v-if="editingDeck === deck.id" class="edit-form">
              <input
                v-model="editTitle"
                @keyup.enter="saveEdit(deck.id!)"
                @keyup.escape="cancelEdit"
                class="edit-input"
                autofocus
              />
              <div class="edit-actions">
                <button @click="saveEdit(deck.id!)" class="btn-icon btn-save">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </button>
                <button @click="cancelEdit" class="btn-icon btn-cancel">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
            <h2 v-else class="deck-title">{{ deck.title }}</h2>
            <p class="deck-meta">{{ getCardCount(deck) }} Karten · {{ getLearnedCount(deck) }} gelernt</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="deck-actions">
          <RouterLink :to="`/decks/${deck.id}`" class="btn btn-secondary">
            Bearbeiten
          </RouterLink>
          <RouterLink
            :to="`/decks/${deck.id}/learn`"
            class="btn btn-success"
            :class="{ disabled: getCardCount(deck) === 0 }"
          >
            Lernen
          </RouterLink>
          <RouterLink
            :to="`/decks/${deck.id}/quiz`"
            class="btn btn-quiz"
            :class="{ disabled: getCardCount(deck) === 0 }"
          >
            Quiz
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Create Deck Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal">
        <h2>Neues Deck erstellen</h2>
        <form @submit.prevent="createDeck">
          <div class="form-group">
            <label for="deckTitle">Name</label>
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
              Erstellen
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.deck-list-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

/* Page Header */
.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
}

.page-subtitle {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
}

/* Toolbar */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.toolbar-left {
  display: flex;
  gap: 0.75rem;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sort-dropdown {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-dropdown label {
  font-size: 0.875rem;
  color: #64748b;
  white-space: nowrap;
}

.sort-dropdown select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.15s;
}

.sort-dropdown select:hover {
  border-color: #cbd5e1;
}

.sort-dropdown select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
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

/* Empty State */
.empty-state {
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

/* Error */
.error-message {
  text-align: center;
  padding: 2rem;
  background: rgba(254, 242, 242, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  color: #dc2626;
}

/* Deck Grid */
.deck-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;
}

.deck-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  padding: 1.5rem;
  position: relative;
  transition: all 0.25s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.deck-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  border-color: rgba(59, 130, 246, 0.3);
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

.deck-content {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

/* Progress Circle */
.progress-circle {
  position: relative;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
}

.progress-circle svg {
  transform: rotate(-90deg);
}

.circle-bg {
  fill: none;
  stroke: #e2e8f0;
  stroke-width: 3;
}

.circle {
  fill: none;
  stroke: #3b82f6;
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dasharray 0.4s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
}

/* Deck Info */
.deck-info {
  flex: 1;
  min-width: 0;
}

.deck-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.deck-meta {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

.edit-form {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.edit-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 2px solid #3b82f6;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
}

.edit-input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.edit-actions {
  display: flex;
  gap: 0.25rem;
}

/* Actions */
.deck-actions {
  display: flex;
  gap: 0.75rem;
}

.deck-actions .btn {
  flex: 1;
  justify-content: center;
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

.btn-primary:hover:not(:disabled):not(.disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
}

.btn-primary:disabled,
.btn-primary.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.btn-success {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.25);
}

.btn-success:hover:not(:disabled):not(.disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
}

.btn-success:disabled,
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

.btn-quiz:hover:not(:disabled):not(.disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(168, 85, 247, 0.35);
}

.btn-quiz:disabled,
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
  width: 34px;
  height: 34px;
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

.btn-save {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.btn-cancel {
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
  max-width: 420px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2);
}

.modal h2 {
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #1e293b;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.form-group input::placeholder {
  color: #94a3b8;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

@media (max-width: 640px) {
  .deck-list-view {
    padding: 1rem;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left {
    order: 2;
  }

  .toolbar-left .btn {
    width: 100%;
  }

  .toolbar-right {
    order: 1;
    justify-content: flex-end;
  }

  .deck-grid {
    grid-template-columns: 1fr;
  }

  .deck-menu {
    opacity: 1;
  }

  .deck-actions {
    flex-wrap: wrap;
  }
}
</style>
