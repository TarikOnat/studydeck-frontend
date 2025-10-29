<script setup lang="ts">
import { useCardsStore } from '@/stores/cards'
const store = useCardsStore()
</script>

<template>
  <div>
    <h2>Study Cards</h2>
    <ul>
      <li v-for="card in store.cards" :key="card.question">
        <strong>{{ card.question }}</strong> — {{ card.answer }}
      </li>
    </ul>
  </div>
</template>
