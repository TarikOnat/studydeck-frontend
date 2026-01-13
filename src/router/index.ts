import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { title: 'StudyDeck - Home' }
    },
    {
      path: '/decks',
      name: 'decks',
      component: () => import('../views/DeckListView.vue'),
      meta: { title: 'Meine Decks' }
    },
    {
      path: '/decks/:id',
      name: 'deck-detail',
      component: () => import('../views/DeckDetailView.vue'),
      meta: { title: 'Deck Details' }
    },
    {
      path: '/decks/:id/learn',
      name: 'learn',
      component: () => import('../views/LearnView.vue'),
      meta: { title: 'Lernmodus' }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
      meta: { title: '404 - Nicht gefunden' }
    }
  ]
})

// Update document title on route change
router.beforeEach((to, from, next) => {
  document.title = (to.meta.title as string) || 'StudyDeck'
  next()
})

export default router
