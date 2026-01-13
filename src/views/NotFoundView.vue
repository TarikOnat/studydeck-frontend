<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="not-found">
    <div class="content">
      <div class="error-code">404</div>
      <h1>Seite nicht gefunden</h1>
      <p>Die gesuchte Seite existiert leider nicht.</p>
      <RouterLink to="/" class="btn btn-primary">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        Zur Startseite
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}

.content {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.error-code {
  font-size: 7rem;
  font-weight: 800;
  background: linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 1rem 0 0.5rem;
}

p {
  color: #64748b;
  margin-bottom: 2rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
}
</style>
