# Bukolabs Desktop Scanner

## Quick start

From this folder (`user-interface-electron` — the repo root):

```powershell
npm install
npm run dev
```

This starts **Vite** on http://localhost:5173 and opens the **Electron** desktop window.

### Browser-only preview (no Electron)

```powershell
cd user-interface-electron
npm run dev:web
```

Then open http://localhost:5173 in your browser.

## Troubleshooting

### `npm` not recognized
Install Node.js LTS from https://nodejs.org and restart the terminal.

### PowerShell blocks `npm` scripts
Either run:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

(note the space before `-Scope`), or use `npm.cmd` instead of `npm`.

### `Could not read package.json`
Run commands from **this** folder (where this README lives), not only from a parent download folder.

### First `npm run dev` is slow
Electron downloads its binary on first launch. Wait until you see `VITE ready` and the app window opens.
