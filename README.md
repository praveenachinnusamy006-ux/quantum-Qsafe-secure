# QuantumSecure — AI + Quantum Security Platform

Full-stack platform featuring Shor's Algorithm Simulator and Bumblebee AI Security.

## Stack
- **Frontend**: React 18 + Vite + Tailwind CSS v4 + React Query
- **Backend**: Node.js + Express + TypeScript + Drizzle ORM
- **Database**: PostgreSQL

## Prerequisites
- Node.js 18+ 
- npm or pnpm
- PostgreSQL (local or cloud like Neon, Supabase, Railway)

---

## Quick Start

### 1. Database Setup
```bash
# Create a PostgreSQL database, then run:
psql -U postgres -d your_db_name -f database/schema.sql
psql -U postgres -d your_db_name -f database/seed.sql
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL
npm run dev
# Runs on http://localhost:8080
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
# Automatically proxies /api → http://localhost:8080
```

---

## VS Code Tips
- Open the root folder in VS Code
- Install the **ESLint** and **Prettier** extensions
- Use the integrated terminal to run backend and frontend in split panels

## Environment Variables

### Backend `.env`
```
DATABASE_URL=postgresql://user:password@localhost:5432/quantum_secure
PORT=8080
NODE_ENV=development
```

### Frontend (no .env needed — Vite proxy handles API routing)

---

## Routes
| URL | Description |
|-----|-------------|
| `/` | Dashboard |
| `/vendors` | Vendor Directory |
| `/threats` | Threat Analytics |
| `/documents` | Document Vault |
| `/ai-threats` | AI Threat Dashboard |
| `/shor` | Shor's Algorithm Simulator |
| `/bumblebee` | Bumblebee Security Scanner |
| `/simulator` | Encryption Simulator |

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Health check |
| GET | /api/vendors | List vendors |
| POST | /api/vendors | Create vendor |
| GET | /api/dashboard/summary | Dashboard stats |
| GET | /api/threats | List threats |
| POST | /api/shor/simulate | Run Shor simulation |
| GET | /api/shor/simulations | Simulation history |
| POST | /api/bumblebee/scan | Run security scan |
| GET | /api/bumblebee/scans | Scan history |
