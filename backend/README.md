# Aqua Mind AI - FastAPI & PostgreSQL Backend

This directory contains the production-ready Python backend for **Aqua Mind AI**, an AI-driven municipal water budgeting, allocation simulation, and predictive demand forecasting application.

---

## 1. Architecture Overview

The backend is built with **FastAPI**, **SQLAlchemy ORM**, and **Pydantic v2**, structured as follows:

```
backend/
├── app/
│   ├── main.py                     # FastAPI app instance, CORS middleware, lifespan events
│   ├── config.py                   # Pydantic BaseSettings, environment configuration
│   ├── database.py                 # SQLAlchemy engine, session maker, get_db dependency
│   ├── models/                     # SQLAlchemy declarative ORM models
│   │   ├── community.py            # Community metadata & hydrological constraints
│   │   ├── water_source.py         # Reservoir & raw storage availability
│   │   ├── water_budget.py         # Sectoral allocations & presets
│   │   ├── allocation.py           # Facilities & simulation run entities
│   │   ├── consumption.py          # Meter readings & sub-zone flow meters
│   │   ├── forecast.py             # Forecast points & historical audit records
│   │   └── alert.py                # AI anomaly alerts & prescribed mitigations
│   ├── schemas/                    # Pydantic v2 validation schemas
│   │   ├── community.py
│   │   ├── water_source.py
│   │   ├── water_budget.py
│   │   ├── allocation.py
│   │   ├── consumption.py
│   │   ├── forecast.py
│   │   ├── alert.py
│   │   └── dashboard.py
│   ├── api/                        # REST API routers
│   │   ├── health.py               # GET /api/health
│   │   ├── communities.py          # GET /api/communities, GET/PUT /api/communities/{id}
│   │   ├── dashboard.py            # GET /api/dashboard
│   │   ├── water_budgets.py        # GET/POST /api/water-budgets
│   │   ├── consumption.py          # GET/POST /api/consumption, GET /api/consumption/meters
│   │   ├── forecasts.py            # GET /api/forecasts, POST /api/forecasts/generate
│   │   ├── alerts.py               # GET /api/alerts, PATCH /api/alerts/{id}/status
│   │   └── facilities.py           # GET/POST/PUT/DELETE /api/facilities, POST /api/simulation/run
│   └── services/                   # Core business logic
│       ├── allocation_service.py   # Deterministic water allocation simulation algorithm
│       ├── budget_service.py       # Sector budget calculations & WHO compliance checks
│       ├── forecast_service.py     # Predictive trajectory & what-if load-shedding simulation
│       ├── alert_service.py        # Anomaly filtering, lifecycle, and mitigation application
│       ├── recommendation_service.py# AI and domain-rule water conservation advisories
│       └── seed_service.py         # Database auto-seeder on first boot
├── tests/
│   ├── conftest.py                 # Test database fixtures
│   ├── test_allocation_service.py # Core algorithm unit tests
│   └── test_api_endpoints.py       # API integration tests
├── requirements.txt                # Python package dependencies
├── .env.example                    # Environment variable template
└── README.md                       # Setup and operating documentation
```

---

## 2. Prerequisites

* **Python:** 3.10, 3.11, 3.12, 3.13, or 3.14
* **PostgreSQL:** Version 14+ (local service, Docker, or cloud like Neon, Supabase, AWS RDS).
  * *Note:* If PostgreSQL is not installed locally, the backend automatically supports SQLite (`sqlite:///./aquamind.db`) for zero-friction local development and testing.

---

## 3. Installation & Setup

### Step 1: Create and Activate a Virtual Environment

**Windows (PowerShell):**
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**macOS / Linux:**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

### Step 2: Install Python Dependencies

```bash
pip install -r requirements.txt
```

---

## 4. Environment & Database Configuration

Copy `.env.example` to `.env`:

```powershell
cp .env.example .env
```

### PostgreSQL Setup

Set `DATABASE_URL` in your `.env` file:

```env
# Format: postgresql+psycopg://<username>:<password>@<host>:<port>/<dbname>
DATABASE_URL="postgresql+psycopg://postgres:your_secure_password@localhost:5432/aquamind_db"
```

To create the database in PostgreSQL:
```sql
CREATE DATABASE aquamind_db;
```

### SQLite Fallback (No PostgreSQL installed)

If you do not have PostgreSQL running locally, set:
```env
DATABASE_URL="sqlite:///./aquamind.db"
```

The database schema, tables, and baseline data will be **automatically created and seeded** on the first application startup.

---

## 5. Running the Backend Server

Start the FastAPI application with Uvicorn:

```powershell
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

---

## 6. Accessing API Documentation

Once the server is running, explore the interactive documentation:

* **Interactive Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **ReDoc Interface:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
* **System Health Check:** [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

## 7. Running Automated Tests

Run the full pytest suite (core deterministic allocation logic and all endpoints):

```powershell
python -m pytest tests -v
```

All 12 tests will run and validate:
* Normal supply scenarios ($S \ge \text{Demand}$)
* Moderate scarcity rationing ($S \ge \text{Minimums}$)
* Critical drought sub-minimum rationing ($S < \text{Minimums}$)
* Real database health checks, CRUD operations, and load-shedding simulations

---

## 8. Summary of API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health and tested database connection status |
| `GET` | `/api/communities` | List all monitored communities |
| `GET` | `/api/communities/{id}` | Get specific community profile and constraints |
| `PUT` | `/api/communities/{id}` | Update community settings (population, cap, etc.) |
| `GET` | `/api/dashboard` | Aggregated dashboard overview (live simulation, readings, alerts) |
| `GET` | `/api/water-budgets` | Get active water budget allocations |
| `POST` | `/api/water-budgets` | Save/update water budget sector allocations |
| `GET` | `/api/water-budgets/metrics`| Calculate WHO per-capita compliance & headroom |
| `GET` | `/api/consumption` | List recent water meter readings |
| `POST` | `/api/consumption` | Log new meter reading (manual or sensor) |
| `GET` | `/api/consumption/meters` | Sub-zone 28 smart flow meters ledger |
| `GET` | `/api/forecasts` | Forward-looking demand forecast trajectories (7d, 14d, 30d) |
| `POST` | `/api/forecasts/generate` | Simulate load-shedding scenarios with mitigation toggles |
| `GET` | `/api/forecasts/historical`| 31-day historical audited flow records |
| `GET` | `/api/alerts` | Filtered list of AI alerts and anomaly detections |
| `PATCH`| `/api/alerts/{id}/status` | Update alert lifecycle (active / acknowledged / resolved) |
| `POST` | `/api/alerts/acknowledge-all`| Mark all active alerts acknowledged |
| `POST` | `/api/alerts/apply-mitigation`| Enact conservation mitigations from an alert |
| `GET` | `/api/facilities` | List community facilities registry |
| `POST` | `/api/facilities` | Add new facility to registry |
| `PUT` | `/api/facilities/{id}` | Update facility demand, minimum, or priority |
| `DELETE`| `/api/facilities/{id}` | Remove facility from registry |
| `POST` | `/api/simulation/run` | Execute deterministic water allocation simulation |
| `GET` | `/api/water-sources` | Get reservoir and storage availability |
| `PUT` | `/api/water-sources` | Update available water supply or storage parameters |
