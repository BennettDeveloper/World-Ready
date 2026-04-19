# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

World-Ready is a culturally-aware mock interview simulator. Users select a region on a 3D globe, then practice interviews with an AI hiring persona specific to that region's cultural style. The app uses speech recognition, region-specific scoring, and personalized coaching feedback.

## Commands

### Frontend (client/)
```bash
cd client
npm install
npm run dev       # Vite dev server with HMR, proxies /api → localhost:8080
npm run build     # Production build to dist/
npm run lint      # ESLint check
npm run preview   # Preview production build locally
```

### Backend (backend/)
```bash
cd backend
./mvnw spring-boot:run   # Start Spring Boot on port 8080
./mvnw clean install     # Full Maven build
./mvnw test              # Run Spring Boot tests
```

### Required Environment Variable
```bash
export ANTHROPIC_API_KEY=your_key_here  # Required for backend Claude API calls
```

## Architecture

This is a monorepo with two active parts: a React/Vite frontend (`client/`) and a Spring Boot backend (`backend/`). The `server/` directory is legacy and unused.

### How They Connect
- Vite dev server proxies all `/api/*` requests to `http://localhost:8080` (configured in `vite.config.js`)
- The backend is primarily an API gateway to Claude — it holds no persistent state
- Frontend uses localStorage for all user data (auth, history, leaderboard, resumes)

### Backend (Spring Boot, Java 17)
Located in `backend/src/main/java/com/worldready/backend/`:

- **`ClaudeService`** — sends prompts to Anthropic API via `RestTemplate`, parses response
- **`PersonaService`** — in-memory map of 8 regional hiring personas (no DB)
- **`InterviewService`** — orchestrates interview flow: builds system prompts with persona, calls Claude for questions
- **`ScoringService`** — sends full conversation history to Claude with a JSON schema, gets back structured scores and feedback
- **`InterviewController`** — three REST endpoints: `POST /api/start-interview`, `POST /api/next-question`, `POST /api/analyze`

PostgreSQL is listed as a Maven dependency but **not configured** — no DB connection exists. All backend state is in-memory or in Claude's context.

Claude model used: `claude-haiku-4-5-20251001`. Config in `backend/src/main/resources/application.yaml`.

### Frontend (React 19, Vite)
Key architectural points:

**Interview Flow:** `LandingPage` (region/role selection) → `InterviewScreen` (speech + Claude questions) → `ResultsScreen` (scores + coaching)

**Auth:** Entirely client-side. `utils/auth.js` stores users in `localStorage` under `wr_users`. Session stored under `wr_session`. No backend auth.

**Scoring:** `ResultsScreen` first tries `POST /api/analyze` (AI scoring). If that fails, falls back to `utils/scoring.js` (keyword matching).

**Globe:** `LandingPage` lazy-loads `WorldMap` → `Globe.jsx` (react-globe.gl + THREE.js). Clicking a region arc sets the selected region.

**Data:** All 8 regions with their personas, questions, and cultural traits are defined in `client/src/data/regions.js`.

**LocalStorage keys:**
- `wr_users` — array of all users
- `wr_session` — current logged-in user
- `wr_history_${userId}` — interview history (max 20)
- `wr_leaderboard` — global rankings (max 100)
- `wr_resume_${userId}` — user's uploaded resume text
- `wr_pending_session` — interview config passed from LandingPage to InterviewScreen

### The 8 Regions
London, Mumbai, Tokyo, New York, Paris, Dubai, Sydney, Beijing — each has a named persona with a distinct cultural interview style defined in both `PersonaService.java` (backend system prompts) and `regions.js` (frontend UI data).

## Key Patterns

- **CORS** is open (`@CrossOrigin(origins = "*")`) on the backend controller — fine for hackathon, not production
- **Speech Recognition** uses the browser Web Speech API with text input fallback
- **Coaching** is generated two ways: rule-based in `utils/coaching.js`, or AI-powered by calling `generateCoachingFromAI()` which transforms backend feedback into tips
- **Max 3 questions** per interview session — enforced in both `InterviewService.java` and `InterviewScreen.jsx`
