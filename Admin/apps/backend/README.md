# Admin online API

This package runs the **Admin portal backend** — a subset of `@bukolabs/gateway` on port **3001**.

## Requirements

- **Node.js 20 LTS** (`>=20.0.0 <21`) — install from the **repository root**
- Gateway built: `npm run build -w @bukolabs/gateway`

For development, prefer the unified gateway:

```bash
# From repository root
nvm use
npm run dev:gateway
```

Admin frontend (`Admin/`) expects `http://localhost:3000/api/v1` by default.

## Production

```bash
npm run start:prod -w @bukolabs/admin-backend
```

Runs `gateway/dist/main.js` with `BACKEND_ROLE=admin` on port **3001**.
