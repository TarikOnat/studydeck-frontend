<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="home">
    <div class="hero">
      <div class="hero-content">
        <h1>📚 StudyDeck</h1>
        <p class="tagline">Dein persönlicher Lernbegleiter für effektives Lernen mit Karteikarten</p>

        <div class="features">
          <div class="feature">
            <span class="feature-icon">🎯</span>
            <h3>Gezielt lernen</h3>
            <p>Erstelle eigene Decks und Karteikarten für jedes Thema</p>
          </div>
          <div class="feature">
            <span class="feature-icon">🔄</span>
            <h3>Interaktiv üben</h3>
            <p>Drehe Karten um und teste dein Wissen im Lernmodus</p>
          </div>
          <div class="feature">
            <span class="feature-icon">📊</span>
            <h3>Fortschritt verfolgen</h3>
            <p>Behalte den Überblick über deinen Lernfortschritt</p>
          </div>
        </div>

        <div class="cta-buttons">
          <RouterLink to="/decks" class="btn btn-primary">
            🚀 Jetzt starten
          </RouterLink>
          <RouterLink to="/stats" class="btn btn-secondary">
            📈 Statistiken
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  min-height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero {
  text-align: center;
  padding: 2rem;
  max-width: 900px;
}

.hero-content h1 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tagline {
  font-size: 1.3rem;
  color: #6b7280;
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.feature {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.75rem;
}

.feature h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.feature p {
  font-size: 0.9rem;
  color: #6b7280;
  line-height: 1.5;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
}

@media (max-width: 640px) {
  .hero-content h1 {
    font-size: 2.5rem;
  }

  .tagline {
    font-size: 1.1rem;
  }

  .features {
    grid-template-columns: 1fr;
  }
}
</style>
