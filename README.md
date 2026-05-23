# Mogara

**Fragrant beauty · life in bloom**

Mogara is a personal life-direction app: align daily work with long-term goals, reflect each week, and watch a living bloom respond to your momentum—not a gamified task manager.

It is designed for **local, single-user use**: SQLite on disk, FastAPI backend, React frontend. Run both on your machine; your data stays in `data/tracker.db`.

---

## What Mogara is (and isn’t)

| It is | It isn’t |
|--------|-----------|
| A calm system for intentional living | A habit-streak or dopamine product |
| Built around time (days, weeks, history) | A generic project-management clone |
| Reflective (weekly reviews, rhythm states) | Productivity-toxic “optimize everything” |

---

## Features

- **Goals** — Life areas → life goals → short-term goals (strict hierarchy)
- **Today** — Core tasks per day, linked to **weekly focus** only
- **Week** — Weekly focus for the current (or past) week; weekly reflection with **weekly rhythm** and locked submit (casual notes stay editable)
- **Quick notes** — Scratch pad; not tied to goals or momentum
- **Calendar** — Core tasks on a month view
- **Dashboard (Insights)** — Momentum trend, energy by life area, Mogara bloom
- **Momentum** — Score from completed tasks, weekly reviews, and inactivity (capped, gentle penalties)
- **Auth** — Username + motivating phrase (JWT); per-user data isolation
- **Settings** — Timezone and week start day (per user)

Hover the **flower logo** in the sidebar for a short explanation of what Mogara is.

---

## Goal hierarchy

All links follow one chain—no shortcuts (e.g. tasks do not attach directly to life goals):

```
Life area
  └── Life goal
        └── Short-term goal
              └── Weekly focus (this week)
                    └── Core task (today)
```

Insights resolve completed tasks up this chain (e.g. energy allocation by life area).

---

## Tech stack

| Layer | Stack |
|--------|--------|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4, React Router 7, Framer Motion, date-fns, react-big-calendar |
| Backend | Python 3.10+, FastAPI, SQLAlchemy 2, Alembic, SQLite |
| Auth | JWT (python-jose), PBKDF2 password hashing |

---

## Prerequisites

- **Python** 3.10 or newer  
- **Node.js** 20+ and npm  
- Linux, macOS, or WSL (developed on Linux)

---

## Quick start

### 1. Clone and open the repo

```bash
git clone <your-repo-url>
cd Tracker
```

### 2. Backend (terminal 1)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

On first start the API creates `data/tracker.db`, runs **Alembic** migrations (`upgrade head`), and may apply missed **inactivity** momentum adjustments for each user.

Health check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)  
OpenAPI docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 3. Frontend (terminal 2)

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The dev server proxies `/api` and `/health` to the backend.

### 4. First account

1. Open the app → **Create account** (or **Sign in** if you already registered).
2. Pick a username and a **motivating phrase** (at least two words—not a plain password).
3. **Goals** → add life areas, life goals, short-term goals.
4. **Week → Weekly focus** → add focus for this week (requires a short-term goal).
5. **Today** → add core tasks and link them to weekly focus.
6. **Week → Weekly reflection** → draft and submit when ready.

---

## Project structure

```
Tracker/
├── LICENSE                  # MIT (plain text)
├── README.md
├── data/                    # gitignored — SQLite DB, JWT secret file
├── backend/
│   ├── requirements.txt
│   ├── alembic.ini            # Alembic config (URL set in alembic/env.py)
│   ├── alembic/               # migration env + versions/
│   └── app/
│       ├── main.py          # FastAPI app, CORS, lifespan
│       ├── config.py          # DATABASE_URL → data/tracker.db
│       ├── database.py        # init_db, run_migrations, clear helpers
│       ├── models/            # SQLAlchemy models
│       ├── schemas/           # Pydantic request/response models
│       ├── api/               # routers + auth deps
│       ├── services/          # domain logic (scoped by user_id)
│       └── core/              # security, auth phrase validation, time
└── frontend/
    ├── package.json
    ├── vite.config.ts         # proxies /api → :8000
    └── src/
        ├── App.tsx            # routes + auth shell
        ├── api/               # typed API client
        ├── auth/              # token + session invalidation
        ├── context/           # AuthProvider
        ├── copy/              # hints, brand strings
        ├── hooks/               # useWeekData, useGoalsData
        ├── pages/             # feature screens
        └── components/        # UI, Mogara bloom, sidebar
```

---

## Configuration

| Variable / path | Purpose |
|-----------------|--------|
| `data/tracker.db` | SQLite database (auto-created) |
| `data/.jwt_secret` | JWT signing key (auto-created if `MOGARA_SECRET_KEY` unset) |
| `MOGARA_SECRET_KEY` | Optional env override for JWT signing (recommended if you deploy anywhere shared) |

CORS is configured in `backend/app/main.py` for `http://localhost:5173` and `http://127.0.0.1:5173`. Add your production origin before hosting the SPA elsewhere.

---

## Database

Schema changes are managed with **Alembic**. Migrations run automatically on API startup (`init_db` → `alembic upgrade head`). Existing databases created before Alembic are **stamped** at head on first run if they already have tables but no `alembic_version` row.

### Apply migrations

```bash
cd backend
source .venv/bin/activate
alembic upgrade head
```

Same as `python -m app.database` (without `--clear`).

### Reset all data

Removes every row; tables and migration history stay intact:

```bash
python -m app.database --clear
```

The first user to register after a clear starts with empty data.

### Add a schema change

1. Edit SQLAlchemy models in `backend/app/models/`.
2. Generate a revision (review the file before committing):

```bash
cd backend
source .venv/bin/activate
alembic revision --autogenerate -m "short_description"
alembic upgrade head
```

3. Commit the new file under `backend/alembic/versions/`.

SQLite uses batch mode in `alembic/env.py` so column/table alters work reliably.

### Other Alembic commands

| Command | Purpose |
|---------|---------|
| `alembic current` | Show applied revision |
| `alembic history` | List revisions |
| `alembic downgrade -1` | Revert one revision (use with care) |
| `alembic stamp head` | Mark DB as current without running SQL (rare; for manual fixes) |

---

## API overview

| Prefix | Auth | Description |
|--------|------|-------------|
| `GET /health` | Public | Liveness |
| `POST /api/auth/register`, `login` | Public | Account + JWT |
| `GET /api/auth/status`, `me` | Public / Bearer | Phrase suggestions, current user |
| `/api/life-areas`, `life-goals`, `short-term-goals`, `weekly-goals` | Bearer | Goal hierarchy |
| `/api/core-tasks`, `quick-notes` | Bearer | Daily work |
| `/api/weekly-reviews` | Bearer | Reflection (submit locks most fields) |
| `/api/momentum/*` | Bearer | Current score, events |
| `/api/analytics/*` | Bearer | Journey, energy, day activity |
| `/api/settings` | Bearer | Timezone, week start |

Send `Authorization: Bearer <token>` on protected routes. Tokens are stored in the browser as `mogara_token` (localStorage).

---

## Development

### Backend

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm run dev      # dev server
npm run build    # production build → frontend/dist
npm run lint     # ESLint
npm run preview  # preview production build
```

### Copy and UX strings

- Page/section hints: `frontend/src/copy/hints.ts`
- Brand / logo tooltip: `frontend/src/copy/brand.ts`
- Weekly rhythm labels: `frontend/src/pages/week/weekConstants.ts`

---

## Weekly rhythm states

Reflection uses a **weekly rhythm** (stored as `direction_state`): Drifting, Pushing through, In motion, Anchored, In flow. These feed the Dashboard bloom alongside momentum.

---

## Contributing

1. Fork the repo and create a branch.
2. Keep changes focused; match existing patterns (services + `user_id`, thin routers, hints in `copy/`).
3. Run `npm run build` and `npm run lint` in `frontend/` before opening a PR.
4. There is **no automated test suite** yet—manually smoke-test auth, Today tasks, week focus, and reflection submit.

Bug reports and PRs are welcome. For large features (sync, mobile, Postgres), open an issue first to align with the product’s calm, local-first scope.

---

## Known limitations

- **SQLite** — not suited for high concurrency or multi-tenant hosting without redesign.
- **Local-first** — no cloud sync; back up `data/tracker.db` yourself.
- **JWT in localStorage** — acceptable for local dev; use HTTPS and stricter auth if you expose the app on a network.
- **Open registration** — anyone who can reach your API can create an account unless you add deployment-level restrictions.
- **Migrations** — Alembic only; always run `alembic upgrade head` (or restart the API) after pulling model changes.

---

## License

[MIT](LICENSE) — Copyright (c) 2026 Atharv Nagaonkar.

The license lives at the repo root as **`LICENSE`** (plain text, no `.md`). GitHub recognizes that name automatically; `LICENSE.md` also works but is optional and usually reserved when you want Markdown formatting in the legal text.
