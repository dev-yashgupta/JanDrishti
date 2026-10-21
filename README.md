# JanDrishti AI

**An AI-Powered Platform for Discovering and Prioritising Unresolved Community Problems in India**

> See a Problem. Report It. Prioritise It. Resolve It.

---

## What Is JanDrishti AI?

JanDrishti AI is a civic intelligence platform that transforms scattered community reports into prioritised, geographically actionable problems. Citizens report issues, AI classifies and scores them, and authority dashboards surface what needs attention most urgently.

### The Core Workflow

```
Report → AI Analysis → Classification → Duplicate Detection
       → Priority Score → Geographic Clustering → Authority Dashboard
       → Assignment → Resolution → Citizen Verification → Closed
```

---

## Monorepo Structure

```
JanDrishti/
├── frontend/          # Next.js 16 + TypeScript + Tailwind CSS
│   ├── src/app/       # App Router pages (21 routes)
│   ├── src/components/# UI components, charts, maps
│   ├── src/services/  # API service layer + mock data
│   └── Dockerfile
│
├── backend/           # FastAPI + PostgreSQL + AI/NLP
│   ├── app/
│   │   ├── api/routes/  # 9 routers (auth, reports, dashboard, etc.)
│   │   ├── models/      # 14 SQLAlchemy models
│   │   ├── schemas/     # Pydantic validation
│   │   ├── ai/          # Classifier, scoring, similarity, Gemini LLM
│   │   ├── core/        # Config, security, RBAC
│   │   └── database/    # Session + Alembic
│   ├── alembic/        # Migrations
│   ├── scripts/seed.py # Demo data
│   ├── tests/          # 45 tests (auth, reports, AI)
│   └── Dockerfile
│
├── docker-compose.yml  # Full stack: PostgreSQL + Backend + Frontend
├── .env.example        # Root-level env template
└── README.md           # This file
```

---

## Quick Start

### Option A — Docker (recommended, everything in one command)

```bash
cd JanDrishti
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8000/api/docs
- Database: localhost:5432

Seed demo data:
```bash
docker compose exec backend python scripts/seed.py
```

### Option B — Local development (frontend + backend separately)

**Backend:**
```bash
cd JanDrishti/backend
pip install -r requirements.txt
cp .env.example .env                    # Set DATABASE_URL + SECRET_KEY
# Create PostgreSQL database:
#   CREATE USER jandrishti WITH PASSWORD 'jandrishti_pass';
#   CREATE DATABASE jandrishti_db OWNER jandrishti;
alembic upgrade head                    # Run migrations
python scripts/seed.py                  # Seed demo data
uvicorn app.main:app --reload           # Start at :8000
```

**Frontend:**
```bash
cd JanDrishti/frontend
npm install
cp .env.example .env.local              # NEXT_PUBLIC_USE_MOCK=true for demo mode
npm run dev                             # Start at :3000
```

For real backend integration, set `NEXT_PUBLIC_USE_MOCK=false` and `NEXT_PUBLIC_API_URL=http://localhost:8000/api` in `frontend/.env.local`.

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Citizen | citizen@demo.jandrishti.in | Demo@1234 |
| Authority | authority@demo.jandrishti.in | Demo@1234 |
| Super Admin | admin@demo.jandrishti.in | Demo@1234 |

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 16 (App Router) | Framework |
| React 19 + TypeScript | UI + type safety |
| Tailwind CSS v4 | Styling |
| Radix UI primitives | Accessible components |
| Recharts | Analytics charts |
| Leaflet / React-Leaflet | Interactive maps |
| Zustand | State management |
| React Hook Form + Zod | Form validation |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI 0.157 | Web framework |
| Python 3.11+ | Language |
| SQLAlchemy 2.1 | ORM |
| PostgreSQL 16 | Database |
| Alembic | Migrations |
| python-jose (JWT) | Authentication |
| bcrypt | Password hashing |
| Pydantic v2 | Validation |
| Google Gemini API (optional) | LLM-based AI |

### AI / NLP
| Component | Implementation |
|---|---|
| Classifier | Keyword rules (local) or Gemini LLM (optional) |
| Similarity | Pure-Python TF-IDF + cosine similarity + haversine geo filter |
| Severity / Urgency | Keyword pattern scoring + optional Gemini refinement |
| Priority Engine | Weighted formula (severity 30%, urgency 25%, frequency 20%, impact 15%, persistence 10%) |

---

## Key Features

- **Citizen reporting** — Multi-step wizard with location, photos, live AI preview
- **AI classification** — 12 civic categories with confidence scores
- **Priority scoring** — Transparent 0–100 score with explainable breakdown
- **Duplicate detection** — TF-IDF similarity + geographic radius filtering
- **Problem clusters** — Auto-grouped similar reports with AI summaries
- **Status workflow** — REPORTED → UNDER_REVIEW → VERIFIED → ASSIGNED → IN_PROGRESS → RESOLVED → CITIZEN_VERIFICATION → CLOSED
- **Authority dashboard** — KPI cards, charts, critical problem alerts
- **Interactive map** — Priority-coloured markers with info popups and filters
- **Analytics** — Category, status, priority, city, timeline charts
- **Notifications** — In-app notifications for status changes
- **Multilingual** — English + Hindi translations, extensible to 8 Indic languages
- **Role-based access** — Citizen, Authority, Super Admin with JWT auth
- **File uploads** — Images (JPEG/PNG/WEBP) and video (MP4) with validation
- **Audit logs** — Administrative action trail
- **Configurable AI** — Admin can adjust similarity thresholds and priority weights

---

## Enabling Gemini AI (Optional)

The backend includes a Gemini LLM provider for enhanced multilingual classification and scoring. Without it, a pure-Python local engine handles everything.

1. Get a free API key at https://aistudio.google.com/apikey
2. Add to `backend/.env`:
   ```
   GEMINI_API_KEY=your-key-here
   AI_PROVIDER=auto
   ```
3. Restart the backend

Check which provider is active:
```bash
curl http://localhost:8000/api/ai/status
```

---

## API Documentation

Full interactive docs available at `http://localhost:8000/api/docs` when the backend is running.

Key endpoints:
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login → JWT
- `POST /api/reports` — Create report (triggers AI pipeline)
- `GET /api/reports` — List/filter/search reports
- `PATCH /api/reports/{id}/status` — Change status (authority)
- `POST /api/reports/{id}/assign` — Assign to department
- `GET /api/dashboard/summary` — KPI summary
- `GET /api/dashboard/analytics` — Full analytics
- `GET /api/clusters` — Problem clusters
- `GET /api/admin/ai-config` — AI configuration

---

## Testing

### Backend
```bash
cd JanDrishti/backend
pytest tests/ -v
# 45 passed
```

### Frontend
```bash
cd JanDrishti/frontend
npm run build
# 21 routes compiled successfully
```

---

## Priority Score Formula

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

## Environment Variables

### Backend (`backend/.env`)
See `backend/.env.example` for all options. Key ones:
- `DATABASE_URL` — PostgreSQL connection string
- `SECRET_KEY` — JWT signing key
- `GEMINI_API_KEY` — Optional, enables LLM-based AI
- `AI_PROVIDER` — `auto`, `gemini`, or `local`

### Frontend (`frontend/.env.local`)
See `frontend/.env.example`. Key ones:
- `NEXT_PUBLIC_API_URL` — Backend API base URL
- `NEXT_PUBLIC_USE_MOCK` — `true` for demo mode (no backend needed)

---

## Responsible AI

AI recommendations are **decision-support tools only**. Authorities are responsible for all final decisions. AI predictions may be incorrect. Citizen reports should undergo appropriate verification before official action.

---

## Disclaimer

JanDrishti AI is a demonstration platform. All data displayed in demo mode is synthetic and does not represent real government complaints. Real deployment would require integration with verified government data sources and compliance with applicable data-protection laws.

---

## License

For demonstration purposes only. Not intended for production use without backend integration and compliance review.
