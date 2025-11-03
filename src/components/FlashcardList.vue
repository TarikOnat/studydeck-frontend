<script setup lang="ts">
import { onMounted } from 'vue'
import { useCardsStore } from '@/stores/cards'

const store = useCardsStore()

onMounted(() => {
  store.loadCards()
})
</script>

<template>
  <div>
    <h2>Study Cards</h2>

    <p v-if="store.loading">Lade Karten...</p>
    <p v-if="store.error" style="color: red">{{ store.error }}</p>

    <ul v-if="store.cards.length">
      <li v-for="card in store.cards" :key="card.id">
        <strong>{{ card.question }}</strong> — {{ card.answer }}
      </li>
    </ul>

    <p v-else>Keine Karten gefunden.</p>
  </div>
</template>
