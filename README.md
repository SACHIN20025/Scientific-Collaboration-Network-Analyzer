# Scientific Collaboration Network Analyzer (SCNA)

A full-stack research collaboration management platform for universities and research
organizations. Tracks researchers, publications, funding projects, conferences, citations,
institutional partnerships, and co-authorship networks — no AI-based analysis, just a
centralized operational database and dashboards.

## Stack

- **Backend:** Python, FastAPI, MongoDB (via Motor), JWT authentication
- **Frontend:** React 18 (Vite), React Router, Axios, Recharts
- **Database:** MongoDB 7

## Project structure

```
scnet/
├── backend/            FastAPI application
│   ├── app/
│   │   ├── core/        config, database, security (JWT)
│   │   ├── models/       Pydantic schemas
│   │   ├── routers/      auth, researchers, publications, projects,
│   │   │                 collaborations, conferences, citations,
│   │   │                 institutions, dashboard, audit
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/           React (Vite) application
    ├── src/
    │   ├── api/          axios client
    │   ├── components/   Layout, ProtectedRoute, NetworkMotif, StatusBadge
    │   ├── context/       AuthContext
    │   └── pages/         Login, Register, Dashboard, Researchers,
    │                      Publications, Projects, Conferences, Citations,
    │                      Institutions, Reports, Audit
    ├── package.json
    └── .env.example
```

## Modules implemented

1. **User Management** — registration, login (JWT), roles: Researcher, Institution Admin,
   Reviewer, System Admin
2. **Researcher Management** — profiles, department, skills, research interests, affiliations
3. **Publication Management** — journal papers, conference papers, books, patents, technical
   reports; status workflow (draft → submitted → published → archived)
4. **Collaboration Management** — funding projects, team assignments, institutional
   partnerships, co-author network links
5. **Conference Management** — registration, location/dates, participants, presentations
6. **Citation & Reference Module** — citation records linking publications, DOI, external
   references
7. **Institutions** — organization directory with per-institution statistics
8. **Dashboards** — personal activity dashboard + network-wide admin dashboard with charts
9. **Reports & Export** — CSV / JSON export for publications, projects, collaborations, and
   researchers
10. **Audit Log** — activity trail (registration, login) visible to admins

## Prerequisites

- **Python 3.10+**
- **Node.js 18+** and npm
- **MongoDB** running locally (or a hosted instance such as MongoDB Atlas)

### Installing MongoDB locally (macOS)

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

MongoDB will then be available at `mongodb://localhost:27017`.

(Windows/Linux: see the [official MongoDB install guide](https://www.mongodb.com/docs/manual/administration/install-community/).)

You can inspect the database visually with [MongoDB Compass](https://www.mongodb.com/products/compass),
connecting to `mongodb://localhost:27017`.

## Running the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # edit MONGO_URI / JWT_SECRET if needed
uvicorn app.main:app --reload --port 8000
```

Confirm it's working by opening **http://localhost:8000/docs**.

## Running the frontend

Open a **second terminal** (leave the backend running):

```bash
cd frontend
npm install
cp .env.example .env            # points VITE_API_URL at the backend
npm run dev
```

Open **http://localhost:5173**.

## First steps after setup

1. Register a **System Admin** account (or any role) at `/register`.
2. Register a few more accounts to populate the researcher directory.
3. Add publications, projects, conferences, and co-author links.
4. Check the **Dashboard** and **Reports** pages for aggregated statistics and CSV/JSON export.

## Troubleshooting

- **"Address already in use" on port 8000 or 5173/5174** — a previous run is still holding
  the port. Find and stop it:
  ```bash
  lsof -i :8000        # or :5173, :5174, etc.
  kill -9 <PID>
  ```
- **CORS error in the browser console** — the frontend's actual port isn't in the backend's
  allowed list. Edit `backend/.env`:
  ```
  CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:<your-port>
  ```
  then restart the backend (env vars are only read on startup).
- **Registration fails immediately** — confirm MongoDB is running (`lsof -i :27017` or open
  Compass and connect to `mongodb://localhost:27017`), and confirm the backend is reachable
  at `http://localhost:8000/docs`.

## Notes

- Passwords are hashed with bcrypt; JWTs expire after 24 hours by default
  (`ACCESS_TOKEN_EXPIRE_MINUTES` in `backend/.env`).
- `VITE_API_URL` in `frontend/.env` is read once when `npm run dev` starts — restart it after
  changing this value.
- The audit log endpoint is restricted to `system_admin` and `institution_admin` roles.
- This implementation intentionally excludes AI-based analysis, per the project brief.
# Scientific-Collaboration-Network-Analyzer
