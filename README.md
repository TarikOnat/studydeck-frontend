# 📚 StudyDeck - Karteikarten Lernapp

Eine moderne Karteikarten-Lernapp, entwickelt mit Vue.js 3 und Spring Boot für das WebTech-Modul an der HTW Berlin (WiSe 2025/26).

## 🌐 Live Demo

- **Frontend:** https://htw-studydeck-frontend.onrender.com
- **Backend API:** https://htw-studydeck-backend.onrender.com

## 🚀 Features

- **Deck-Verwaltung:** Erstellen, bearbeiten und löschen von Karteikarten-Decks
- **Karten-Management:** Hinzufügen, bearbeiten und löschen von Karteikarten
- **Interaktiver Lernmodus:** Karten umdrehen mit Flip-Animation
- **Fortschrittsverfolgung:** Statistiken und Fortschrittsanzeige pro Deck
- **Wiederholung:** Falsche Karten gezielt wiederholen
- **Responsive Design:** Optimiert für Desktop und Mobile

## 🛠️ Technologien

### Frontend
- Vue.js 3 (Composition API)
- TypeScript
- Pinia (State Management)
- Vue Router
- Axios
- Vitest (Testing)

### Backend
- Java 21
- Spring Boot 3
- Spring Data JPA
- PostgreSQL
- JUnit 5 + Mockito (Testing)

## 📦 Installation & Setup

### Voraussetzungen
- Node.js 20+
- Java 21
- Maven
- PostgreSQL (oder H2 für lokale Entwicklung)

### Frontend starten
```bash
cd studydeck-frontend
npm install
npm run dev
```

Frontend läuft auf: http://localhost:5173

### Backend starten
```bash
cd todo-app
mvn spring-boot:run
```

Backend läuft auf: http://localhost:8080

## 🧪 Tests ausführen

### Frontend Tests
```bash
npm run test:unit
```

### Backend Tests
```bash
mvn test
```

## 📁 Projektstruktur

### Frontend
```
src/
├── views/              # Seiten-Komponenten
│   ├── HomeView.vue
│   ├── DeckListView.vue
│   ├── DeckDetailView.vue
│   ├── LearnView.vue
│   └── StatsView.vue
├── stores/             # Pinia Stores
│   ├── cards.ts
│   └── decks.ts
├── router/             # Vue Router
├── App.vue
└── main.ts
```

### Backend
```
src/main/java/htw/webtech/todo_app/
├── controller/         # REST Controller
│   ├── CardController.java
│   └── DeckController.java
├── service/            # Business Logic
│   ├── CardService.java
│   └── DeckService.java
├── repository/         # Data Access
│   ├── CardRepository.java
│   └── DeckRepository.java
└── entity/             # JPA Entities
    ├── Card.java
    └── Deck.java
```

## 🎯 Use Cases

| # | Use Case | Beschreibung |
|---|----------|--------------|
| 1 | Deck erstellen | Neues Karteikarten-Deck anlegen |
| 2 | Deck anzeigen | Alle Decks in Übersicht anzeigen |
| 3 | Deck löschen | Deck mit allen Karten entfernen |
| 4 | Karte erstellen | Neue Karteikarte zu Deck hinzufügen |
| 5 | Karte bearbeiten | Frage/Antwort einer Karte ändern |
| 6 | Karte löschen | Karteikarte aus Deck entfernen |
| 7 | Lernmodus | Karten umdrehen und lernen |
| 8 | Als gelernt markieren | Karte als gelernt/nicht gelernt setzen |
| 9 | Statistiken | Fortschritt pro Deck anzeigen |
| 10 | Falsche wiederholen | Nur nicht gewusste Karten üben |

## 🔗 API Endpoints

### Decks
| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/api/decks` | Alle Decks abrufen |
| GET | `/api/decks/{id}` | Einzelnes Deck abrufen |
| POST | `/api/decks` | Neues Deck erstellen |
| PUT | `/api/decks/{id}` | Deck aktualisieren |
| DELETE | `/api/decks/{id}` | Deck löschen |

### Cards
| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/api/cards` | Alle Karten abrufen |
| GET | `/api/cards/deck/{deckId}` | Karten eines Decks |
| POST | `/api/cards` | Neue Karte erstellen |
| PUT | `/api/cards/{id}` | Karte aktualisieren |
| DELETE | `/api/cards/{id}` | Karte löschen |

## 👨‍💻 Autor

**Tarik** - HTW Berlin, WebTech WiSe 2025/26
