# 🌐 World Ready

> *"In a world where everyone is interview ready, the candidates who stand out will be the ones who are World-Ready."*

**World Ready** is a cross-cultural AI interview simulation platform built for [HornetHacks 2026](https://hornethacks.com) under the theme *"The Great Mashup — Where Unlikely Worlds Collide."*

We mashup two powerful APIs to create something that didn't exist before: **Anthropic Claude AI** × **Google Maps Timezone API**, combining intelligent conversation with real-time cultural context so every practice session mirrors the actual room you'll be sitting in, anywhere on Earth.

---

## The Problem

Most interview prep tools help you craft answers. None of them prepare you for the *room* — the unspoken norms, the cultural expectations, the interviewer's mood at 9 PM on a rainy Tuesday in Tokyo versus 10 AM on a Monday in Dubai. That gap could be what costs candidates the job.

## The Solution

World-Ready puts you in front of a culturally authentic AI interviewer, tuned to the real-time context of their city. Pick your location, enter your job title, and step into a live simulation where the interviewer's persona, patience level, and energy shifts based on who they are *and what time it is there right now*.

---

## Features

### 🌍 8 Global Interview Rooms
Each room has a fully realized interviewer persona with unique:
- Communication style (formal British reserve, warm Mumbai energy, direct Silicon Valley efficiency, etc.)
- Personality traits, transitions, and closing lines
- Region-specific gibberish detection responses
- Custom questions tailored to professional culture

**Available cities:** London · Mumbai · New York · Tokyo · Paris · Dubai · São Paulo · Sydney

### 🕐 Live Time Context (Google Maps Timezone API)
Before every session, we fetch the current local time at your chosen city. The interviewer's mood is adjusted accordingly — a late-night London session feels different from a morning one. The AI system prompt is prefixed with real-time context:
- Time of day (morning / afternoon / evening / late night)
- Day of week (weekday vs. weekend)
- A natural-language context string passed to Claude

### 🤖 AI-Powered Scoring (Anthropic Claude API)
After each session, your conversation is sent to Claude for analysis across five dimensions:
- **Cultural Fluency** — did you adapt to the interviewer's style?
- **Communication Clarity** — structured, coherent answers
- **Confidence** — assertiveness without arrogance
- **Role Alignment** — relevance to the job
- **Overall** — weighted composite score (0–100)

Falls back to keyword-based scoring if the backend is unavailable.

### 🎙 Voice Input
HTML5 Web Speech API with continuous recognition, interim transcript display, and a final answer compiled on stop.

### 🌐 Interactive 3D Globe
A `react-globe.gl` globe with city pins. Click a pin to select a region. The globe lazy-loads for fast initial paint.

### 📊 Session History & Leaderboard
- Every completed session is saved to localStorage under the user's account
- A global leaderboard ranks performance by region, role, and difficulty
- Profile page shows score history and regional achievements

### ⚡ Demo Mode
Judges and evaluators can enter a pre-seeded demo account in one click , no sign-up required. The demo account includes 5 pre-loaded sessions across London, Tokyo, New York, Paris, and Dubai.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite, React Router v6 |
| Styling | Custom CSS design system ("Intelligence Network") — dark navy, cyan, violet, glassmorphism |
| Globe | react-globe.gl (lazy loaded) |
| Voice | HTML5 Web Speech API |
| Backend | Spring Boot (Java 21) |
| AI | Anthropic Claude API (`claude-haiku-4-5-20251001`) |
| Time Context | Google Maps Timezone API |
| Auth | localStorage-based session (no external auth service) |

---

## Design System

The UI is built around a concept we call **"controlled darkness with one electric moment of light"**, inspired by intelligence dashboards and mission control interfaces.

- **Background:** `#020d1a` deep navy with a 60px grid overlay
- **Primary accent:** `#00d2ff` cyan
- **Secondary accent:** `#c472f0` violet
- **Fonts:** Syne (display/headings) + Space Grotesk (UI/body)
- **Panels:** glassmorphism — `rgba(5,21,37,0.85)` + `blur(20px)` + cyan border
- **Region theming:** each interview room uses its flag's native colors for card borders and chat bubble accents

---

## Architecture

```
client/src/
  pages/          — PublicLandingPage, LandingPage, InterviewScreen, ResultsScreen, ...
  components/     — WorldMap (globe), Navbar, Timer, StatBar, CoachingCard, ...
  data/           — regions.js (all 8 interview personas + questions)
  utils/          — auth.js, storage.js, scoring.js, coaching.js, maps.js, validation.js
  styles/         — variables.css, globals.css, landing.css, interview.css, results.css, ...

server/src/main/java/
  controller/     — InterviewController (start, next question, analyze endpoints)
  service/        — InterviewService, ScoringService, GoogleMapsService
  model/          — Request/Response DTOs
```

### Key Data Flow

1. User selects region on globe → `getCityTimeContext()` fetches live timezone data
2. Home page stores full session config (region, role, difficulty, time context) in `localStorage`
3. `InterviewScreen` reads config, drives question flow client-side from `regions.js`
4. Each answer is stored locally; `handleFinish` passes full conversation to `ResultsScreen`
5. `ResultsScreen` calls `POST /api/analyze` → Spring Boot → Claude API → AI scores + feedback

---

## Running Locally

### Prerequisites
- Node.js 18+
- Java 21+
- Maven
- Anthropic API key
- Google Maps API key (Timezone API enabled)

### Frontend
```bash
cd client
npm install
npm run dev
# → http://localhost:5173
```

### Backend
```bash
cd server
# Set environment variables:
# ANTHROPIC_API_KEY=your_key
# GOOGLE_MAPS_API_KEY=your_key
mvn spring-boot:run
# → http://localhost:8080
```

The Vite dev server proxies `/api/*` to `localhost:8080`.

### Demo Account
On the login page, click **"⚡ Enter Demo Mode"** — no credentials needed.

---

## Team

| Name | Role |
|---|---|
| **Bobby Money** | Project Lead & Full-Stack Developer |
| **Chris Bennett** | AI Model Lead & Product Owner |
| **Derwin Bell** | Back End Lead & Systems |
| **James Kollilon Barclay III** | Front End Developer & Design Lead |

---

## Hackathon Context

**Event:** HornetHacks 2026  
**Theme:** The Great Mashup — Where Unlikely Worlds Collide  
**Our Mashup:** Anthropic Claude API (conversational AI) + Google Maps Timezone API (real-world context)  
**Track:** AI / Developer Tools

The insight behind our mashup: time is cultural. A 9 PM interview in London carries different social weight than a 9 AM one. By injecting the interviewer's local time into Claude's system prompt, we bridge the gap between "AI chatbot" and "culturally aware human being" — making practice sessions that actually prepare you for the real thing.

---

*Built with intention at HornetHacks 2026.*
