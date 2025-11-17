<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCardsStore } from '@/stores/cards'

const store = useCardsStore()

const newQuestion = ref('')
const newAnswer = ref('')

onMounted(() => {
  store.loadCards()
})

const submitForm = () => {
  if (newQuestion.value.trim() && newAnswer.value.trim()) {
    store.addCard(newQuestion.value, newAnswer.value)
    newQuestion.value = ''
    newAnswer.value = ''
  }
}
</script>

<template>
  <div>
    <h2>Study Cards</h2>

    <!-- ✅ Eingabeformular -->
    <form @submit.prevent="submitForm" style="margin-bottom: 20px;">
      <input
        v-model="newQuestion"
        placeholder="Frage eingeben"
        required
      />
      <input
        v-model="newAnswer"
        placeholder="Antwort eingeben"
        required
      />
      <button type="submit">➕ Karte hinzufügen</button>
    </form>

    <!-- Lade- und Fehlermeldungen -->
    <p v-if="store.loading">Lade Karten...</p>
    <p v-if="store.error" style="color: red">{{ store.error }}</p>

    <!-- Kartenliste -->
    <ul v-if="store.cards.length">
      <li v-for="card in store.cards" :key="card.id">
        <strong>{{ card.question }}</strong> — {{ card.answer }}
      </li>
    </ul>

    <p v-else>Keine Karten gefunden.</p>
  </div>
</template>

<style scoped>
input {
  padding: 6px;
  margin-right: 8px;
}
button {
  padding: 6px 10px;
  cursor: pointer;
}
</style>

