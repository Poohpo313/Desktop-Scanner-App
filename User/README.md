# Bukolabs Desktop Scanner (User app)

Electron desktop client for scanning, documents, and offline/online sync.

## Requirements

| Tool | Version |
|------|---------|
| **Node.js** | **20 LTS** (`>=20.0.0 <21`) |
| **npm** | `>=10.0.0` |

Install **Node.js 20 LTS** from https://nodejs.org/en/download/ (20.x line), or from the **monorepo root**:

```powershell
cd "c:\Desktop Scanner App"
nvm use 20
npm install
```

## Quick start

From the **repository root** (recommended — installs all workspaces):

```powershell
cd "c:\Desktop Scanner App"
npm install
npm run dev:user
```

Or from this folder only (nested workspace):

```powershell
cd User
npm install
npm run dev
```

This starts **Vite** on http://localhost:5173 and opens the **Electron** desktop window.

### Browser-only preview (no Electron)

```powershell
npm run dev:web -w user-interface-electron
```

Then open http://localhost:5173 in your browser.

## Troubleshooting

### `npm` not recognized

Install Node.js 20 LTS and restart the terminal.

### `EBADENGINE` on `npm install`

You are not on Node 20. Run `node -v` — it must show `v20.x.x`. Use `nvm use` in the repo root (see `.nvmrc`).

### PowerShell blocks `npm` scripts

Either run:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

or use `npm.cmd` instead of `npm`.

### First `npm run dev` is slow

The Electron main process is compiled on first launch; later starts are faster.
