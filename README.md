# Bukolabs.io — Desktop Scanner & File Management System

**Client:** Bukolabs.io · **Dev Team:** Aethera Digital & Syn7rgy  
**Stack:** Electron + React (Desktop) · React (Web) · NestJS · PostgreSQL (online + offline)

## Requirements

| Tool | Version |
|------|---------|
| **Node.js** | **20 LTS** (`>=20.0.0 <21`) — see `.nvmrc` |
| **npm** | `>=10.0.0` |
| **PostgreSQL** | 14+ (local or server) |

Switch to Node 20 before installing dependencies:

```powershell
# nvm-windows
nvm install 20
nvm use 20

# fnm
fnm install 20
fnm use 20

cd "c:\Desktop Scanner App"
node -v   # should print v20.x.x
npm install
```

The repo uses `engine-strict=true` (`.npmrc`). `npm install` fails on Node 22+.

## Project layout

| Path | Role |
|------|------|
| `Admin/` | Admin portal — production UI at `/portal/*` |
| `SuperAdmin/` | Super Admin portal — production UI at `/portal/*` |
| `User/user-interface-electron/` | User desktop app — Electron + React + IPC |
| `gateway/` | NestJS API gateway (online PostgreSQL) |
| `Admin/apps/backend/`, `SuperAdmin/apps/backend/`, `User/apps/backend/` | Thin wrappers around `@bukolabs/gateway` |
| `User/packages/shared-types/` | Shared TypeScript types |
| `backend-modules/shared/` | Migrations, entities, shared DB assets |
| `scripts/` | Database setup and deployment helpers |
| `Figma/` | Screen map — flows and API reference |

## Quick start

```powershell
cd "c:\Desktop Scanner App"
npm install

npm run setup:db    # first time only — creates DB + seeds dev accounts
npm run dev:api     # http://localhost:3000/api/docs

npm run dev:admin        # http://localhost:5174/portal/login
npm run dev:superadmin   # http://localhost:5175/portal/login
npm run dev:user         # User Electron app
```

## Production server (gateway)

Deploy the gateway on a host running **Node.js 20 LTS**:

```powershell
npm install
npm run build -w @bukolabs/gateway
npm run install:gateway-service   # Windows service (run as Administrator)
```

See [`gateway/README.md`](gateway/README.md) for architecture and deployment notes.

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
