# User Module

This folder handles backend logic for regular users of the desktop app.

## Auth

- JWT Bearer token
- Session timeout target: 15 minutes of inactivity
- Serial key activation is one-time-use and executed in an atomic transaction

## Endpoints

- `POST /api/user/auth/login`
- `POST /api/user/auth/logout`
- `POST /api/user/auth/refresh`
- `POST /api/user/auth/activate`
- `POST /api/user/documents/upload`
- `GET /api/user/documents`
- `DELETE /api/user/documents/:id`
- `POST /api/user/sync/batch`
- `GET /api/user/search`
- `GET /api/user/settings`
- `PATCH /api/user/settings`
- `POST /api/user/keys/activate`

## Cloud Sync

Batch sync accepts queued records from the offline PostgreSQL desktop database and deduplicates by SHA-256 hash before writing sync state to the online PostgreSQL database.

## Dependencies

- Requires `backend-modules/shared/` for entities, guards, decorators, and utilities.

## Test Examples

Login:

```bash
curl -X POST http://localhost:3000/api/user/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"UserPass123!"}'
```

Document upload:

```bash
curl -X POST http://localhost:3000/api/user/documents/upload \
  -H "Authorization: Bearer <token>" \
  -F "filename=sample.pdf" \
  -F "mimeType=application/pdf" \
  -F "base64Content=<base64>"
```

## Status

- `auth.controller.ts` - IN PROGRESS
- `auth.service.ts` - IN PROGRESS
- `auth.dto.ts` - DONE
- `documents.controller.ts` - IN PROGRESS
- `documents.service.ts` - IN PROGRESS
- `documents.dto.ts` - DONE
- `sync.controller.ts` - IN PROGRESS
- `sync.service.ts` - IN PROGRESS
- `search.controller.ts` - IN PROGRESS
- `search.service.ts` - IN PROGRESS
- `settings.controller.ts` - IN PROGRESS
- `settings.service.ts` - IN PROGRESS
- `keys.controller.ts` - IN PROGRESS
- `keys.service.ts` - IN PROGRESS
