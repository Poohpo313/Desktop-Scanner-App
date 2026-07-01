# Bukolabs API Gateway

Unified connector for all **online PostgreSQL** APIs. Admin, Super Admin, and User desktop sync share `bukolabs_online`.

**Cloud storage** (`/cloud/*`, e.g. Google Cloud Bucket) is a **separate planned extension** — those routes return placeholders only.

## Requirements

- **Node.js 20 LTS** (`>=20.0.0 <21`) on the deployment server
- **PostgreSQL** 14+ with database `bukolabs_online`
- Copy `gateway/.env.example` → `gateway/.env` and set credentials

## Architecture

```
                    ┌─────────────────────────────────────┐
                    │   @bukolabs/gateway  (port 3000)    │
                    │   GatewayModule — online PostgreSQL │
                    └──────────────┬──────────────────────┘
                                   │ bukolabs_online
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
  Admin frontend            SuperAdmin frontend         User Electron
  (axios :5174)             (axios :5175)              offline PG + /sync
         │                         │                         │
         └─────────────────────────┴─────────────────────────┘
```

| Backend | Role | Database | Default port |
|---------|------|----------|--------------|
| **Gateway** | Connects all online APIs | Online PG | 3000 |
| **Admin API** | Admin portal routes | Online PG | 3001 |
| **SuperAdmin API** | Super admin routes | Online PG | 3002 |
| **User API** | Online sync, device register | Online PG | 3003 |
| **User Electron** | Local scan/files/auth | **Offline PG** | — |
| **Cloud module** | Future GCS integration | — | placeholder |

## Commands

From repo root (Node 20 required — run `nvm use` / `fnm use` first):

```bash
npm install
npm run setup:all-databases
npm run dev:gateway
```

Build for production:

```bash
npm run build -w @bukolabs/gateway
node gateway/dist/main.js
```

## Production deployment (always-on, no browser)

End users **only open the Desktop Scanner `.exe`**. They never open a browser or terminal for the API.

The gateway is a **background server** (like PostgreSQL). Install it once on your office server or cloud host so it runs automatically:

```powershell
# Run once as Administrator on the server PC (Node 20 must be on PATH)
npm run install:gateway-service
```

This registers a Windows task that starts the gateway when Windows boots and keeps it running in the background.

| Who | What they do |
|-----|----------------|
| **IT / Admin** | Install PostgreSQL + Node 20 + gateway service once (`install:gateway-service`) |
| **End users** | Install Scanner `.exe`, set gateway URL once, then use the app normally |
| **Nobody** | Opens `localhost:3000` in a browser for daily work |

For remote users on different Wi‑Fi, host the gateway on a cloud server with a public URL (e.g. `https://gateway.yourcompany.com/api/v1`) and set that in the app’s **Gateway Server** settings.

Dev-only (manual, does not survive reboot):

```powershell
npm run start:gateway:bg
```

If `npm run dev:gateway` reports port 3000 is in use, the **BukolabsGateway** background task is usually already running. Either use that instance, or stop it (Administrator PowerShell):

```powershell
npm run stop:gateway-service
npm run dev:gateway
```
