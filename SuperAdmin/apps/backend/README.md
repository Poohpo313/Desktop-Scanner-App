# Super Admin online API

Runs the **Super Admin portal backend** subset on port **3002** via `@bukolabs/gateway`.

## Requirements

- **Node.js 20 LTS** (`>=20.0.0 <21`) — install from the **repository root**
- Gateway built: `npm run build -w @bukolabs/gateway`

For development, use the unified gateway from the repo root:

```bash
nvm use
npm run dev:gateway
```

SuperAdmin frontend expects the unified gateway at `http://localhost:3000/api/v1`.

## Production

```bash
npm run start:prod -w @bukolabs/superadmin-backend
```

Runs `gateway/dist/main.js` with `BACKEND_ROLE=superadmin` on port **3002**.
