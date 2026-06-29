# User online sync API

Runs the **User online sync API** (PostgreSQL + disk storage) on port **3003** via `@bukolabs/gateway`.

The desktop app uses **offline PostgreSQL** locally and syncs via `POST /api/v1/sync/documents` when online.

Cloud storage (`/cloud/*`) is a separate planned extension and is not part of this API.
