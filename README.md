# JanDrishti AI

**An AI-Powered Civic Intelligence Platform for Discovering and Prioritising Unresolved Community Problems in India**

> _जनदृष्टि_ — "People's Vision" | See a Problem. Report It. Prioritise It. Resolve It.

---

## What Is JanDrishti AI?

JanDrishti AI transforms scattered citizen complaints into prioritised, geographically actionable civic problems. Citizens report issues through a guided multi-step wizard; an AI pipeline classifies them, detects duplicates, scores urgency, and surfaces the most critical problems on authority dashboards.

### Core Workflow

```
Citizen Report
    → AI Pipeline (classify → deduplicate → score → cluster)
    → Priority Score (0–100)
    → Authority Dashboard (assign → action)
    → Status Updates (REPORTED → IN_PROGRESS → RESOLVED → CLOSED)
    → Citizen Verification
```

---

## Project Structure

This is a **monorepo** with the Next.js frontend at the root and a FastAPI backend in `backend/`.

```
JanDrishti/                          ← repo root (also the Next.js frontend)
├── src/
│   ├── app/                         # Next.js App Router pages
│   │   ├── page.tsx                 # Landing / redirect
│   │   ├── login/                   # Auth: login
│   │   ├── register/                # Auth: register
│   │   ├── dashboard/               # Citizen dashboard
│   │   ├── report/                  # Submit new report
│   │   ├── reports/                 # Browse & filter reports
│   │   ├── explore/                 # Public explore page
│   │   ├── notifications/           # In-app notifications
│   │   ├── profile/                 # User profile
│   │   ├── about/                   # About page
│   │   └── admin/                   # Admin-only section
│   │       ├── dashboard/           # Authority KPI dashboard
│   │       ├── problems/            # Problem management
│   │       ├── assignments/         # Department assignment
│   │       ├── clusters/            # Problem clusters
│   │       ├── map/                 # Interactive map view
│   │       ├── analytics/           # Charts & statistics
│   │       ├── users/               # User management
│   │       └── settings/            # AI config & system settings
│   ├── components/
│   │   ├── charts/                  # Recharts analytics charts
│   │   ├── forms/                   # React Hook Form + Zod forms
│   │   ├── layout/                  # Navigation, sidebar, shell
│   │   ├── maps/                    # Leaflet interactive map
│   │   ├── pages/                   # Page-level components
│   │   ├── shared/                  # Reusable UI primitives
│   │   └── ui/                      # Radix-UI-based component library
│   ├── contexts/                    # React context providers
│   ├── hooks/                       # Custom React hooks
│   ├── lib/                         # Utility functions
│   ├── locales/
│   │   ├── en.ts                    # English translations
│   │   └── hi.ts                    # Hindi translations
│   ├── services/
│   │   ├── api.ts                   # Axios API client + all endpoint calls
│   │   └── mockData.ts              # Mock data for demo mode
│   ├── store/                       # Zustand state stores
│   └── types/                       # Shared TypeScript types
│
├── backend/                         # FastAPI + PostgreSQL + AI/NLP
│   ├── app/
│   │   ├── main.py                  # App factory + lifespan (AI warm-up)
│   │   ├── api/
│   │   │   ├── __init__.py          # Router registration
│   │   │   └── routes/
│   │   │       ├── auth.py          # Register, login, me, logout
│   │   │       ├── reports.py       # Full CRUD + AI pipeline + status workflow
│   │   │       ├── dashboard.py     # KPI summary + analytics
│   │   │       ├── clusters.py      # Problem clusters
│   │   │       ├── categories.py    # Civic categories
│   │   │       ├── notifications.py # In-app notifications
│   │   │       ├── users.py         # User management (admin)
│   │   │       ├── media.py         # Image/video upload
│   │   │       └── admin.py         # Audit logs + AI config
│   │   ├── models/                  # 14 SQLAlchemy models
│   │   │   ├── user.py, report.py, location.py, category.py
│   │   │   ├── ai_analysis.py, problem_cluster.py
│   │   │   ├── media.py, comment.py, upvote.py
│   │   │   ├── notification.py, status_history.py
│   │   │   └── assignment.py, audit_log.py
│   │   ├── schemas/                 # Pydantic v2 request/response schemas
│   │   ├── services/                # Business logic (user_service, etc.)
│   │   ├── ai/
│   │   │   ├── ai_service.py        # Main AI orchestrator
│   │   │   ├── classification/      # KeywordClassifier (12 civic categories)
│   │   │   ├── scoring/             # Severity, urgency, priority engine
│   │   │   ├── similarity/          # TF-IDF + cosine + haversine geo filter
│   │   │   ├── preprocessing/       # text_cleaner, tokenizer, stopwords
│   │   │   └── llm/                 # Gemini LLM provider (optional)
│   │   ├── core/
│   │   │   ├── config.py            # Pydantic-settings configuration
│   │   │   ├── security.py          # JWT + bcrypt helpers
│   │   │   └── dependencies.py      # FastAPI deps + RBAC guards
│   │   └── database/
│   │       ├── base.py              # SQLAlchemy DeclarativeBase
│   │       └── session.py           # Engine + get_db dependency
│   ├── alembic/                     # Database migrations
│   │   └── versions/0001_initial_schema.py
│   ├── scripts/seed.py              # Demo data seeding
│   ├── tests/                       # 45 tests (auth, reports, AI)
│   │   ├── conftest.py              # SQLite in-memory fixtures
│   │   ├── test_auth.py
│   │   ├── test_reports.py
│   │   └── test_ai_service.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
│
├── docker-compose.yml               # Backend + Frontend services
├── Dockerfile                       # Next.js frontend image
├── next.config.ts
├── package.json
├── tsconfig.json
├── .env.example                     # Root environment template
└── README.md
```

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.3.4 | React framework (App Router) |
| React | 19.2.8 | UI library |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | ^4 | Utility-first styling |
| Radix UI | various | Accessible headless components |
| Recharts | ^3 | Analytics charts |
| Leaflet / react-leaflet | 1.9.4 / 5.0 | Interactive maps |
| Zustand | ^5 | Client-side state management |
| React Hook Form + Zod | ^7 / ^4 | Form handling & validation |
| next-themes | ^0.4 | Dark/light mode |
| lucide-react | ^1.44 | Icon library |
| date-fns | ^4 | Date formatting |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| FastAPI | 0.115.12 | Web framework |
| Python | 3.11+ | Language |
| SQLAlchemy | 2.0.41 | ORM |
| PostgreSQL / Neon | 16 | Primary database |
| Alembic | 1.16.1 | Schema migrations |
| Pydantic | 2.11.4 | Request/response validation |
| python-jose | 3.5.0 | JWT authentication |
| bcrypt | 4.3.0 | Password hashing |
| aiofiles + Pillow | — | File uploads & image handling |
| google-generativeai | 0.8.6 | Optional Gemini LLM provider |
| pytest + httpx | — | Testing |

### AI / NLP Pipeline
| Component | Implementation |
|---|---|
| Text preprocessing | Pure-Python tokenizer, stopword removal, n-gram generation |
| Classifier | 12-category keyword rules (local) **or** Gemini LLM (optional) |
| Duplicate detection | TF-IDF cosine similarity + haversine geographic radius filter |
| Severity / Urgency | Keyword pattern scoring + optional Gemini refinement |
| Priority Engine | Weighted formula → 0–100 score + level + reasoning |
| Cluster summaries | AI-generated narrative summaries per problem cluster |

---

## Quick Start

### Option A — Docker (recommended)

```bash
# 1. Copy and configure the backend environment
cp backend/.env.example backend/.env
# Edit backend/.env — set DATABASE_URL and SECRET_KEY at minimum

# 2. Build and start all services
docker compose up --build

# 3. (Optional) Seed demo data
docker compose exec backend python scripts/seed.py
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API docs | http://localhost:8000/api/docs |
| Health check | http://localhost:8000/health |

> **Database**: The project uses [Neon](https://neon.tech) serverless PostgreSQL by default. No local DB container is needed — just set `DATABASE_URL` in `backend/.env`.

---

### Option B — Local Development

**Backend:**
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env: set DATABASE_URL and SECRET_KEY

# Run migrations
alembic upgrade head

# Seed demo data
python scripts/seed.py

# Start the dev server
uvicorn app.main:app --reload --port 8000
```

**Frontend (from the repo root):**
```bash
npm install

# For demo mode (no backend needed), create .env.local:
echo "NEXT_PUBLIC_USE_MOCK=true" > .env.local

# For real backend integration, create .env.local:
# NEXT_PUBLIC_USE_MOCK=false
# NEXT_PUBLIC_API_URL=http://localhost:8000/api

npm run dev   # → http://localhost:3000
```

---

## Demo Accounts

After seeding (`python scripts/seed.py`), these accounts are available:

| Role | Email | Password | Access |
|---|---|---|---|
| Citizen | citizen@demo.jandrishti.in | Demo@1234 | Submit reports, upvote, comment |
| Authority | authority@demo.jandrishti.in | Demo@1234 | Dashboard, assign, change status |
| Super Admin | admin@demo.jandrishti.in | Demo@1234 | Full access including AI config & audit logs |

---

## Key Features

### Citizen Features
- **Multi-step report wizard** — location picker, photo/video uploads, live AI preview
- **Browse & search reports** — filter by category, status, priority, city
- **Upvote & comment** on existing reports
- **Notification feed** — real-time updates on report status changes
- **Citizen dashboard** — personal report history and stats
- **Multilingual UI** — English and Hindi, extensible to other Indic languages

### Authority Features
- **KPI dashboard** — total reports, resolution rate, avg. priority, critical alerts
- **Interactive map** — priority-coloured markers with filters and info popups
- **Analytics charts** — by category, status, priority, city, and timeline
- **Status workflow** — `REPORTED → UNDER_REVIEW → VERIFIED → ASSIGNED → IN_PROGRESS → RESOLVED → CITIZEN_VERIFICATION → CLOSED`
- **Department assignment** — assign reports to relevant departments
- **Problem clusters** — auto-grouped similar reports with AI narrative summaries

### Admin Features
- **User management** — view, role and status management
- **AI configuration** — adjust similarity thresholds and priority weights at runtime
- **Audit log** — full administrative action trail

---

## AI Details

### Priority Score Formula

```
priority_score =
  (severity    × 0.30
  + urgency     × 0.25
  + frequency   × 0.20
  + impact      × 0.15
  + persistence × 0.10) × 10
```

| Score | Level |
|---|---|
| 75 – 100 | 🔴 CRITICAL |
| 50 – 74  | 🟠 HIGH |
| 25 – 49  | 🟡 MEDIUM |
| 0 – 24   | 🟢 LOW |

### AI Providers

| Provider | Activated when | Capabilities |
|---|---|---|
| **Local (pure-Python)** | Default — no API key needed | TF-IDF similarity, keyword classifier, pattern-based severity/urgency scoring |
| **Gemini LLM** | `GEMINI_API_KEY` is set in `.env` | Multilingual classification, LLM-refined scoring, cluster narrative summaries |

Set `AI_PROVIDER=auto` (default) to use Gemini when available and fall back to local on any error.
Set `AI_PROVIDER=local` to always use the local engine regardless of key presence.

#### Enable Gemini (Optional)

```bash
# 1. Get a free key at https://aistudio.google.com/apikey
# 2. Add to backend/.env:
GEMINI_API_KEY=your-key-here
GEMINI_MODEL=gemini-1.5-flash
AI_PROVIDER=auto

# 3. Restart the backend, then verify:
curl http://localhost:8000/api/ai/status
```

---

## API Reference

Interactive Swagger docs: `http://localhost:8000/api/docs`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Register a new user |
| POST | `/api/auth/login` | None | Login → JWT token |
| GET | `/api/auth/me` | Bearer | Current user profile |
| POST | `/api/auth/logout` | Bearer | Logout (recorded in audit log) |
| GET | `/api/categories` | None | List all civic categories |
| POST | `/api/reports` | Citizen | Create report (triggers full AI pipeline) |
| GET | `/api/reports` | Optional | List / filter / search reports |
| GET | `/api/reports/{id}` | Optional | Report detail |
| PATCH | `/api/reports/{id}/status` | Authority | Change report status |
| POST | `/api/reports/{id}/assign` | Authority | Assign to a department |
| POST | `/api/reports/{id}/support` | Citizen | Toggle upvote |
| POST | `/api/reports/{id}/comments` | Citizen | Add a comment |
| GET | `/api/reports/{id}/history` | Optional | Full status history |
| GET | `/api/dashboard/summary` | Authority | KPI summary cards |
| GET | `/api/dashboard/citizen-summary` | Citizen | Personal stats |
| GET | `/api/dashboard/analytics` | Authority | Full analytics data |
| GET | `/api/clusters` | Optional | Problem clusters list |
| GET | `/api/clusters/{id}/reports` | Optional | Reports within a cluster |
| GET | `/api/notifications` | Citizen | My notifications |
| GET | `/api/users` | Authority | List all users |
| POST | `/api/media/upload` | Citizen | Upload image or video |
| GET | `/api/admin/audit-logs` | Super Admin | Audit trail |
| GET | `/api/admin/ai-config` | Super Admin | View AI configuration |
| PUT | `/api/admin/ai-config` | Super Admin | Update AI configuration |
| GET | `/health` | None | Service health check |
| GET | `/api/ai/status` | None | Active AI provider info |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL/Neon connection string |
| `SECRET_KEY` | ✅ | JWT signing key (`openssl rand -hex 32`) |
| `GEMINI_API_KEY` | Optional | Enables Gemini LLM classification |
| `GEMINI_MODEL` | Optional | Model name (default: `gemini-1.5-flash`) |
| `AI_PROVIDER` | Optional | `auto` (default), `gemini`, or `local` |
| `UPLOAD_DIR` | Optional | Directory for file uploads (default: `uploads/`) |
| `ALLOWED_ORIGINS` | Optional | CORS origins JSON array |
| `DEBUG` | Optional | Enable debug logging |

### Frontend (`.env.local` at repo root)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (e.g., `http://localhost:8000/api`) |
| `NEXT_PUBLIC_USE_MOCK` | `true` = demo mode (no backend needed), `false` = real API |

---

## Testing

### Backend

```bash
cd backend
pytest tests/ -v
# 45 passed — uses SQLite in-memory, no PostgreSQL required
```

### Frontend

```bash
npm run build
# Verifies all routes compile successfully
```

---

## Responsible AI Notice

AI recommendations are **decision-support tools only**. All final prioritisation and action decisions rest with human authorities. AI predictions may be incorrect. Citizen reports should undergo appropriate verification before official action is taken.

---

## Disclaimer

JanDrishti AI is a demonstration platform. All data in demo/mock mode is synthetic and does not represent real government complaints or records. Real deployment would require integration with verified government data sources and compliance with applicable data-protection laws (e.g., DPDPA in India).

---

## License

For demonstration purposes only. Not intended for production use without a thorough security review, backend integration, and regulatory compliance assessment.









OLD ARCHITECTURE---------------------------------------------------------------------------------------


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
