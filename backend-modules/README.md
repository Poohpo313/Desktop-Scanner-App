# Bukolabs.io Shared Backend Assets

> **Running API:** `gateway/` (`@bukolabs/gateway`). This folder holds shared migrations and utilities.

## Architecture

| Component | Path | Database |
|-----------|------|----------|
| **Gateway (connector)** | `gateway/` | Online PG (`bukolabs_online`) |
| **Admin API** | `Admin/apps/backend/` (wrapper) | Online PG via gateway |
| **SuperAdmin API** | `SuperAdmin/apps/backend/` (wrapper) | Online PG via gateway |
| **User sync API** | `User/apps/backend/` (wrapper) | Online PG via gateway |
| **User desktop app** | `User/user-interface-electron/` | Offline PG (`bukolabs_offline`) |

## Setup

```bash
npm run setup:all-databases
npm run dev:gateway
```
