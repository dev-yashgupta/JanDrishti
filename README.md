# JanDrishti AI — Frontend

**An AI-Powered Platform for Discovering and Prioritising Unresolved Community Problems in India**

> ⚡ This is the **frontend** sub-project. The backend (FastAPI + PostgreSQL) lives in `../backend/`.

---

## Overview

JanDrishti AI is a civic intelligence platform that transforms scattered community reports into prioritised, geographically actionable problems. Citizens report issues, AI classifies and scores them, and authority dashboards surface what needs attention most urgently.

### The Core Workflow

```
Report → AI Analysis → Classification → Duplicate Detection
       → Priority Score → Geographic Clustering → Authority Dashboard
       → Assignment → Resolution → Citizen Verification → Closed
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI primitives + custom shadcn-style system |
| State | Zustand (auth + UI stores) |
| Forms | React Hook Form + Zod v4 |
| Charts | Recharts |
| Maps | Leaflet / React-Leaflet (dynamic import, SSR-safe) |
| i18n | Custom I18nContext (EN + HI, extensible) |
| Icons | Lucide React |

---

## Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── (public)/               # /, /about, /login, /register, /explore
│   ├── dashboard/              # Citizen dashboard
│   ├── report/                 # Report submission wizard
│   ├── reports/[id]/           # Report detail
│   ├── notifications/          # Citizen notifications
│   ├── profile/                # User profile
│   └── admin/                  # Authority portal
│       ├── dashboard/          # KPI dashboard + charts
│       ├── problems/[id]/      # Problem detail + status workflow
│       ├── map/                # Interactive Leaflet map
│       ├── clusters/           # Problem clusters (AI grouped)
│       ├── analytics/          # Full analytics page
│       ├── assignments/        # Assign problems to departments
│       ├── users/              # User management
│       └── settings/           # AI config, weights, thresholds
├── components/
│   ├── ui/                     # Base primitives (Button, Card, Input…)
│   ├── layout/                 # Navbar, Sidebar, AppShell, Footer
│   ├── shared/                 # ReportCard, PriorityBadge, AIAnalysisCard…
│   ├── charts/                 # Recharts wrappers
│   ├── maps/                   # ProblemsMap (Leaflet, dynamic)
│   ├── forms/                  # LoginForm, RegisterForm
│   └── pages/                  # Full page components
├── contexts/                   # I18nContext
├── hooks/                      # useAuth, useReports, useToast
├── lib/                        # utils, constants, validations
├── locales/                    # en.ts, hi.ts translations
├── services/                   # api.ts (HTTP layer), mockData.ts
├── store/                      # authStore, uiStore (Zustand)
└── types/                      # index.ts — all TypeScript types
```

---

## Pages

### Public
| Route | Description |
|---|---|
| `/` | Landing page with hero, how-it-works, live critical problems |
| `/about` | Platform overview, AI architecture, priority formula |
| `/login` | Login with demo account shortcuts |
| `/register` | Multi-field registration (citizen or authority) |
| `/explore` | Browse/search/filter all problems publicly |

### Citizen (authenticated)
| Route | Description |
|---|---|
| `/dashboard` | Summary stats + my reports list |
| `/report` | 4-step report wizard with live AI preview |
| `/reports` | All my reports |
| `/reports/[id]` | Full report detail, status timeline, AI card |
| `/notifications` | In-app notification list |
| `/profile` | Edit personal details |

### Authority / Admin
| Route | Description |
|---|---|
| `/admin/dashboard` | KPI cards + charts + critical problems |
| `/admin/problems` | Filterable, sortable problems list |
| `/admin/problems/[id]` | Detail + status workflow + assignment actions |
| `/admin/map` | Interactive Leaflet map with priority-coloured markers |
| `/admin/clusters` | AI-detected problem clusters with expandable reports |
| `/admin/analytics` | Full analytics: category, status, priority, city, timeline |
| `/admin/assignments` | Assign unassigned problems to departments |
| `/admin/users` | View + activate/deactivate platform users |
| `/admin/settings` | Configure AI weights, similarity thresholds |

---

## Setup

### Prerequisites
- Node.js 18+
- npm 9+

### Install & run

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

The app runs at **http://localhost:3000**.

### Demo mode

By default `NEXT_PUBLIC_USE_MOCK=true` — the app runs entirely on synthetic demo data with no backend required.

### Demo accounts (pre-filled on the login page)

| Role | Email | Password |
|---|---|---|
| Citizen | citizen@demo.jandrishti.in | Demo@1234 |
| Authority | authority@demo.jandrishti.in | Demo@1234 |
| Super Admin | admin@demo.jandrishti.in | Demo@1234 |

---

## Connecting the Backend

1. Start the FastAPI backend (see `../backend/README.md`)
2. Set `NEXT_PUBLIC_API_URL=http://localhost:8000/api` in `.env.local`
3. Set `NEXT_PUBLIC_USE_MOCK=false`
4. Restart the dev server

---

## Build

```bash
npm run build   # Production build
npm start       # Serve production build
```

---

## AI Architecture (Frontend)

The frontend includes a **local NLP simulation** (`simulateAI` in `ReportProblemPage.tsx`) that:
- Detects danger/health/persistence keywords in report text
- Calculates severity, urgency, frequency, community impact, persistence scores (1–10)
- Computes a weighted priority score (0–100)
- Displays reasoning inline before submission

This runs entirely in the browser — no backend required for the AI preview. When the backend is connected, the real AI pipeline (Python, scikit-learn, sentence-transformers) takes over.

### Priority Formula

```
priority_score =
  (severity × 0.30
  + urgency × 0.25
  + frequency × 0.20
  + community_impact × 0.15
  + persistence × 0.10) × 10
```

| Score | Level |
|---|---|
| 75–100 | CRITICAL |
| 50–74 | HIGH |
| 25–49 | MEDIUM |
| 0–24 | LOW |

---

## Multilingual Architecture

- `src/locales/en.ts` — English translations
- `src/locales/hi.ts` — Hindi translations
- `src/contexts/I18nContext.tsx` — React context + `useI18n()` hook
- Add a new language by creating `src/locales/xx.ts` and registering it

Currently supported: English, Hindi. Translations for Tamil, Telugu, Marathi, Bengali, Gujarati, Kannada are scaffolded.

---

## Responsible AI Notice

AI analysis is a **decision-support tool only**. Authorities are responsible for all final decisions. AI predictions may be incorrect. Citizen reports should undergo appropriate verification before official action.

---

## Known Limitations (Demo)

- Authentication calls mock the backend — tokens are simulated
- File uploads are accepted by the UI but not persisted without the backend
- Map coordinates come from seeded demo data; real GPS pinning requires browser geolocation integration
- Multilingual AI classification is not yet implemented — the current model only supports English text

---

## License

For demonstration purposes only. Not intended for production use without backend integration and compliance review.
