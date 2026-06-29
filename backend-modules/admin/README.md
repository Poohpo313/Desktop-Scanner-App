# Admin Module

This folder handles backend logic for the Admin web app.

## Auth

- JWT Bearer token
- Session timeout target: 10 minutes

## Scope

Admins can only manage users assigned to them.

## Endpoints

- `POST /api/admin/auth/login`
- `POST /api/admin/auth/logout`
- `POST /api/admin/auth/refresh`
- `POST /api/admin/auth/forgot-credentials`
- `GET /api/admin/users`
- `POST /api/admin/users`
- `PATCH /api/admin/users/:id`
- `DELETE /api/admin/users/:id`
- `PATCH /api/admin/users/:id/restore`
- `POST /api/admin/keys/generate`
- `POST /api/admin/keys/assign`
- `PATCH /api/admin/keys/:id/revoke`
- `PATCH /api/admin/keys/:id/deactivate`
- `GET /api/admin/keys`
- `GET /api/admin/devices`
- `PATCH /api/admin/devices/:id/flag-inactive`
- `GET /api/admin/reports/summary`
- `GET /api/admin/reports/export.csv`

## Key Management

Generate, assign, revoke, and deactivate keys with one-time-use enforcement.

## WebSocket Events

- `device.inactive`
- `key.used`
- `sync.progress`

## Dependencies

- Requires `backend-modules/shared/`.

## Status

- `auth.controller.ts` - IN PROGRESS
- `auth.service.ts` - IN PROGRESS
- `auth.dto.ts` - DONE
- `users.controller.ts` - IN PROGRESS
- `users.service.ts` - IN PROGRESS
- `users.dto.ts` - DONE
- `keys.controller.ts` - IN PROGRESS
- `keys.service.ts` - IN PROGRESS
- `keys.dto.ts` - DONE
- `devices.controller.ts` - IN PROGRESS
- `devices.service.ts` - IN PROGRESS
- `reports.controller.ts` - IN PROGRESS
- `reports.service.ts` - IN PROGRESS
- `notifications.gateway.ts` - IN PROGRESS
