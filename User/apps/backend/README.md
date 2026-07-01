# User online sync API

Runs the **User online sync API** (PostgreSQL + disk storage) on port **3003** via `@bukolabs/gateway`.

## Requirements

- **Node.js 20 LTS** (`>=20.0.0 <21`) on the server — install from the **repository root**
- Gateway built: `npm run build -w @bukolabs/gateway`

The desktop app uses **offline PostgreSQL** locally and syncs via `POST /api/v1/sync/documents` when online.

Cloud storage (`/cloud/*`) is a separate planned extension and is not part of this API.

## Development

```bash
# From repository root
nvm use
npm run dev:gateway
```

## Production

```bash
npm run start:prod -w @bukolabs/user-backend
```

Runs `gateway/dist/main.js` with `BACKEND_ROLE=user` on port **3003**.
