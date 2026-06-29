# Shared Backend Foundation

This folder contains reusable backend building blocks used by `user`, `admin`, and `super-admin` modules.

## Database Schema

Core tables and purpose:

- `roles` - access roles and permission metadata
- `users` - user/admin/super-admin identities and auth fields
- `serial_keys` - one-time activation/distribution keys
- `devices` - desktop device identity and status
- `folders` - logical document folders
- `documents` - scanned file metadata, OCR text, and hash
- `scan_history` - scan event timeline
- `activity_logs` - actor/action audit trail
- `cloud_sync` - sync queue and state tracking
- `backups` - encrypted backup metadata and lifecycle

## Migrations

### Online — PostgreSQL (`bukolabs_online`)

```powershell
npm run setup:db
npm run test:postgres-online
```

Migration: `migrations/online/001_initial_schema.postgres.sql`  
Env file: `.env.online`

### Offline — PostgreSQL (`bukolabs_offline`)

```powershell
npm run setup:postgres-offline
npm run test:postgres-offline
```

Migration: `migrations/offline/001_initial_schema.postgres.sql`  
Env file: `.env.offline`

Both databases can be set up together:

```powershell
npm run setup:all-databases
```

## Entities

TypeORM entities map one-to-one to the schema tables on both databases:

- `UserEntity` -> `users`
- `RoleEntity` -> `roles`
- `SerialKeyEntity` -> `serial_keys`
- `DocumentEntity` -> `documents`
- `FolderEntity` -> `folders`
- `DeviceEntity` -> `devices`
- `ScanHistoryEntity` -> `scan_history`
- `ActivityLogEntity` -> `activity_logs`
- `CloudSyncEntity` -> `cloud_sync`
- `BackupEntity` -> `backups`

## Guards

- `JwtAuthGuard` validates Bearer JWTs and attaches claims to request context.
- `RolesGuard` checks route role metadata set by `@Roles(...)`.

Apply to routes with `@UseGuards(JwtAuthGuard, RolesGuard)`.

## Utilities

- `argon2.util.ts` - secure hash and verify helpers
- `uuid-key.util.ts` - serial key generation (`XXXX-XXXX-XXXX-XXXX`)
- `sha256.util.ts` - SHA-256 helper for binary and text data
- `aes-encrypt.util.ts` - AES-256-GCM encrypt/decrypt helpers

## Two-Database Note

| Database | Engine | Config export | Client |
|----------|--------|---------------|--------|
| Online | PostgreSQL | `onlineDataSource` | TypeORM in NestJS backend |
| Offline | PostgreSQL | `offlineDataSource` | `pg` in Electron desktop app |

- Both use PostgreSQL `tsvector` for OCR full-text search.
- Same schema contract; different database names on the same local/server PostgreSQL instance.
- Keep migrations in sync when adding features:
  - `migrations/online/*.postgres.sql`
  - `migrations/offline/*.postgres.sql`

## Adding New Entities or Migrations

1. Add a new TypeORM entity under `entities/`.
2. Update relationship mappings where needed.
3. Add forward migrations for **both** online and offline PostgreSQL folders.
4. Update this README and module import lists.
