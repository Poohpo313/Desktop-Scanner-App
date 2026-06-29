# Bukolabs.io — Desktop Scanner & File Management System

**Client:** Bukolabs.io · **Dev Team:** Aethera Digital & Syn7rgy  
**Stack:** Electron + React (Desktop) · React (Web) · NestJS · PostgreSQL (online + offline)

## Project layout

| Path | Role |
|------|------|
| `admin-interface-react/` | Admin portal — production UI at `/portal/*` |
| `super-admin-interface-react/` | Super Admin portal — production UI at `/portal/*` |
| `user-interface-electron/` | User desktop app — Electron + React + IPC |
| `apps/backend/` | NestJS API (shared by all three apps) |
| `packages/shared-types/` | Shared TypeScript types |
| `scripts/` | Database setup helpers |
| `Figma/` | **Screen map** — all 180 screens, flows, API functions |

## Quick start

```powershell
cd "c:\Desktop Scanner App"
npm install

npm run setup:db    # first time only — creates DB + seeds dev accounts
npm run dev:api     # http://localhost:3000/api/docs

npm run dev:admin        # http://localhost:5174/portal/login
npm run dev:superadmin   # http://localhost:5175/portal/login
npm run dev:user         # User Electron app

npm run figma:map        # regenerate Figma/ screen + flow maps
```

## Figma screen map

Full inventory: [`Figma/SCREEN-MAP.md`](Figma/SCREEN-MAP.md) · [Figma file](https://www.figma.com/design/IlPkS1UqnhECqi8qIIJyIb/DESKTOP-SCANNER-TEAM-BISU)

| App | Screens | Flow entry | Figma gallery |
|-----|---------|------------|---------------|
| User | 66 | `002-splash-screen` | http://localhost:5173/figma/gallery |
| Admin | 47 | `admin-login` | http://localhost:5174/all-screens |
| Super Admin | 67 | `splash-screen` | http://localhost:5175/all-screens |

## Dev login credentials

| Portal | Credentials |
|--------|-------------|
| Admin `/portal/login` | `admin` / `AdminPass123!` |
| Super Admin `/portal/login` | PIN `1234` |
| User desktop | `demo` / `UserPass123!` |

## Backend setup

**Online DB (PostgreSQL)** — run the setup script (creates DB, tables, and `.env.online`):

```powershell
npm run setup:db
npm run test:postgres-online
```

Migration file: `backend-modules/shared/migrations/online/001_initial_schema.postgres.sql`  
Optional seed: `backend-modules/shared/migrations/online/002_seed_roles.postgres.sql`  
Env file: `backend-modules/shared/.env.online`

**Offline DB (PostgreSQL)** — local desktop database for users when offline:

```powershell
npm run setup:postgres-offline
npm run test:postgres-offline
```

Or set up both databases at once:

```powershell
npm run setup:all-databases
```

Migration: `backend-modules/shared/migrations/offline/001_initial_schema.postgres.sql`  
Env file: `backend-modules/shared/.env.offline`

© 2026 Bukolabs.io. All Rights Reserved.
