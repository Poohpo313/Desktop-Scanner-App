# Bukolabs.io Modular Backend

> **Running API:** `gateway/` (`@bukolabs/gateway`). This folder holds shared migrations and reference code.

## Architecture

| Component | Path | Database |
|-----------|------|----------|
| **Gateway (connector)** | `gateway/` | Online PG (`bukolabs_online`) |
| **Admin API** | `Admin/apps/backend/` | Online PG |
| **SuperAdmin API** | `SuperAdmin/apps/backend/` | Online PG |
| **User sync API** | `User/apps/backend/` | Online PG |
| **User desktop app** | `User/user-interface-electron/` | Offline PG (`bukolabs_offline`) |
| **Cloud storage API** | `/cloud/*` in gateway | **Not implemented** (planned GCS extension) |

Online PostgreSQL and cloud bucket storage are **separate concerns**. Sync uses `/api/v1/sync` → online database, not `/cloud`.

## Setup

```bash
npm run setup:all-databases
npm run dev:gateway
```
