# JanDrishti AI — Backend

**FastAPI + PostgreSQL + AI/NLP**

> The backend is at `JanDrishti/backend/`. The frontend is at `JanDrishti/frontend/`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI 0.142 |
| Language | Python 3.11+ |
| ORM | SQLAlchemy 2.1 |
| Database | PostgreSQL 16 |
| Migrations | Alembic |
| Auth | python-jose (JWT) + passlib (bcrypt) |
| Validation | Pydantic v2 |
| AI/NLP | Pure-Python TF-IDF + keyword classifier |
| File uploads | aiofiles + local storage |
| Testing | pytest + httpx |

---

## Folder Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app factory + lifespan
│   ├── api/
│   │   ├── __init__.py      # Router registration
│   │   └── routes/
│   │       ├── auth.py      # Register, login, me, logout
│   │       ├── reports.py   # Full CRUD + AI + status workflow
│   │       ├── categories.py
│   │       ├── dashboard.py # Summary + analytics
│   │       ├── clusters.py  # Problem clusters
│   │       ├── notifications.py
│   │       ├── users.py     # User management (admin)
│   │       ├── media.py     # File upload
│   │       └── admin.py     # Audit logs + AI config
│   ├── models/              # 14 SQLAlchemy models
│   ├── schemas/             # Pydantic request/response schemas
│   ├── services/            # user_service.py
│   ├── ai/
│   │   ├── ai_service.py    # Main orchestrator
│   │   ├── classification/  # KeywordClassifier
│   │   ├── scoring/         # Severity, urgency, priority
│   │   ├── similarity/      # TF-IDF + cosine + haversine
│   │   └── preprocessing/   # text_cleaner, tokenizer
│   ├── core/
│   │   ├── config.py        # Pydantic-settings
│   │   ├── security.py      # JWT + bcrypt
│   │   └── dependencies.py  # FastAPI deps + RBAC
│   └── database/
│       ├── base.py          # DeclarativeBase
│       └── session.py       # Engine + get_db
├── alembic/                 # Migrations
│   └── versions/
│       └── 0001_initial_schema.py
├── scripts/
│   └── seed.py              # Demo data seed
├── tests/
│   ├── conftest.py          # SQLite test fixtures
│   ├── test_auth.py
│   ├── test_reports.py
│   └── test_ai_service.py
├── Dockerfile
├── requirements.txt
└── .env.example
```

---

## Local Setup (without Docker)

### 1. Prerequisites

- Python 3.11+
- PostgreSQL 16 running locally

### 2. Create database

```sql
CREATE USER jandrishti WITH PASSWORD 'jandrishti_pass';
CREATE DATABASE jandrishti_db OWNER jandrishti;
```

### 3. Install dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 4. Configure environment

```bash
cp .env.example .env
# Edit .env — set DATABASE_URL and SECRET_KEY at minimum
```

### 5. Run migrations

```bash
alembic upgrade head
```

### 6. Seed demo data

```bash
python scripts/seed.py
```

### 7. Start server

```bash
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/api/docs

---

## Docker Setup

```bash
cd JanDrishti          # project root (contains docker-compose.yml)
cp backend/.env.example backend/.env
docker compose up --build
```

- Backend: http://localhost:8000/api/docs
- Frontend: http://localhost:3000
- Database: localhost:5432

To seed demo data inside Docker:

```bash
docker compose exec backend python scripts/seed.py
```

---

## API Reference

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | None | Register new user |
| POST | /api/auth/login | None | Login → JWT token |
| GET | /api/auth/me | Bearer | Current user profile |
| POST | /api/auth/logout | Bearer | Logout (audit log) |
| GET | /api/categories | None | List categories |
| POST | /api/reports | Citizen | Create report + AI analysis |
| GET | /api/reports | Optional | List/filter/search reports |
| GET | /api/reports/{id} | Optional | Get report detail |
| PATCH | /api/reports/{id}/status | Authority | Change status |
| POST | /api/reports/{id}/assign | Authority | Assign to department |
| POST | /api/reports/{id}/support | Citizen | Toggle upvote |
| POST | /api/reports/{id}/comments | Citizen | Add comment |
| GET | /api/reports/{id}/history | Optional | Status history |
| GET | /api/dashboard/summary | Authority | KPI summary |
| GET | /api/dashboard/citizen-summary | Citizen | My stats |
| GET | /api/dashboard/analytics | Authority | Full analytics |
| GET | /api/clusters | Optional | Problem clusters |
| GET | /api/clusters/{id}/reports | Optional | Reports in cluster |
| GET | /api/notifications | Citizen | My notifications |
| GET | /api/users | Authority | List users |
| POST | /api/media/upload | Citizen | Upload image/video |
| GET | /api/admin/audit-logs | Super Admin | Audit trail |
| GET | /api/admin/ai-config | Super Admin | AI config |
| PUT | /api/admin/ai-config | Super Admin | Update AI config |
| GET | /health | None | Health check |

---

## AI Architecture

```
Report submitted
     ↓
text_cleaner.py — normalize, tokenize, stopwords, n-grams
     ↓
KeywordClassifier — keyword-rule scoring → category + confidence
     ↓
severity_analyzer.py — keyword pattern scoring → 1-10
     ↓
urgency_analyzer.py  — keyword + duration signals → 1-10
     ↓
TFIDFSimilarityEngine — cosine similarity + haversine geo filter
     ↓
frequency from similar count + community_impact + persistence
     ↓
priority_engine.py — weighted formula → 0-100 score + level + reasoning
     ↓
stored in ai_analyses table, report.priority_level updated
```

All components implement ABCs (ProblemClassifier, SimilarityEngine) so they can be replaced with:
- BERT / multilingual transformer classifiers
- Sentence-transformers embeddings
- LLM-based analysis APIs

---

## Running Tests

```bash
cd backend
pytest tests/ -v
```

Tests use SQLite in-memory — no PostgreSQL required.

---

## Demo Accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Citizen | citizen@demo.jandrishti.in | Demo@1234 |
| Authority | authority@demo.jandrishti.in | Demo@1234 |
| Super Admin | admin@demo.jandrishti.in | Demo@1234 |

---

## Notes

- **Python 3.14**: scikit-learn has no Python 3.14 wheel yet. The AI module uses a pure-Python TF-IDF + cosine similarity implementation. Switch to scikit-learn's `TfidfVectorizer` + `LogisticRegression` for Python 3.11/3.12/3.13.
- **File uploads** are stored locally in `uploads/`. Replace `save_file()` in `media.py` with S3/Cloudinary for production.
- **AI analysis** runs synchronously in the report-creation endpoint. For high traffic, move it to a Celery/Redis background task.
