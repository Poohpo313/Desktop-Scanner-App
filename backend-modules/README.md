# Bukolabs.io Shared Backend Assets

> **Running API:** `gateway/` (`@bukolabs/gateway`). This folder holds shared migrations and utilities.

## Requirements

- **Node.js 20 LTS** (`>=20.0.0 <21`) — same as the repo root (see `.nvmrc`)
- **PostgreSQL** for online (`bukolabs_online`) and offline (`bukolabs_offline`) databases

## Architecture

| Component | Path | Database |
|-----------|------|----------|
| **Gateway (connector)** | `gateway/` | Online PG (`bukolabs_online`) |
| **Admin API** | `Admin/apps/backend/` (wrapper) | Online PG via gateway |
| **SuperAdmin API** | `SuperAdmin/apps/backend/` (wrapper) | Online PG via gateway |
| **User sync API** | `User/apps/backend/` (wrapper) | Online PG via gateway |
| **User desktop app** | `User/user-interface-electron/` | Offline PG (`bukolabs_offline`) |

## Setup

From the **repository root**:

```bash
nvm use    # or fnm use — Node 20
npm install
npm run setup:all-databases
npm run dev:gateway
```

See [`shared/README.md`](shared/README.md) for schema, migrations, and entity details.
