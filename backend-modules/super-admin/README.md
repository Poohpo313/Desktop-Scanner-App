# Super Admin Module

This folder handles backend logic for the Super Admin web app.

## Auth

- PIN-based JWT authentication
- Session timeout target: 5 minutes (strictest)

## Access Model

Super Admin has full unscoped access across all admins, users, keys, devices, cloud metrics, and system configuration.

## Endpoints

- `POST /api/super-admin/auth/login`
- `POST /api/super-admin/auth/logout`
- `POST /api/super-admin/auth/refresh`
- `POST /api/super-admin/auth/change-pin`
- `POST /api/super-admin/auth/forgot-access`
- `GET /api/super-admin/admins`
- `POST /api/super-admin/admins`
- `PATCH /api/super-admin/admins/:id`
- `DELETE /api/super-admin/admins/:id`
- `DELETE /api/super-admin/admins/:id/permanent`
- `PATCH /api/super-admin/admins/:id/restore`
- `GET /api/super-admin/users`
- `PATCH /api/super-admin/users/:id/cloud-verification`
- `POST /api/super-admin/keys/bulk-generate`
- `POST /api/super-admin/keys/assign-to-admin`
- `GET /api/super-admin/keys/history`
- `GET /api/super-admin/devices`
- `PATCH /api/super-admin/devices/:id/revoke`
- `GET /api/super-admin/devices/export.csv`
- `GET /api/super-admin/cloud/overview`
- `GET /api/super-admin/cloud/verification-list`
- `PATCH /api/super-admin/cloud/:id/verification`
- `POST /api/super-admin/backup/trigger`
- `GET /api/super-admin/backup/history`
- `POST /api/super-admin/backup/:id/restore`
- `DELETE /api/super-admin/backup/:id`
- `GET /api/super-admin/config`
- `PATCH /api/super-admin/config`
- `GET /api/super-admin/reports/summary`
- `GET /api/super-admin/reports/export.csv`

## Backup

Manual and scheduled backups are encrypted with AES-256-GCM.

## Role Management

Super admin can manage role-based permission policies for admin users.

## WebSocket Events

- `heartbeat.warning`
- `storage.warning`
- `backup.event`

## Dependencies

- Requires `backend-modules/shared/`.

## Status

- `auth.controller.ts` - IN PROGRESS
- `auth.service.ts` - IN PROGRESS
- `auth.dto.ts` - DONE
- `admins.controller.ts` - IN PROGRESS
- `admins.service.ts` - IN PROGRESS
- `admins.dto.ts` - DONE
- `users.controller.ts` - IN PROGRESS
- `users.service.ts` - IN PROGRESS
- `keys.controller.ts` - IN PROGRESS
- `keys.service.ts` - IN PROGRESS
- `keys.dto.ts` - DONE
- `devices.controller.ts` - IN PROGRESS
- `devices.service.ts` - IN PROGRESS
- `cloud.controller.ts` - IN PROGRESS
- `cloud.service.ts` - IN PROGRESS
- `backup.controller.ts` - IN PROGRESS
- `backup.service.ts` - IN PROGRESS
- `backup.scheduler.ts` - IN PROGRESS
- `config.controller.ts` - IN PROGRESS
- `config.service.ts` - IN PROGRESS
- `reports.controller.ts` - IN PROGRESS
- `reports.service.ts` - IN PROGRESS
- `notifications.gateway.ts` - IN PROGRESS
